package com.dfrm.service;

import java.time.LocalDateTime;
import java.util.Properties;

import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.dfrm.client.GoogleTranslateClient;
import com.dfrm.config.JavaMailProperties;
import com.dfrm.model.Interest;
import com.dfrm.model.Language;
import com.dfrm.repository.InterestRepository;

import jakarta.mail.Address;
import jakarta.mail.BodyPart;
import jakarta.mail.Flags;
import jakarta.mail.Folder;
import jakarta.mail.Message;
import jakarta.mail.Session;
import jakarta.mail.Store;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMultipart;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterestEmailListener {
    
    private final JavaMailProperties mailProperties;
    private final InterestRepository interestRepository;
    private final Environment environment;
    private final TranslationService translationService;
    private final GoogleTranslateClient googleTranslateClient;
    
    private static final String TARGET_RECIPIENT = "intresse@duggalsfastigheter.se";
    private static final String TARGET_SENDER = "intresse@duggalsfastigheter.se";
    private static final String TARGET_REPLY_TO = "mikael.engvall.me@gmail.com";

    private boolean isDevEnvironment() {
        String[] activeProfiles = environment.getActiveProfiles();
        for (String profile : activeProfiles) {
            if ("dev".equals(profile)) {
                return true;
            }
        }
        return false;
    }

    @Scheduled(fixedDelay = 60000) // Kör varje minut
    public void checkEmails() {
        log.info("Kontrollerar intresse-e-post...");
        
        // Skydda mot null-värden
        if (mailProperties == null || 
            mailProperties.getHost() == null || 
            mailProperties.getIntresseUsername() == null || 
            mailProperties.getIntressePassword() == null) {
            log.error("E-postkonfiguration är inte korrekt konfigurerad. mailProperties={}, host={}, username={}, password={}",
                    mailProperties != null ? "not null" : "null",
                    mailProperties != null ? mailProperties.getHost() : "null",
                    mailProperties != null ? mailProperties.getIntresseUsername() : "null",
                    mailProperties != null && mailProperties.getIntressePassword() != null ? "has value" : "null");
            return;
        }
        
        // I utvecklingsmiljö, logga men fortsätt körningen
        boolean isDev = isDevEnvironment();
        if (isDev) {
            log.info("Kör i utvecklingsmiljö - kommer att leta efter e-post med Reply-To: {}", TARGET_REPLY_TO);
            log.info("E-postkonfiguration: host={}, port={}, username={}", 
                mailProperties.getHost(), mailProperties.getIntressePort(), mailProperties.getIntresseUsername());
        }
        
        // Logga e-postvariabler från environment för felsökning
        log.info("Miljövariabler för intresse-e-post:");
        log.info("EMAIL_PORT_INTRESSE={}, EMAIL_USER_INTRESSE={}, EMAIL_PASSWORD_INTRESSE={}",
                environment.getProperty("EMAIL_PORT_INTRESSE"),
                environment.getProperty("EMAIL_USER_INTRESSE"),
                environment.getProperty("EMAIL_PASSWORD_INTRESSE") != null ? "******" : "null");
        
        // Använd port för IMAPS (inkommande e-post)
        Properties properties = System.getProperties();
        properties.put("mail.store.protocol", "imaps");
        properties.put("mail.imaps.host", mailProperties.getHost());
        properties.put("mail.imaps.port", String.valueOf(mailProperties.getIntressePort()));
        
        // SSL-inställningar för IMAPS
        properties.put("mail.imaps.ssl.enable", "true");
        properties.put("mail.imaps.ssl.trust", "*");
        properties.put("mail.imaps.ssl.protocols", "TLSv1.2 TLSv1.1 TLSv1");
        
        // Socket factory för IMAPS SSL
        properties.put("mail.imaps.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
        properties.put("mail.imaps.socketFactory.fallback", "false");
        properties.put("mail.imaps.socketFactory.port", String.valueOf(mailProperties.getIntressePort()));
        
        // Debug och timeouts
        properties.put("mail.debug", isDev ? "true" : "false");
        properties.put("mail.imaps.connectiontimeout", "20000");
        properties.put("mail.imaps.timeout", "20000");
        
        // Inaktivera strikta certifikatkontroller för utveckling
        if (isDev) {
            properties.put("mail.imaps.ssl.checkserveridentity", "false");
            log.info("Inaktiverade strikta certifikatkontroller för utveckling");
        }

        try {
            log.info("Skapar e-postsession med värd: {}, port: {}", 
                mailProperties.getHost(), mailProperties.getIntressePort());
                
            Session session = Session.getInstance(properties);
            session.setDebug(isDev);
            
            log.info("Ansluter till e-postserver med användarnamn: {}", mailProperties.getIntresseUsername());
            
            // Använd try-with-resources för att säkerställa att Store stängs ordentligt
            try (Store store = session.getStore("imaps")) {
                store.connect(
                    mailProperties.getHost(),
                    mailProperties.getIntressePort(),
                    mailProperties.getIntresseUsername(),
                    mailProperties.getIntressePassword()
                );
                
                log.info("Anslutningen till e-postservern lyckades");

                Folder inbox = store.getFolder("INBOX");
                inbox.open(Folder.READ_WRITE);
                
                // Hämta alla olästa meddelanden
                Message[] messages = inbox.search(
                    new jakarta.mail.search.FlagTerm(
                        new jakarta.mail.Flags(jakarta.mail.Flags.Flag.SEEN), 
                        false
                    )
                );
                
                log.info("Hittade {} olästa meddelanden", messages.length);
                
                if (messages.length == 0) {
                    log.info("Inga olästa meddelanden hittades i inkorgen");
                    return;
                }
                
                for (Message message : messages) {
                    try {
                        log.info("Bearbetar meddelande med ämne: {}", message.getSubject());
                        
                        // I utvecklingsmiljö, processera alla e-postmeddelanden för testning
                        if (isDev) {
                            log.info("Kör i utvecklingsmiljö - processerar meddelandet");
                            processEmail(message);
                            continue;
                        }
                        
                        // Kontrollera avsändaradress
                        Address[] fromAddresses = message.getFrom();
                        if (fromAddresses != null && fromAddresses.length > 0) {
                            for (Address address : fromAddresses) {
                                if (address instanceof InternetAddress) {
                                    String fromAddress = ((InternetAddress) address).getAddress();
                                    log.info("E-post från: {}", fromAddress);
                                }
                            }
                        }
                        
                        // Kontrollera mottagaradress
                        Address[] toAddresses = message.getRecipients(Message.RecipientType.TO);
                        if (toAddresses != null) {
                            for (Address address : toAddresses) {
                                if (address instanceof InternetAddress) {
                                    String toAddress = ((InternetAddress) address).getAddress();
                                    log.info("E-post till: {}", toAddress);
                                    
                                    // Kolla om e-posten är till TARGET_RECIPIENT
                                    if (TARGET_RECIPIENT.equalsIgnoreCase(toAddress)) {
                                        log.info("E-post är till korrekt mottagare: {}", TARGET_RECIPIENT);
                                        processEmail(message);
                                        break;
                                    }
                                }
                            }
                        }
                        
                        // Kontrollera reply-to adressen
                        Address[] replyTo = message.getReplyTo();
                        if (replyTo != null && replyTo.length > 0) {
                            for (Address address : replyTo) {
                                if (address instanceof InternetAddress) {
                                    String replyToAddress = ((InternetAddress) address).getAddress();
                                    log.info("Hittade reply-to adress: {}", replyToAddress);
                                    
                                    if (TARGET_REPLY_TO.equals(replyToAddress)) {
                                        log.info("Hittade matching reply-to adress: {}", replyToAddress);
                                        processEmail(message);
                                        break;
                                    }
                                }
                            }
                        }
                        
                        // Markera meddelandet som läst i alla fall
                        message.setFlag(Flags.Flag.SEEN, true);
                    } catch (Exception e) {
                        log.error("Fel vid bearbetning av e-post: {}", e.getMessage(), e);
                    }
                }
                
                inbox.close(false);
            }
        } catch (Exception e) {
            log.error("Fel vid kontroll av e-post: {}", e.getMessage(), e);
            if (e.getCause() != null) {
                log.error("Orsakad av: {}", e.getCause().getMessage(), e.getCause());
            }
        }
    }

    private void processEmail(Message message) throws Exception {
        log.info("Bearbetar intresse-e-post...");
        
        String subject = message.getSubject();
        String content = getTextFromMessage(message);
        String senderEmail = InternetAddress.toString(message.getReplyTo());
        
        log.debug("Processing email with subject: {}", subject);
        log.debug("Email content: {}", content);
        
        // Rensa HTML-innehåll först
        content = cleanHtmlContent(content);
        
        // Extrahera lägenhetsinformation från ämnet
        String apartment = subject;
        if (subject.contains(":")) {
            apartment = subject.substring(subject.indexOf(":") + 1).trim();
        }
        
        // Extrahera information från meddelandeinnehållet
        String name = extractBeforeDelimiter(content, "Namn:", "<br");
        String email = extractBeforeDelimiter(content, "E-post:", "<br");
        String phone = extractBeforeDelimiter(content, "Tel:", "<br");
        
        // Extrahera meddelandet mellan "Meddelande: " och "---"
        String messageText = "";
        int messageStart = content.indexOf("Meddelande:");
        int messageEnd = content.indexOf("---", messageStart);
        
        if (messageStart != -1 && messageEnd != -1) {
            messageStart += "Meddelande:".length();
            // Extrahera och bevara riktiga radbrytningar
            messageText = content.substring(messageStart, messageEnd)
                .replace("<br>", "\n")
                .replace("<br/>", "\n")
                .replace("<br />", "\n")
                .trim();
        }
        
        // Extrahera sidans URL
        String pageUrl = extractBeforeDelimiter(content, "Sidans URL:", "<br");
        
        log.info("Extraherad information från e-post:");
        log.info("* Ämne: {}", subject);
        log.info("* Namn: {}", name);
        log.info("* E-post: {}", email);
        log.info("* Telefon: {}", phone);
        log.info("* Meddelande: {}", messageText.length() > 100 ? messageText.substring(0, 100) + "..." : messageText);
        log.info("* Sidans URL: {}", pageUrl);
        log.info("* Lägenhet: {}", apartment);
        
        // Identifiera meddelandespråk
        Language detectedLanguage = Language.SV; // Standardvärde
        
        // Skapa intresseanmälan
        Interest interest = Interest.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .message(messageText)
                .apartment(apartment)
                .pageUrl(pageUrl)
                .messageLanguage(detectedLanguage)
                .received(LocalDateTime.now())
                .status("NEW")
                .build();
        
        Interest savedInterest = interestRepository.save(interest);
        log.info("Sparade intresseanmälan från e-post med ID: {}", savedInterest.getId());
        
        // Markera e-postmeddelandet som läst
        message.setFlag(Flags.Flag.SEEN, true);
    }
    
    // Hjälpmetod för att extrahera text före en avgränsare
    private String extractBeforeDelimiter(String content, String startMarker, String endMarker) {
        int start = content.indexOf(startMarker);
        if (start == -1) return "";
        
        start += startMarker.length();
        
        // Trimma bort inledande mellanslag
        while (start < content.length() && Character.isWhitespace(content.charAt(start))) {
            start++;
        }
        
        int end;
        if (endMarker.equals("\n")) {
            end = content.indexOf("\n", start);
        } else {
            end = content.indexOf(endMarker, start);
        }
        
        if (end == -1) {
            // Om ingen avgränsare hittades, ta resten av innehållet eller till nästa rad
            end = content.indexOf("\n", start);
            if (end == -1) {
                return content.substring(start).trim();
            }
        }
        
        return content.substring(start, end).trim();
    }
    
    // Förbättrad metod för att rensa HTML-innehåll
    private String cleanHtmlContent(String content) {
        if (content == null) {
            return "";
        }
        
        // Ersätt HTML-entiteter
        content = content.replaceAll("&nbsp;", " ")
                         .replaceAll("&amp;", "&")
                         .replaceAll("&lt;", "<")
                         .replaceAll("&gt;", ">");
        
        // Behåll <br>-taggar som de är för att hantera dem senare i parsningen
        
        return content;
    }

    private String getTextFromMessage(Message message) throws Exception {
        log.info("Meddelandetyp: {}", message.getContentType());
        
        if (message.isMimeType("text/plain")) {
            Object content = message.getContent();
            log.info("Textinnehåll: {}", content);
            return content.toString();
        }
        
        if (message.isMimeType("multipart/*")) {
            MimeMultipart mimeMultipart = (MimeMultipart) message.getContent();
            log.info("Hittade fleradressat-meddelande med {} delar", mimeMultipart.getCount());
            return getTextFromMimeMultipart(mimeMultipart);
        }
        
        log.warn("Meddelandetyp som inte stöds: {}", message.getContentType());
        return message.getContent().toString();
    }

    private String getTextFromMimeMultipart(MimeMultipart mimeMultipart) throws Exception {
        StringBuilder result = new StringBuilder();
        int count = mimeMultipart.getCount();
        
        for (int i = 0; i < count; i++) {
            BodyPart bodyPart = mimeMultipart.getBodyPart(i);
            log.info("Bearbetar del {} av typ {}", i, bodyPart.getContentType());
            
            if (bodyPart.isMimeType("text/plain")) {
                result.append(bodyPart.getContent());
            }
            else if (bodyPart.isMimeType("text/html")) {
                log.info("Hittade HTML-innehåll i del {}", i);
                // Extrahera text från HTML
                String htmlContent = bodyPart.getContent().toString();
                result.append(htmlContent);
            }
            else if (bodyPart.getContent() instanceof MimeMultipart) {
                result.append(getTextFromMimeMultipart((MimeMultipart)bodyPart.getContent()));
            }
        }
        
        String text = result.toString();
        log.info("Extraherat textinnehåll (första 200 tecken): \n{}", 
            text.length() > 200 ? text.substring(0, 200) + "..." : text);
        return text;
    }
} 