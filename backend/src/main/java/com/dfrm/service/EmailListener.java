package com.dfrm.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;

import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.dfrm.client.GoogleTranslateClient;
import com.dfrm.config.JavaMailProperties;
import com.dfrm.model.Apartment;
import com.dfrm.model.Language;
import com.dfrm.model.PendingTask;
import com.dfrm.model.Tenant;
import com.dfrm.repository.ApartmentRepository;
import com.dfrm.repository.PendingTaskRepository;
import com.dfrm.repository.TenantRepository;

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
public class EmailListener {
    
    private final JavaMailProperties mailProperties;
    private final PendingTaskRepository pendingTaskRepository;
    private final Environment environment;
    private final TranslationService translationService;
    private final GoogleTranslateClient googleTranslateClient;
    private final TenantRepository tenantRepository;
    private final ApartmentRepository apartmentRepository;
    
    private static final String TARGET_RECIPIENT = "felanmalan@duggalsfastigheter.se";
    private static final String TARGET_SENDER = "felanmalan@duggalsfastigheter.se";
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
        log.info("Checking emails...");
        
        // Skydda mot null-värden
        if (mailProperties == null || 
            mailProperties.getHost() == null || 
            mailProperties.getListeningUsername() == null || 
            mailProperties.getListeningPassword() == null) {
            log.error("Mail properties are not properly configured: {}", mailProperties);
            return;
        }
        
        // I utvecklingsmiljö, logga men fortsätt körningen
        boolean isDev = isDevEnvironment();
        if (isDev) {
            log.info("Running in dev environment - will look for emails with Reply-To: {}", TARGET_REPLY_TO);
            log.info("Mail listening properties: host={}, port={}, username={}", 
                mailProperties.getHost(), mailProperties.getListeningPort(), mailProperties.getListeningUsername());
        }
        
        // Använd port 993 för IMAPS (inkommande e-post) oavsett konfiguration
        Properties properties = System.getProperties();
        properties.put("mail.store.protocol", "imaps");
        properties.put("mail.imaps.host", mailProperties.getHost());
        properties.put("mail.imaps.port", "993");
        
        // SSL-inställningar för IMAPS
        properties.put("mail.imaps.ssl.enable", "true");
        properties.put("mail.imaps.ssl.trust", "*");
        properties.put("mail.imaps.ssl.protocols", "TLSv1.2 TLSv1.1 TLSv1");
        
