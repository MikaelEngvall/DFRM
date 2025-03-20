package com.dfrm.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.dfrm.client.GoogleTranslateClient;
import com.dfrm.config.JavaMailProperties;
import com.dfrm.model.Language;
import com.dfrm.model.PendingTask;
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
            
            log.info("Connecting to mail server with username: {} and password length: {}", 
                mailProperties.getListeningUsername(), 
                mailProperties.getListeningPassword() != null ? mailProperties.getListeningPassword().length() : 0);
            
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
                    try {
                        // Kontrollera reply-to adressen före bearbetning
                        Address[] replyTo = message.getReplyTo();
                        log.info("Processing email with subject: {}", message.getSubject());
                        
                        boolean validReplyTo = false;
                        
                        if (replyTo != null && replyTo.length > 0) {
                            log.info("Email has {} reply-to addresses", replyTo.length);
                            for (Address address : replyTo) {
                                if (address instanceof InternetAddress) {
                                    log.info("Reply-To address: {}", ((InternetAddress) address).getAddress());
                                    if (TARGET_REPLY_TO.equals(((InternetAddress) address).getAddress())) {
                                        log.info("Found matching reply-to address, will process email");
                                    validReplyTo = true;
                                    break;
                                    }
                                }
                            }
                        } else {
                            log.info("Email has no reply-to addresses");
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
            log.error("Error checking emails: {}", e.getMessage(), e);
            if (e.getCause() != null) {
                log.error("Caused by: {}", e.getCause().getMessage(), e.getCause());
            }
        }
    }

    private void processEmail(Message message) throws Exception {
        log.info("Bearbetar felanmälan...");
        
        String subject = message.getSubject();
        String contentText = extractEmailContent(message);
        
        Map<String, String> extractedInfo = parseEmailFields(contentText);
        
        PendingTask pendingTask = createPendingTask(extractedInfo, subject);
        
        pendingTask = enrichTaskData(pendingTask);
        
        saveAndTranslate(pendingTask);
        
        // Markera e-postmeddelandet som läst
        message.setFlag(jakarta.mail.Flags.Flag.SEEN, true);
    }
    
    private String extractEmailContent(Message message) throws Exception {
        log.info("Extraherar e-postinnehåll...");
        
        String contentText = getTextFromMessage(message);
        
        log.info("Innehåll (första 100 tecken): {}", 
            contentText.length() > 100 ? contentText.substring(0, 100) + "..." : contentText);
            
        return contentText;
    }
    
    private Map<String, String> parseEmailFields(String content) {
        log.info("Analyserar e-postinnehåll för att extrahera fält...");
        return extractDetailsFromEmail(content);
    }
    
    private PendingTask createPendingTask(Map<String, String> extractedInfo, String subject) {
        log.info("Skapar PendingTask från extraherad information...");
        
        PendingTask pendingTask = new PendingTask();
        pendingTask.setStatus("NEW");
        pendingTask.setReceived(LocalDateTime.now());
        
        // Fyll i PendingTask med extraherad information
        pendingTask.setName(extractedInfo.getOrDefault("name", ""));
        pendingTask.setEmail(extractedInfo.getOrDefault("email", ""));
        pendingTask.setPhone(extractedInfo.getOrDefault("phone", ""));
        pendingTask.setDescription(extractedInfo.getOrDefault("message", ""));
        pendingTask.setApartment(extractedInfo.getOrDefault("apartment", subject));
        
        // Sätt svenskt språk som standard
        pendingTask.setDescriptionLanguage(Language.SV);
        
        return pendingTask;
    }
    
    private PendingTask enrichTaskData(PendingTask pendingTask) {
        // Denna metod finns redan i klassen, behåller den befintliga implementationen
        // men ser till att den returnerar den berikade PendingTask-objekt
        
        // Försök hitta tenant baserat på e-post
        if (pendingTask.getEmail() != null && !pendingTask.getEmail().isEmpty()) {
            tenantRepository.findByEmail(pendingTask.getEmail())
                .ifPresent(tenant -> {
                    pendingTask.setTenantId(tenant.getId());
                    log.info("Matchade tenant med ID {} baserat på e-post", tenant.getId());
                    
                    // Om tenant hittades, försök hitta deras lägenhet om lägenhetsnummer saknas
                    if (pendingTask.getApartment() == null || pendingTask.getApartment().isEmpty()) {
                        // Här skulle vi kunna ha en metod som hittar lägenheter för en tenant,
                        // men eftersom denna inte finns implementerar vi en enkel fallback
                        log.info("Kunde inte hitta lägenhetsnummer baserat på tenant");
                    }
                });
        }
        
        // Om ingen tenant hittades via e-post, kan vi inte göra mer eftersom
        // det inte finns någon findByPhone-metod i TenantRepository
        if (pendingTask.getTenantId() == null && pendingTask.getPhone() != null && !pendingTask.getPhone().isEmpty()) {
            log.info("Kunde inte hitta tenant baserat på telefon: {}", pendingTask.getPhone());
        }
        
        // Om ett lägenhetsnummer angivits, försök hitta lägenhet direkt
        // Använd nu findAll och hantera flera resultat med stream
        if (pendingTask.getApartment() != null && !pendingTask.getApartment().isEmpty()) {
            try {
                // I en fullständig implementation skulle vi använda ett anpassat repository-query
                // som findAllByApartmentNumber, men vi använder en workaround här
                apartmentRepository.findAll().stream()
                    .filter(apt -> pendingTask.getApartment().equals(apt.getApartmentNumber()))
                    .findFirst()
                    .ifPresent(apartment -> {
                        pendingTask.setApartmentId(apartment.getId());
                        log.info("Matchade lägenhet med ID {} baserat på lägenhetsnummer", apartment.getId());
                    });
            } catch (Exception e) {
                log.error("Fel vid sökning efter lägenhet: {}", e.getMessage());
                // Fortsätt ändå, vi behöver inte länka till en specifik lägenhet för att skapa en felanmälan
            }
        }
        
        return pendingTask;
    }
    
    private void saveAndTranslate(PendingTask pendingTask) {
        log.info("Sparar och översätter PendingTask...");
        
        // Detektera språk och översätt vid behov
        detectLanguageAndTranslate(pendingTask);
        
        // Spara felanmälan i databasen
        PendingTask savedTask = pendingTaskRepository.save(pendingTask);
        log.info("Felanmälan sparad med ID: {}", savedTask.getId());
    }
    
    private Map<String, String> extractDetailsFromEmail(String content) {
        log.info("Extraherar detaljer från e-postinnehåll...");
        Map<String, String> details = new HashMap<>();
        
        // Rensa HTML-innehåll om det finns
        content = cleanHtmlContent(content);
        
        // Ersätt <br> med radbrytningar för att hantera olika format
        content = content.replaceAll("<br>", "\n").replaceAll("<br/>", "\n").replaceAll("<br />", "\n");
        
        log.info("Rensat innehåll med radbrytningar: \n{}", content);
        
        // Extrahera format 1: Namn: Tuva Andersson, E-post: ...
        if (content.contains("Namn:") && content.contains("E-post:")) {
            log.info("Detekterade strukturerat format med 'Namn:', 'E-post:' etc.");
            
            // Extrahera namn
            Pattern namePattern = Pattern.compile("Namn:\\s*([^\\n]+)\\s*", Pattern.CASE_INSENSITIVE);
            Matcher nameMatcher = namePattern.matcher(content);
            if (nameMatcher.find()) {
                details.put("name", nameMatcher.group(1).trim());
                log.info("Extraherat namn: {}", details.get("name"));
            }
            
            // Extrahera e-post
            Pattern emailPattern = Pattern.compile("E-post:\\s*([^\\n]+)\\s*", Pattern.CASE_INSENSITIVE);
            Matcher emailMatcher = emailPattern.matcher(content);
            if (emailMatcher.find()) {
                details.put("email", emailMatcher.group(1).trim());
                log.info("Extraherad e-post: {}", details.get("email"));
            }
            
            // Extrahera telefon
            Pattern phonePattern = Pattern.compile("Tel(?:efon)?(?:nummer)?:\\s*([^\\n]+)\\s*", Pattern.CASE_INSENSITIVE);
            Matcher phoneMatcher = phonePattern.matcher(content);
            if (phoneMatcher.find()) {
                details.put("phone", phoneMatcher.group(1).trim());
                log.info("Extraherat telefonnummer: {}", details.get("phone"));
            }
            
            // Extrahera lägenhet
            Pattern apartmentPattern = Pattern.compile("Lägenhet(?:snummer)?:\\s*([^\\n]+)\\s*", Pattern.CASE_INSENSITIVE);
            Matcher apartmentMatcher = apartmentPattern.matcher(content);
            if (apartmentMatcher.find()) {
                details.put("apartment", apartmentMatcher.group(1).trim());
                log.info("Extraherad lägenhet: {}", details.get("apartment"));
            }
            
            // Extrahera meddelande
            Pattern messagePattern = Pattern.compile("Meddelande:\\s*([^-]+)\\s*---", Pattern.DOTALL | Pattern.CASE_INSENSITIVE);
            Matcher messageMatcher = messagePattern.matcher(content);
            if (messageMatcher.find()) {
                details.put("message", messageMatcher.group(1).trim());
                log.info("Extraherat meddelande (första 50 tecken): {}", 
                    details.get("message").length() > 50 ? details.get("message").substring(0, 50) + "..." : details.get("message"));
            }
        } 
        // Format 2: Fritext utan tydliga markörer
        else {
            log.info("Detekterade ostrukturerat format, försöker extrahera information");
            
            // Dela upp texten på rader
            String[] lines = content.split("\\r?\\n");
            
            // Hitta e-post (första raden som innehåller @)
            for (String line : lines) {
                if (line.contains("@")) {
                    Pattern emailPattern = Pattern.compile("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b");
                    Matcher emailMatcher = emailPattern.matcher(line);
                    if (emailMatcher.find()) {
                        details.put("email", emailMatcher.group());
                        log.info("Extraherad e-post: {}", details.get("email"));
                        break;
                    }
                }
            }
            
            // Hitta telefonnummer
            for (String line : lines) {
                Pattern phonePattern = Pattern.compile("\\b(?:\\+?\\d{1,3}[- ]?)?\\d{6,12}\\b");
                Matcher phoneMatcher = phonePattern.matcher(line);
                if (phoneMatcher.find()) {
                    details.put("phone", phoneMatcher.group());
                    log.info("Extraherat telefonnummer: {}", details.get("phone"));
                    break;
                }
            }
            
            // Hitta lägenhetsnummer (rader som innehåller "lgh", "lägenhet", etc.)
            for (String line : lines) {
                if (line.toLowerCase().contains("lgh") || line.toLowerCase().contains("lägenhet") ||
                    line.toLowerCase().contains("apartment")) {
                    Pattern apartmentPattern = Pattern.compile("\\b(?:lgh|lägenhet|apartment)\\s*[nr\\.]*\\s*[:]*\\s*(\\d+\\w*|\\w+\\d+)\\b", 
                        Pattern.CASE_INSENSITIVE);
                    Matcher apartmentMatcher = apartmentPattern.matcher(line);
                    if (apartmentMatcher.find()) {
                        details.put("apartment", apartmentMatcher.group(1));
                        log.info("Extraherad lägenhet: {}", details.get("apartment"));
                        break;
                    }
                }
            }
            
            // Extrahera meddelande (resten av innehållet)
            StringBuilder messageBuilder = new StringBuilder();
            boolean foundMessage = false;
            int messageLineCount = 0;
            
            for (String line : lines) {
                // Ignorera linjer som troligen är metadata
                if (line.contains("---") || line.contains("Datum:") || line.contains("Sidans URL:") || 
                    line.contains("Användaragent:") || line.contains("Fjärr IP:") || line.contains("Drivs med:")) {
                    // Om vi redan har börjat samla meddelandet, avbryt när vi når metadata
                    if (foundMessage) {
                        break;
                    } else {
                        continue;
                    }
                }
                
                if (line.contains("Problem:") || line.contains("Felanmälan:") || 
                    line.contains("Fel:") || line.contains("Beskrivning:") ||
                    line.contains("Meddelande:")) {
                    foundMessage = true;
                    messageLineCount++;
                    // Ta bort markörer från början av meddelandet
                    line = line.replaceAll("^(Problem|Felanmälan|Fel|Beskrivning|Meddelande):\\s*", "");
                }
                
                if ((foundMessage || messageLineCount == 0) && !line.isEmpty() && 
                    !line.contains("Med vänlig hälsning") && 
                    !line.contains("Skickat från")) {
                    messageBuilder.append(line).append("\n");
                    if (!foundMessage) {
                        messageLineCount++;
                    }
                }
            }
            
            // Om vi inte hittade någon specifik meddelandedel, använd första delen av innehållet
            // men maximalt 5 rader för att undvika att få med för mycket
            if (messageBuilder.length() == 0) {
                int lineCount = 0;
                for (String line : lines) {
                    if (!line.isEmpty() && lineCount < 5 && 
                        !line.contains("---") && !line.contains("Datum:") && 
                        !line.contains("URL:") && !line.contains("Agent:") &&
                        !line.contains("IP:")) {
                        messageBuilder.append(line).append("\n");
                        lineCount++;
                    }
                }
                details.put("message", messageBuilder.toString().trim());
            } else {
                details.put("message", messageBuilder.toString().trim());
            }
            
            log.info("Extraherat meddelande (första 50 tecken): {}", 
                details.get("message") != null && details.get("message").length() > 50 ? 
                details.get("message").substring(0, 50) + "..." : details.get("message"));
        }
        
        return details;
    }
    
    private void detectLanguageAndTranslate(PendingTask pendingTask) {
        if (pendingTask.getDescription() == null || pendingTask.getDescription().isEmpty()) {
            return;
        }
        
        try {
            // Detektera språk om det inte redan är satt
            if (pendingTask.getDescriptionLanguage() == null) {
                Language detectedLanguage = translationService.detectLanguage(pendingTask.getDescription());
                pendingTask.setDescriptionLanguage(detectedLanguage);
                log.info("Detekterade språk: {}", detectedLanguage);
            }
            
            // Översätt till svenska om det inte redan är på svenska
            if (pendingTask.getDescriptionLanguage() != Language.SV) {
                String translatedMessage = translationService.translateText(
                    pendingTask.getDescription(), 
                    pendingTask.getDescriptionLanguage(), 
                    Language.SV
                );
                pendingTask.setDescriptionTranslations(Map.of(Language.SV, translatedMessage));
                log.info("Översatte meddelande från {} till svenska", pendingTask.getDescriptionLanguage());
            }
        } catch (Exception e) {
            log.error("Fel vid språkdetektering/översättning: {}", e.getMessage());
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
        
        // Ta bort HTML-taggar
        String result = content.replaceAll("<[^>]*>", " ");
        
        // Ta bort överflödiga mellanslag
        result = result.replaceAll("\\s+", " ");
        
        // Konvertera HTML-entiteter
        result = result.replaceAll("&nbsp;", " ")
                       .replaceAll("&amp;", "&")
                       .replaceAll("&lt;", "<")
                       .replaceAll("&gt;", ">");
        
        return result.trim();
    }
} 