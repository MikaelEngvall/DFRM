package com.dfrm.service;

import java.time.LocalDateTime;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
            log.error("E-postkonfiguration är inte korrekt konfigurerad");
            return;
        }
        
        // I utvecklingsmiljö, logga men fortsätt körningen
        boolean isDev = isDevEnvironment();
        if (isDev) {
            log.info("Kör i utvecklingsmiljö - kommer att leta efter e-post med Reply-To: {}", TARGET_REPLY_TO);
            log.info("E-postkonfiguration: host={}, port={}, username={}", 
                mailProperties.getHost(), mailProperties.getIntressePort(), mailProperties.getIntresseUsername());
        }
        
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
                
                for (Message message : messages) {
                    try {
                        // Kontrollera reply-to adressen före bearbetning
                        Address[] replyTo = message.getReplyTo();
                        boolean validReplyTo = false;
                        
                        if (replyTo != null && replyTo.length > 0) {
                            for (Address address : replyTo) {
                                if (address instanceof InternetAddress 
                                    && TARGET_REPLY_TO.equals(((InternetAddress) address).getAddress())) {
                                    validReplyTo = true;
                                    break;
                                }
                            }
                        }
                        
                        if (validReplyTo) {
                            processEmail(message);
                        } else {
                            log.info("E-post ignorerad - ogiltig reply-to adress");
                        }
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
        String contentText = getTextFromMessage(message);
        
        log.info("Ämne: {}", subject);
        log.info("Innehåll (första 100 tecken): {}", 
            contentText.length() > 100 ? contentText.substring(0, 100) + "..." : contentText);
        
        // Skapa Interest-objekt
        Interest interest = new Interest();
        interest.setStatus("NEW");
        interest.setReceived(LocalDateTime.now());
        interest.setApartment(subject); // Ämnet är lägenheten
        
        // Analysera e-postinnehållet för att extrahera information
        extractDetailsFromEmail(contentText, interest);
        
        // Sätt svenskt språk som standard
        interest.setMessageLanguage(Language.SV);
        
        // I en framtida version kan vi implementera språkdetektering och översättning
        // Om vi hade en mer komplett TranslationService
        
        // Spara intresseanmälan i databasen
        Interest savedInterest = interestRepository.save(interest);
        log.info("Intresseanmälan sparad med ID: {}", savedInterest.getId());
        
        // Markera e-postmeddelandet som läst
        message.setFlag(jakarta.mail.Flags.Flag.SEEN, true);
    }
    
    private void extractDetailsFromEmail(String content, Interest interest) {
        log.info("Extraherar detaljer från e-postinnehåll...");
        
        // Rensa HTML-innehåll om det finns
        content = cleanHtmlContent(content);
        
        // Ersätt <br> med radbrytningar för att hantera olika format
        content = content.replaceAll("<br>", "\n").replaceAll("<br/>", "\n").replaceAll("<br />", "\n");
        
        // Extrahera format 1: Namn: Tuva Andersson, E-post: ...
        if (content.contains("Namn:") && content.contains("E-post:")) {
            log.info("Detekterade strukturerat format med 'Namn:', 'E-post:' etc.");
            
            // Extrahera namn
            Pattern namePattern = Pattern.compile("Namn:\\s*(.+?)\\s*(?:\\r?\\n|$|E-post:)", Pattern.CASE_INSENSITIVE);
            Matcher nameMatcher = namePattern.matcher(content);
            if (nameMatcher.find()) {
                interest.setName(nameMatcher.group(1).trim());
                log.info("Extraherat namn: {}", interest.getName());
            }
            
            // Extrahera e-post
            Pattern emailPattern = Pattern.compile("E-post:\\s*(.+?)\\s*(?:\\r?\\n|$|Tel:)", Pattern.CASE_INSENSITIVE);
            Matcher emailMatcher = emailPattern.matcher(content);
            if (emailMatcher.find()) {
                interest.setEmail(emailMatcher.group(1).trim());
                log.info("Extraherad e-post: {}", interest.getEmail());
            }
            
            // Extrahera telefon
            Pattern phonePattern = Pattern.compile("Tel(?:efon)?(?:nummer)?:\\s*(.+?)\\s*(?:\\r?\\n|$|Meddelande:)", Pattern.CASE_INSENSITIVE);
            Matcher phoneMatcher = phonePattern.matcher(content);
            if (phoneMatcher.find()) {
                interest.setPhone(phoneMatcher.group(1).trim());
                log.info("Extraherat telefonnummer: {}", interest.getPhone());
            }
            
            // Extrahera meddelande
            Pattern messagePattern = Pattern.compile("Meddelande:\\s*(.+?)\\s*(?:---|Datum:|Sidans URL:)", Pattern.DOTALL | Pattern.CASE_INSENSITIVE);
            Matcher messageMatcher = messagePattern.matcher(content);
            if (messageMatcher.find()) {
                interest.setMessage(messageMatcher.group(1).trim());
                log.info("Extraherat meddelande (första 50 tecken): {}", 
                    interest.getMessage().length() > 50 ? interest.getMessage().substring(0, 50) + "..." : interest.getMessage());
            }
        } 
        // Format 2: Fritext utan tydliga markörer
        else if (content.contains("@") && !content.contains("Namn:")) {
            log.info("Detekterade ostrukturerat format, försöker extrahera information");
            
            // Dela upp texten på rader
            String[] lines = content.split("\\r?\\n");
            
            // Hitta namn (första raden som inte innehåller @, http, www)
            for (String line : lines) {
                line = line.trim();
                if (!line.isEmpty() && !line.contains("@") && !line.contains("http") && !line.contains("www") && 
                    !line.matches(".*\\d{4}-\\d{2}-\\d{2}.*")) {
                    interest.setName(line);
                    log.info("Extraherat namn: {}", interest.getName());
                    break;
                }
            }
            
            // Hitta e-post (första raden som innehåller @)
            for (String line : lines) {
                if (line.contains("@")) {
                    Pattern emailPattern = Pattern.compile("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b");
                    Matcher emailMatcher = emailPattern.matcher(line);
                    if (emailMatcher.find()) {
                        interest.setEmail(emailMatcher.group());
                        log.info("Extraherad e-post: {}", interest.getEmail());
                        break;
                    }
                }
            }
            
            // Hitta telefonnummer (första raden som innehåller telefonnummer)
            for (String line : lines) {
                Pattern phonePattern = Pattern.compile("\\b(?:\\+?\\d{1,3}[- ]?)?\\d{6,12}\\b");
                Matcher phoneMatcher = phonePattern.matcher(line);
                if (phoneMatcher.find()) {
                    interest.setPhone(phoneMatcher.group());
                    log.info("Extraherat telefonnummer: {}", interest.getPhone());
                    break;
                }
            }
            
            // Extrahera meddelande (den längsta sammanhängande texten)
            StringBuilder messageBuilder = new StringBuilder();
            boolean inMessage = false;
            
            for (String line : lines) {
                if (line.contains("Meddelande:") || line.contains("Hej") || line.contains("Jag är intresserad")) {
                    inMessage = true;
                    // Ta bort "Meddelande:" från början av meddelandet
                    line = line.replaceAll("^Meddelande:\\s*", "");
                }
                
                if (inMessage && !line.contains("Datum:") && !line.contains("Sidans URL:") && !line.contains("---")) {
                    messageBuilder.append(line).append("\n");
                }
                
                if (inMessage && (line.contains("---") || line.contains("Datum:") || line.contains("Sidans URL:"))) {
                    break;
                }
            }
            
            if (messageBuilder.length() > 0) {
                interest.setMessage(messageBuilder.toString().trim());
                log.info("Extraherat meddelande (första 50 tecken): {}", 
                    interest.getMessage().length() > 50 ? interest.getMessage().substring(0, 50) + "..." : interest.getMessage());
            }
        }
        
        // Extrahera sidans URL
        Pattern urlPattern = Pattern.compile("Sidans URL:\\s*(.+?)\\s+(?:Användaragent:|$)", Pattern.CASE_INSENSITIVE);
        Matcher urlMatcher = urlPattern.matcher(content);
        if (urlMatcher.find()) {
            interest.setPageUrl(urlMatcher.group(1).trim());
            log.info("Extraherad URL: {}", interest.getPageUrl());
        } else {
            // Fallback: Leta efter URL i texten
            Pattern httpPattern = Pattern.compile("(https?://[^\\s]+)\\s+Användaragent:");
            Matcher httpMatcher = httpPattern.matcher(content);
            if (httpMatcher.find()) {
                interest.setPageUrl(httpMatcher.group(1).trim());
                log.info("Extraherad URL från fritext: {}", interest.getPageUrl());
            } else {
                // Sista försök: Leta efter vilken URL som helst
                Pattern anyHttpPattern = Pattern.compile("(https?://[^\\s]+)");
                Matcher anyHttpMatcher = anyHttpPattern.matcher(content);
                if (anyHttpMatcher.find()) {
                    interest.setPageUrl(anyHttpMatcher.group(1).trim());
                    log.info("Extraherad URL från allmänt sökmönster: {}", interest.getPageUrl());
                }
            }
        }
        
        // Extrahera datum om det inte redan finns
        if (interest.getReceived() == null) {
            Pattern datePattern = Pattern.compile("Datum:\\s*(\\d{4}-\\d{2}-\\d{2})", Pattern.CASE_INSENSITIVE);
            Matcher dateMatcher = datePattern.matcher(content);
            if (dateMatcher.find()) {
                String dateStr = dateMatcher.group(1);
                interest.setReceived(LocalDateTime.parse(dateStr + "T00:00:00"));
                log.info("Extraherat datum: {}", dateStr);
            }
        }
        
        // Extrahera användarinformation
        Pattern userAgentPattern = Pattern.compile("Användaragent:\\s*(.+?)\\s*(?:\\r?\\n|$)", Pattern.CASE_INSENSITIVE);
        Matcher userAgentMatcher = userAgentPattern.matcher(content);
        if (userAgentMatcher.find()) {
            interest.setUserAgent(userAgentMatcher.group(1).trim());
        }
        
        // Extrahera IP-adress
        Pattern ipPattern = Pattern.compile("(?:Fjärr IP|IP|IP-adress):\\s*(.+?)\\s*(?:\\r?\\n|$)", Pattern.CASE_INSENSITIVE);
        Matcher ipMatcher = ipPattern.matcher(content);
        if (ipMatcher.find()) {
            interest.setRemoteIp(ipMatcher.group(1).trim());
        }
        
        // Logga resultaten
        log.info("Extraherad information: Namn='{}', E-post='{}', Telefon='{}', Meddelande='{}', URL='{}'", 
                interest.getName(), interest.getEmail(), interest.getPhone(), 
                interest.getMessage() != null && interest.getMessage().length() > 20 ? 
                    interest.getMessage().substring(0, 20) + "..." : interest.getMessage(),
                interest.getPageUrl());
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

    private String cleanHtmlContent(String content) {
        if (content == null) {
            return "";
        }
        
        // Behåll <br>-taggar tillfälligt
        content = content.replaceAll("<br>", "###BR###").replaceAll("<br/>", "###BR###").replaceAll("<br />", "###BR###");
        
        // Ta bort andra HTML-taggar
        content = content.replaceAll("<[^>]*>", " ");
        
        // Återställ <br>-taggar till radbrytningar
        content = content.replaceAll("###BR###", "\n");
        
        // Ta bort överflödiga mellanslag
        content = content.replaceAll("\\s+", " ");
        
        // Konvertera HTML-entiteter
        content = content.replaceAll("&nbsp;", " ")
                       .replaceAll("&amp;", "&")
                       .replaceAll("&lt;", "<")
                       .replaceAll("&gt;", ">");
        
        return content.trim();
    }
} 