        // Socket factory för IMAPS SSL
        properties.put("mail.imaps.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
        properties.put("mail.imaps.socketFactory.fallback", "false");
        properties.put("mail.imaps.socketFactory.port", "993");
        
        // Debug och timeouts
        properties.put("mail.debug", isDev ? "true" : "false");
        properties.put("mail.imaps.connectiontimeout", "20000");
        properties.put("mail.imaps.timeout", "20000");
        
        // Inaktivera strikta certifikatkontroller för utveckling
        if (isDev) {
            properties.put("mail.imaps.ssl.checkserveridentity", "false");
            log.info("Disabled strict certificate checks for development");
        }

        try {
            log.info("Creating mail session with host: {}, port: 993 (IMAPS)", 
                mailProperties.getHost());
                
            Session session = Session.getInstance(properties);
            session.setDebug(isDev);
            
            log.info("Connecting to mail server with username: {}", mailProperties.getListeningUsername());
            
            // Använd try-with-resources för att säkerställa att Store stängs ordentligt
            try (Store store = session.getStore("imaps")) {
                store.connect(
                    mailProperties.getHost(),
                    mailProperties.getListeningPort(), // Använd den specifika porten för lyssning
                    mailProperties.getListeningUsername(), // Använd det specifika användarnamnet för lyssning
                    mailProperties.getListeningPassword() // Använd det specifika lösenordet för lyssning
                );
                
                log.info("Successfully connected to mail server");

                Folder inbox = store.getFolder("INBOX");
                inbox.open(Folder.READ_WRITE);
                
                // Hämta alla olästa meddelanden
                Message[] messages = inbox.search(
                    new jakarta.mail.search.FlagTerm(
                        new jakarta.mail.Flags(jakarta.mail.Flags.Flag.SEEN), 
                        false
                    )
                );
                
                log.info("Found {} unread messages", messages.length);
                
                for (Message message : messages) {
                    // Kontrollera avsändare, Reply-To och mottagare
                    boolean isFromTargetSender = false;
                    boolean hasTargetReplyTo = false;
                    boolean isToTargetRecipient = false;
                    
                    // Kolla avsändare
                    Address[] fromAddresses = message.getFrom();
                    if (fromAddresses != null && fromAddresses.length > 0) {
                        for (Address address : fromAddresses) {
                            if (address instanceof InternetAddress) {
                                String sender = ((InternetAddress) address).getAddress();
                                log.info("Message from: {}", sender);
                                if (TARGET_SENDER.equalsIgnoreCase(sender)) {
                                    isFromTargetSender = true;
                                    break;
                                }
                            }
                        }
                    }
                    
                    // Kolla Reply-To
                    Address[] replyToAddresses = message.getReplyTo();
                    if (replyToAddresses != null && replyToAddresses.length > 0) {
                        for (Address address : replyToAddresses) {
                            if (address instanceof InternetAddress) {
                                String replyTo = ((InternetAddress) address).getAddress();
                                log.info("Message reply-to: {}", replyTo);
                                if (TARGET_REPLY_TO.equalsIgnoreCase(replyTo)) {
                                    hasTargetReplyTo = true;
                                    break;
                                }
                            }
                        }
                    }
                    
                    // Kolla mottagare
                    Address[] recipients = message.getRecipients(Message.RecipientType.TO);
                    if (recipients != null && recipients.length > 0) {
                        for (Address address : recipients) {
                            if (address instanceof InternetAddress) {
                                String recipient = ((InternetAddress) address).getAddress();
                                log.info("Message to: {}", recipient);
                                if (TARGET_RECIPIENT.equalsIgnoreCase(recipient)) {
                                    isToTargetRecipient = true;
                                    break;
                                }
                            }
                        }
                    }
                    
                    // Fortsätt bara om meddelandet är från rätt avsändare till rätt mottagare och har rätt Reply-To
                    boolean shouldProcess = false;
                    
                    if (isDevEnvironment()) {
                        // I utvecklingsmiljö, kolla efter Reply-To
                        if (isFromTargetSender && hasTargetReplyTo) {
                            shouldProcess = true;
                            log.info("Processing message with Reply-To: {}", TARGET_REPLY_TO);
                        }
                    } else {
                        // I produktion, tillåt alla mail från rätt avsändare till rätt mottagare
                        if (isFromTargetSender && isToTargetRecipient) {
                            shouldProcess = true;
                            log.info("Processing message in production");
                        }
                    }
                    
                    if (shouldProcess) {
                        processEmail(message);
                    } else {
                        log.info("Skipping message - not matching criteria");
                    }
                    
                    // Markera meddelandet som läst oavsett
                    message.setFlag(jakarta.mail.Flags.Flag.SEEN, true);
                }
                
                inbox.close(false);
            }
        } catch (Exception e) {
            log.error("Error checking emails: {}", e.getMessage(), e);
            if (e.getCause() != null) {
                log.error("Caused by: {}", e.getCause().getMessage(), e.getCause());
            }
        }
    }

