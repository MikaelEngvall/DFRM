package com.dfrm.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;

import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.dfrm.client.GoogleTranslateClient;
import com.dfrm.config.JavaMailProperties;
import com.dfrm.model.Language;
import com.dfrm.model.PendingTask;
import com.dfrm.model.User;
import com.dfrm.repository.PendingTaskRepository;
import com.dfrm.repository.UserRepository;

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
    private final UserRepository userRepository;
    
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
            mailProperties.getUsername() == null || 
            mailProperties.getPassword() == null) {
            log.error("Mail properties are not properly configured: {}", mailProperties);
            return;
        }
        
        // I utvecklingsmiljö, logga men fortsätt körningen
        boolean isDev = isDevEnvironment();
        if (isDev) {
            log.info("Running in dev environment - will look for emails with Reply-To: {}", TARGET_REPLY_TO);
            log.info("Mail properties: host={}, port={}, username={}", 
                mailProperties.getHost(), mailProperties.getPort(), mailProperties.getUsername());
        }
        
        Properties properties = System.getProperties();
        properties.put("mail.store.protocol", "imaps");
        properties.put("mail.imaps.host", mailProperties.getHost());
        properties.put("mail.imaps.port", mailProperties.getPort());
        
        // SSL-inställningar
        properties.put("mail.imaps.ssl.enable", "true");
        properties.put("mail.imaps.ssl.trust", "*");
        properties.put("mail.imaps.ssl.protocols", "TLSv1.2 TLSv1.1 TLSv1");
        
        // Socket factory för SSL
        properties.put("mail.imaps.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
        properties.put("mail.imaps.socketFactory.fallback", "false");
        properties.put("mail.imaps.socketFactory.port", String.valueOf(mailProperties.getPort()));
        
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
            log.info("Creating mail session with host: {}, port: {}", 
                mailProperties.getHost(), mailProperties.getPort());
                
            Session session = Session.getInstance(properties);
            session.setDebug(isDev);
            
            log.info("Connecting to mail server with username: {}", mailProperties.getUsername());
            
            try {
                // Testa först att skapa en socket för att kontrollera att anslutningen fungerar
                try (javax.net.ssl.SSLSocket socket = (javax.net.ssl.SSLSocket) 
                        ((javax.net.ssl.SSLSocketFactory) javax.net.ssl.SSLSocketFactory.getDefault())
                        .createSocket(mailProperties.getHost(), mailProperties.getPort())) 
                {
                    socket.startHandshake();
                    log.info("SSL handshake successful with host {}:{}", 
                        mailProperties.getHost(), mailProperties.getPort());
                } catch (Exception e) {
                    log.error("SSL handshake failed: {}", e.getMessage(), e);
                    return;
                }
                
                // Använd try-with-resources för att säkerställa att Store stängs ordentligt
                try (Store store = session.getStore("imaps")) {
                    store.connect(
                        mailProperties.getHost(),
                        mailProperties.getUsername(),
                        mailProperties.getPassword()
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
                log.error("Failed to connect to mail server: {}", e.getMessage(), e);
                // Logga mer detaljer om vad som gick fel
                if (e.getCause() != null) {
                    log.error("Caused by: {}", e.getCause().getMessage(), e.getCause());
                }
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
        
        log.info("Cleaned content:\n{}", content);
        
        // Kontrollera om innehållet är tomt
        if (content == null || content.trim().isEmpty()) {
            log.warn("Skipping empty email message");
            return;
        }
        
        log.info("Raw content length: {}", content.length());
        log.info("Raw content:\n{}", content);

        // Parse email content
        Map<String, String> extractedFields = new HashMap<>();
        StringBuilder description = new StringBuilder();
        boolean isDescription = false;
        boolean pastSeparator = false;

        // Dela upp innehållet i rader
        String[] lines = content.split("\n");
        boolean foundMeddelande = false;
        
        for (String line : lines) {
            String trimmedLine = line.trim();
            
            // Hoppa över tomma rader
            if (trimmedLine.isEmpty()) {
                continue;
            }
            
            // Kolla efter separatorn
            if (trimmedLine.startsWith("---")) {
                pastSeparator = true;
                isDescription = false;
                continue;
            }
            
            // Hoppa över allt efter separatorn
            if (pastSeparator) {
                continue;
            }
            
            // Hantera olika fält
            if (trimmedLine.startsWith("Namn:")) {
                extractedFields.put("name", trimmedLine.substring("Namn:".length()).trim());
                isDescription = false;
            } 
            else if (trimmedLine.startsWith("E-post:")) {
                extractedFields.put("email", trimmedLine.substring("E-post:".length()).trim());
                isDescription = false;
            } 
            else if (trimmedLine.startsWith("Telefonnummer:")) {
                extractedFields.put("phone", trimmedLine.substring("Telefonnummer:".length()).trim());
                isDescription = false;
            } 
            else if (trimmedLine.startsWith("Adress:")) {
                extractedFields.put("address", trimmedLine.substring("Adress:".length()).trim());
                isDescription = false;
            } 
            else if (trimmedLine.startsWith("Lägenhetsnummer:")) {
                extractedFields.put("apartment", trimmedLine.substring("Lägenhetsnummer:".length()).trim());
                isDescription = false;
            } 
            else if (trimmedLine.startsWith("Meddelande:")) {
                isDescription = true;
                foundMeddelande = true;
                String initialDescription = trimmedLine.substring("Meddelande:".length()).trim();
                if (!initialDescription.isEmpty()) {
                    description.append(initialDescription);
                }
            }
            else if (isDescription && foundMeddelande) {
                // Bevara radbrytningar genom att lägga till en ny rad
                if (description.length() > 0) {
                    description.append("\n");
                }
                description.append(trimmedLine);
            }
            else {
                // Om vi har en rad som inte passar in i något mönster,
                // kan vi behöva hantera sammanslagna fält
                for (String fieldPrefix : new String[]{"Namn:", "E-post:", "Telefonnummer:", "Adress:", "Lägenhetsnummer:", "Meddelande:"}) {
                    int index = trimmedLine.indexOf(fieldPrefix);
                    if (index > 0) {
                        // Vi hittade ett fältprefix i mitten av raden
                        String beforePrefix = trimmedLine.substring(0, index).trim();
                        String afterPrefix = trimmedLine.substring(index).trim();
                        
                        // Rekursiv behandling för att hantera multipla fält på samma rad
                        processPartialLine(beforePrefix, extractedFields, description, isDescription);
                        processPartialLine(afterPrefix, extractedFields, description, isDescription);
                        break;
                    }
                }
            }
        }

        // Rensa beskrivningen och ta bort eventuell text efter "---"
        String finalDescription = description.toString().trim();
        int separatorIndex = finalDescription.indexOf("---");
        if (separatorIndex > 0) {
            finalDescription = finalDescription.substring(0, separatorIndex).trim();
        }
        
        if (finalDescription.isEmpty()) {
            finalDescription = "Ingen beskrivning tillgänglig";
        }
        
        // Identifiera språket i beskrivningen
        String detectedLanguageCode = googleTranslateClient.detectLanguage(finalDescription);
        Language detectedLanguage = null;
        
        try {
            // Försök matcha den detekterade språkkoden mot enum Language
            for (Language language : Language.values()) {
                if (language.getCode().equals(detectedLanguageCode)) {
                    detectedLanguage = language;
                    break;
                }
            }
            
            // Om inget språk matchades, använd svenska som standard
            if (detectedLanguage == null) {
                detectedLanguage = Language.SV;
                log.warn("Kunde inte matcha detekterat språk '{}', använder svenska som standard", detectedLanguageCode);
            }
        } catch (Exception e) {
            detectedLanguage = Language.SV;
            log.error("Fel vid språkdetektion, använder svenska som standard: {}", e.getMessage(), e);
        }
        
        // Översätt beskrivningen till alla andra språk
        Map<Language, String> translations = new HashMap<>();
        for (Language targetLanguage : Language.values()) {
            // Hoppa över originalspråket
            if (targetLanguage == detectedLanguage) {
                continue;
            }
            
            try {
                String translatedText = googleTranslateClient.translate(
                    finalDescription, 
                    detectedLanguage.getCode(), 
                    targetLanguage.getCode()
                );
                translations.put(targetLanguage, translatedText);
                log.info("Översatte beskrivning från {} till {}", detectedLanguage.getCode(), targetLanguage.getCode());
            } catch (Exception e) {
                log.error("Fel vid översättning till {}: {}", targetLanguage.getCode(), e.getMessage(), e);
            }
        }
        
        // Logga de extraherade fälten
        log.info("Extracted fields:");
        extractedFields.forEach((key, value) -> log.info("{} = {}", key, value));
        log.info("description = {}", finalDescription);
        
        String name = extractedFields.getOrDefault("name", "");
        String email = extractedFields.getOrDefault("email", "");
        String phone = extractedFields.getOrDefault("phone", "");
        String address = extractedFields.getOrDefault("address", "");
        String apartment = extractedFields.getOrDefault("apartment", "");

        LocalDateTime now = LocalDateTime.now();
        
        try {
            // Skapa en ny PendingTask med korrekt struktur för att visas på e-postrapportsidan
            PendingTask pendingTask = new PendingTask();
            
            // Sätt användare som begärde ärendet om e-postadressen finns i systemet
            if (email != null && !email.isEmpty()) {
                try {
                    Optional<User> userOpt = userRepository.findByEmail(email);
                    if (userOpt.isPresent()) {
                        pendingTask.setRequestedBy(userOpt.get());
                    }
                } catch (Exception e) {
                    log.error("Kunde inte hitta användare med e-post: {}", email, e);
                }
            }
            
            // Samla ihop all relevant information från e-postmeddelandet till requestComments
            StringBuilder comments = new StringBuilder();
            comments.append("Felanmälan från e-post\n\n");
            
            if (!name.isEmpty()) {
                comments.append("Namn: ").append(name).append("\n");
            }
            if (!email.isEmpty()) {
                comments.append("E-post: ").append(email).append("\n");
            }
            if (!phone.isEmpty()) {
                comments.append("Telefon: ").append(phone).append("\n");
            }
            if (!address.isEmpty()) {
                comments.append("Adress: ").append(address).append("\n");
            }
            if (!apartment.isEmpty()) {
                comments.append("Lägenhet: ").append(apartment).append("\n");
            }
            
            comments.append("\nBeskrivning:\n").append(finalDescription);
            
            String messageContent = comments.toString();
            
            // Sätt egenskaper på PendingTask
            pendingTask.setName(name);
            pendingTask.setEmail(email);
            pendingTask.setPhone(phone);
            pendingTask.setAddress(address);
            pendingTask.setApartment(apartment);
            pendingTask.setDescription(finalDescription);
            pendingTask.setDescriptionLanguage(detectedLanguage);
            pendingTask.setDescriptionTranslations(translations);
            pendingTask.setRequestComments(messageContent);
            pendingTask.setRequestedAt(now);
            pendingTask.setStatus("NEW"); // Sätt status till NEW för att markera som ny e-postrapport
            pendingTask.setReceived(now);
            
            // Sätt ett meningsfullt ämne baserat på beskrivningen
            String subject = "Felanmälan: " + (finalDescription.length() > 50 
                ? finalDescription.substring(0, 47) + "..." 
                : finalDescription);
            pendingTask.setSubject(subject);
            
            // Om ingen användare hittades med e-postadressen, skapa en tillfällig
            if (pendingTask.getRequestedBy() == null && !name.isEmpty()) {
                // Skapa en användare som motsvarar personen, endast för visning
                User senderUser = new User();
                
                // Försök dela upp namnet i för- och efternamn
                String[] nameParts = name.split(" ");
                if (nameParts.length > 1) {
                    senderUser.setFirstName(nameParts[0]);
                    senderUser.setLastName(nameParts[nameParts.length - 1]);
                } else {
                    senderUser.setFirstName(name);
                    senderUser.setLastName("");
                }
                
                senderUser.setEmail(email);
                pendingTask.setRequestedBy(senderUser);
            }
            
            PendingTask savedTask = pendingTaskRepository.save(pendingTask);
            
            log.info("Successfully created email report with ID: {}", 
                savedTask.getId());
        } catch (Exception e) {
            log.error("Failed to save email report: {}", e.getMessage(), e);
            throw e;
        }
    }

    private void processPartialLine(String line, Map<String, String> extractedFields, StringBuilder description, boolean isDescription) {
        if (line.isEmpty()) {
            return;
        }
        
        String trimmedLine = line.trim();
        
        if (trimmedLine.startsWith("Namn:")) {
            extractedFields.put("name", trimmedLine.substring("Namn:".length()).trim());
        } 
        else if (trimmedLine.startsWith("E-post:")) {
            extractedFields.put("email", trimmedLine.substring("E-post:".length()).trim());
        } 
        else if (trimmedLine.startsWith("Telefonnummer:")) {
            extractedFields.put("phone", trimmedLine.substring("Telefonnummer:".length()).trim());
        } 
        else if (trimmedLine.startsWith("Adress:")) {
            extractedFields.put("address", trimmedLine.substring("Adress:".length()).trim());
        } 
        else if (trimmedLine.startsWith("Lägenhetsnummer:")) {
            extractedFields.put("apartment", trimmedLine.substring("Lägenhetsnummer:".length()).trim());
        } 
        else if (trimmedLine.startsWith("Meddelande:")) {
            String initialDescription = trimmedLine.substring("Meddelande:".length()).trim();
            if (!initialDescription.isEmpty()) {
                description.append(initialDescription);
            }
        }
        else if (isDescription) {
            // Bevara radbrytningar även i processPartialLine
            if (description.length() > 0) {
                description.append("\n");
            }
            description.append(trimmedLine);
        }
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