    private void processEmail(Message message) throws Exception {
        String content = getTextFromMessage(message);
        
        // Rensa HTML först
        content = cleanHtmlContent(content);
        log.info("Cleaned content: {}", content);
        
        // Skapa en ny PendingTask
        PendingTask pendingTask = new PendingTask();
        
        // Extrahera information från innehållet
        String[] lines = content.split("\n");
        String name = null;
        String email = null;
        String phone = null;
        String address = null;
        String apartmentNumber = null;
        StringBuilder messageContent = new StringBuilder();
        boolean isMessageContent = false;
        boolean foundMessageStart = false;
        
        log.info("Antal rader i meddelandet: {}", lines.length);
        
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            log.debug("Bearbetar rad {}: {}", i, line);
            
            if (line.contains("Meddelande:")) {
                log.info("Hittade start på meddelande på rad {}: {}", i, line);
                isMessageContent = true;
                foundMessageStart = true;
                // Om "Meddelande:" är i början av en rad, skippa den raden 
                // annars ta med texten som kommer efter "Meddelande:"
                if (!line.startsWith("Meddelande:")) {
                    String remainingText = line.substring(line.indexOf("Meddelande:") + "Meddelande:".length()).trim();
                    if (!remainingText.isEmpty()) {
                        messageContent.append(remainingText).append("\n");
                    }
                }
                continue;
            } else if (line.contains("---") && foundMessageStart) {
                log.info("Hittade slut på meddelande på rad {}: {}", i, line);
                isMessageContent = false;
            } else if (isMessageContent) {
                // I meddelandeläge, lägg till raden exakt som den är 
                // (inklusive eventuella radbrytningar och mellanslag)
                log.debug("Lägger till meddelanderad: {}", line);
                messageContent.append(line).append("\n");
            } else if (line.startsWith("Namn:")) {
                name = line.substring("Namn:".length()).trim();
            } else if (line.startsWith("E-post:")) {
                email = line.substring("E-post:".length()).trim();
            } else if (line.startsWith("Telefonnummer:")) {
                phone = line.substring("Telefonnummer:".length()).trim();
            } else if (line.startsWith("Adress:")) {
                address = line.substring("Adress:".length()).trim();
            } else if (line.startsWith("Lägenhetsnummer:")) {
                apartmentNumber = line.substring("Lägenhetsnummer:".length()).trim();
            }
        }
        
        // Om vi inte hittade slut på meddelandet men vi hittade start, använd all text till slutet
        if (foundMessageStart && isMessageContent) {
            log.info("Slutmarkör för meddelande (---) hittades inte, använder all återstående text");
        }
        
        // Logga de extraherade värdena för felsökning
        log.info("Extraherade värden - Namn: {}, E-post: {}, Telefon: {}, Adress: {}, Lägenhetsnummer: {}", 
            name, email, phone, address, apartmentNumber);

        // Sätt grundläggande information
        pendingTask.setReceived(LocalDateTime.now());
        pendingTask.setStatus("NEW");
        pendingTask.setName(name);
        pendingTask.setEmail(email);
        pendingTask.setPhone(phone);
        
        // Sätt var-fältet (adress och lägenhetsnummer)
        if (address != null && apartmentNumber != null) {
            pendingTask.setAddress(address);
            pendingTask.setApartment(apartmentNumber);
        }
        
        // Sätt beskrivningen (meddelandet mellan "Meddelande:" och "---") och bevara alla radbrytningar
        // Vi använder trim() endast för att ta bort eventuella extra radbrytningar i början och slutet
        String messageText = messageContent.toString();
        if (messageText.endsWith("\n")) {
            messageText = messageText.substring(0, messageText.length() - 1);
        }
        log.info("Extraherat meddelande (längd: {}): '{}'", messageText.length(), messageText);
        
        // Om inget meddelande extraherades, använd en alternativ metod
        if (messageText.isEmpty()) {
            log.warn("Inget meddelande kunde extraheras, letar efter meddelande i hela texten");
            
            // Försök hitta meddelandet på annat sätt - ta med allt efter "Meddelande:" någonstans i texten
            int messageIdx = content.indexOf("Meddelande:");
            if (messageIdx >= 0) {
                String allTextAfterMessage = content.substring(messageIdx + "Meddelande:".length());
                // Ta bort allt från första "---" om det finns
                int separatorIdx = allTextAfterMessage.indexOf("---");
                if (separatorIdx >= 0) {
                    messageText = allTextAfterMessage.substring(0, separatorIdx);
                } else {
                    messageText = allTextAfterMessage;
                }
            }
            
            log.info("Extraherade meddelande på alternativt sätt (längd: {}): '{}'", 
                messageText.length(), messageText);
        }
        
        // Sätt beskrivningen, om det fortfarande är tomt använd en platshållare
        if (messageText.isEmpty()) {
            log.warn("Kunde inte extrahera något meddelande, använder platshållare");
            pendingTask.setDescription("(Inget meddelande kunde extraheras)");
        } else {
            pendingTask.setDescription(messageText);
        }

        // Sätt titeln som "Adress nummer, lghnummer"
        if (address != null && apartmentNumber != null) {
            pendingTask.setSubject(String.format("%s, %s", address, apartmentNumber));
        } else {
            pendingTask.setSubject("Felanmälan via e-post");
        }

        // Försök hitta hyresgäst baserat på e-postadressen
        if (email != null && !email.isEmpty()) {
            try {
                Optional<Tenant> tenantOpt = tenantRepository.findByEmail(email);
                Tenant tenant;
                
                if (tenantOpt.isPresent()) {
                    tenant = tenantOpt.get();
                    log.info("Hittade befintlig hyresgäst: {} (ID: {})", tenant.getFirstName() + " " + tenant.getLastName(), tenant.getId());
                } else if (name != null && !name.isEmpty()) {
                    // Skapa en temporär hyresgäst
                    tenant = new Tenant();
                    String[] nameParts = name.split(" ");
                    if (nameParts.length > 1) {
                        tenant.setFirstName(nameParts[0]);
                        tenant.setLastName(nameParts[nameParts.length - 1]);
                    } else {
                        tenant.setFirstName(name);
                        tenant.setLastName("");
                    }
                    tenant.setEmail(email);
                    tenant.setPhone(phone);
                    tenant.setIsTemporary(true);
                    
                    // Spara den temporära hyresgästen
                    tenant = tenantRepository.save(tenant);
                    log.info("Skapade temporär hyresgäst: {} (ID: {})", tenant.getFirstName() + " " + tenant.getLastName(), tenant.getId());
                } else {
                    tenant = null;
                }
                
                if (tenant != null) {
                    pendingTask.setRequestedByTenant(tenant);
                    pendingTask.setTenantId(tenant.getId());
                }
            } catch (Exception e) {
                log.error("Error handling tenant: {}", e.getMessage());
            }
        }

        // Hantera lägenhet baserat på adress och lägenhetsnummer
        if (address != null && apartmentNumber != null) {
            try {
                log.info("Söker lägenhet med adress: {} och lägenhetsnummer: {}", address, apartmentNumber);
                
                // Analysera adressen för att få fram gatunummer
                String streetName = address;
                String streetNumber = "";
                
                // Försök extrahera gatunummer från adressraden om den innehåller ett nummer
                int lastSpaceIndex = address.lastIndexOf(" ");
                if (lastSpaceIndex > 0) {
                    String lastPart = address.substring(lastSpaceIndex + 1);
                    // Om sista delen är ett nummer, anta att det är gatunumret
                    if (lastPart.matches("\\d+")) {
                        streetName = address.substring(0, lastSpaceIndex);
                        streetNumber = lastPart;
                        log.info("Extraherade gatunamn: {} och gatunummer: {}", streetName, streetNumber);
                    }
                }
                
                // Om vi inte kunde extrahera ett gatunummer från adressen, använd en fallback-lösning
                if (streetNumber.isEmpty()) {
                    streetNumber = "1"; // Standardvärde
                    log.warn("Kunde inte extrahera gatunummer från adress '{}', använder standardvärde '{}'", address, streetNumber);
                }
                
                // Ändra sökningen för att inkludera lägenhetsnumret och garantera unikhet
                List<Apartment> apartments = apartmentRepository.findByStreetAndNumberAndApartmentNumber(
                    streetName, streetNumber, apartmentNumber);
                
                Apartment apartment;
                if (!apartments.isEmpty()) {
                    apartment = apartments.get(0);
                    log.info("Hittade befintlig lägenhet: {} {} lgh {} (ID: {})", 
                        apartment.getStreet(), apartment.getNumber(), apartment.getApartmentNumber(), apartment.getId());
                } else {
                    // Skapa en temporär lägenhet
                    apartment = new Apartment();
                    apartment.setStreet(streetName);
                    apartment.setNumber(streetNumber); // Gatunummer
                    apartment.setApartmentNumber(apartmentNumber); // Lägenhetsnummer
                    apartment.setIsTemporary(true);
                    
                    // Spara den temporära lägenheten
                    apartment = apartmentRepository.save(apartment);
                    log.info("Skapade temporär lägenhet: {} {} lgh {} (ID: {})", 
                        apartment.getStreet(), apartment.getNumber(), apartment.getApartmentNumber(), apartment.getId());
                }
                
                pendingTask.setRequestedByApartment(apartment);
                pendingTask.setApartmentId(apartment.getId());
                
                // Om vi har en hyresgäst utan lägenhet, koppla lägenheten till hyresgästen
                if (pendingTask.getRequestedByTenant() != null && 
                    pendingTask.getRequestedByTenant().getApartment() == null) {
                    Tenant tenant = pendingTask.getRequestedByTenant();
                    tenant.setApartment(apartment);
                    tenantRepository.save(tenant);
                    log.info("Kopplade hyresgäst (ID: {}) till lägenhet (ID: {})", tenant.getId(), apartment.getId());
                }
            } catch (Exception e) {
                log.error("Error handling apartment: {}", e.getMessage());
            }
        }

        // Identifiera språk
        String detectedLanguageCode = googleTranslateClient.detectLanguage(messageText.isEmpty() ? content : messageText);
        Language detectedLanguage = Language.SV; // Standard är svenska
        
        // Försök matcha språkkoden mot enum
        for (Language language : Language.values()) {
            if (language.getCode().equals(detectedLanguageCode)) {
                detectedLanguage = language;
                break;
            }
        }
        
        pendingTask.setDescriptionLanguage(detectedLanguage);
        
        // Om språket inte är svenska, översätt och spara översättningar
        if (detectedLanguage != Language.SV) {
            Map<Language, String> translations = new HashMap<>();
            String translatedText = googleTranslateClient.translate(messageText.isEmpty() ? content : messageText, 
                                                                    detectedLanguage.getCode(), "sv");
            translations.put(Language.SV, translatedText);
            pendingTask.setDescriptionTranslations(translations);
        }
        
        // Spara den nya uppgiften
        pendingTask = pendingTaskRepository.save(pendingTask);
        
        log.info("Skapade ny väntande uppgift från e-post med ID: {}", pendingTask.getId());
        log.info("Uppgiftsinformation - Från: {}, Telefon: {}, Var: {}, {}, Vad: {}", 
            pendingTask.getName(), 
            pendingTask.getPhone(), 
            pendingTask.getAddress(), 
            pendingTask.getApartment(),
            pendingTask.getDescription().substring(0, Math.min(50, pendingTask.getDescription().length())) + "...");
    }

    private String getTextFromMessage(Message message) throws Exception {
        log.info("Message type: {}", message.getContentType());
        
        if (message.isMimeType("text/plain")) {
            Object content = message.getContent();
            log.info("Plain text content: {}", content);
            return content.toString();
        }
        
        if (message.isMimeType("multipart/*")) {
            MimeMultipart mimeMultipart = (MimeMultipart) message.getContent();
            log.info("Found multipart message with {} parts", mimeMultipart.getCount());
            return getTextFromMimeMultipart(mimeMultipart);
        }
        
        log.warn("Unsupported message type: {}", message.getContentType());
        return message.getContent().toString();
    }

    private String getTextFromMimeMultipart(MimeMultipart mimeMultipart) throws Exception {
        StringBuilder result = new StringBuilder();
        int count = mimeMultipart.getCount();
        
        for (int i = 0; i < count; i++) {
            BodyPart bodyPart = mimeMultipart.getBodyPart(i);
            log.info("Processing part {} of type {}", i, bodyPart.getContentType());
            
            if (bodyPart.isMimeType("text/plain")) {
                result.append(bodyPart.getContent());
            }
            else if (bodyPart.isMimeType("text/html")) {
                log.info("Found HTML content in part {}", i);
                // Extrahera text från HTML
                String htmlContent = bodyPart.getContent().toString();
                result.append(htmlContent);
            }
            else if (bodyPart.getContent() instanceof MimeMultipart) {
                result.append(getTextFromMimeMultipart((MimeMultipart)bodyPart.getContent()));
            }
        }
        
        String text = result.toString();
        log.info("Extracted text content (first 200 chars): \n{}", 
            text.length() > 200 ? text.substring(0, 200) + "..." : text);
        return text;
    }

    private String cleanHtmlContent(String content) {
        if (content == null) {
            return "";
        }
        
        // Ta bort alla <style> och <script>-taggar med innehåll
        String noStyleScript = content.replaceAll("<style[^>]*>.*?</style>", "")
                                     .replaceAll("<script[^>]*>.*?</script>", "");
        
        // Ta bort HTML-kommentarer
        String noComments = noStyleScript.replaceAll("<!--.*?-->", "");
        
        // Ta bort HTML-taggar men bevara radbrytningar
        String noHtml = noComments.replaceAll("<br\\s*/?>|<p>|</p>|<div>|</div>|<h\\d>|</h\\d>", "\n")
                                  .replaceAll("<[^>]*>", "");
        
        // Konvertera HTML-entiteter
        String decodedHtml = noHtml
            .replace("&nbsp;", " ")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&amp;", "&")
            .replace("&quot;", "\"")
            .replace("&apos;", "'")
            .replace("&auml;", "ä")
            .replace("&ouml;", "ö")
            .replace("&aring;", "å")
            .replace("&Auml;", "Ä")
            .replace("&Ouml;", "Ö")
            .replace("&Aring;", "Å");
        
        // Normalisera fältstruktur för bättre parsning
        decodedHtml = decodedHtml
            .replace("Namn:", "\nNamn:")
            .replace("E-post:", "\nE-post:")
            .replace("Telefonnummer:", "\nTelefonnummer:")
            .replace("Adress:", "\nAdress:")
            .replace("Lägenhetsnummer:", "\nLägenhetsnummer:")
            .replace("Meddelande:", "\nMeddelande:")
            .replace("---", "\n---\n");
        
        // Ta bort upprepade radbrytningar och onödiga blanksteg
        decodedHtml = decodedHtml.replaceAll("\\n\\s*\\n", "\n")
                                 .replaceAll("[ \\t]+", " ") // Ersätt endast mellanslag och tabbar, bevara radbrytningar
                                 .trim();
        
        // Lägg till radbrytningar på nytt
        decodedHtml = decodedHtml
                                 .replace("Namn:", "\nNamn:")
                                 .replace("E-post:", "\nE-post:")
                                 .replace("Telefonnummer:", "\nTelefonnummer:")
                                 .replace("Adress:", "\nAdress:")
                                 .replace("Lägenhetsnummer:", "\nLägenhetsnummer:")
                                 .replace("Meddelande:", "\nMeddelande:");
        
        return decodedHtml;
    }
} 