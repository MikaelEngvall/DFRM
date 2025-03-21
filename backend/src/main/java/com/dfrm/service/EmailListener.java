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
        
        // Använd description-nyckeln för beskrivningen (tidigare 'message')
        pendingTask.setDescription(extractedInfo.getOrDefault("description", ""));
        
        // Sätt lägenhetsuppgifter
        String address = extractedInfo.getOrDefault("address", "");
        String apartment = extractedInfo.getOrDefault("apartment", "");
        
        pendingTask.setAddress(address);
        pendingTask.setApartment(apartment);
        
        // Sätt svenskt språk som standard
        pendingTask.setDescriptionLanguage(Language.SV);
        
        // Logga alla extraherade uppgifter för felsökning
        log.info("Extraherad information för ny task:");
        log.info(" - Namn: {}", pendingTask.getName());
        log.info(" - E-post: {}", pendingTask.getEmail());
        log.info(" - Telefon: {}", pendingTask.getPhone());
        log.info(" - Adress: {}", pendingTask.getAddress());
        log.info(" - Lägenhet: {}", pendingTask.getApartment());
        log.info(" - Beskrivning längd: {}", 
            pendingTask.getDescription() != null ? pendingTask.getDescription().length() : 0);
        
        return pendingTask;
    }
    
    private PendingTask enrichTaskData(PendingTask pendingTask) {
        log.info("Berikar PendingTask med ytterligare data...");
        
        // Lookup tenant by email
        if (pendingTask.getEmail() != null && !pendingTask.getEmail().isEmpty()) {
            log.info("Söker efter hyresgäst med e-post: {}", pendingTask.getEmail());
            tenantRepository.findByEmail(pendingTask.getEmail())
                .ifPresent(tenant -> {
                    pendingTask.setTenantId(tenant.getId());
                    log.info("Hittade hyresgäst med ID: {}", tenant.getId());
                    
                    // Om hyresgästen har en lägenhet, använd den informationen
                    if (tenant.getApartment() != null) {
                        String apartmentId = tenant.getApartment().getId();
                        apartmentRepository.findById(apartmentId)
                            .ifPresent(apartment -> {
                                pendingTask.setApartmentId(apartment.getId());
                                
                                // Använd lägenhetens adress om vi inte redan har en
                                if (pendingTask.getAddress() == null || pendingTask.getAddress().isEmpty()) {
                                    String fullAddress = apartment.getStreet() + " " + apartment.getNumber();
                                    pendingTask.setAddress(fullAddress);
                                }
                                
                                // Använd lägenhetens nummer om vi inte redan har ett
                                if (pendingTask.getApartment() == null || pendingTask.getApartment().isEmpty()) {
                                    pendingTask.setApartment(apartment.getApartmentNumber());
                                }
                                
                                log.info("Hittade lägenhet med ID: {}", apartment.getId());
                            });
                    }
                });
        }
        
        // Söka efter lägenhet baserat på adress + lägenhetsnummer
        if ((pendingTask.getApartmentId() == null || pendingTask.getApartmentId().isEmpty()) &&
            pendingTask.getAddress() != null && !pendingTask.getAddress().isEmpty() &&
            pendingTask.getApartment() != null && !pendingTask.getApartment().isEmpty()) {
            
            log.info("Söker efter lägenhet baserat på adress: {} och lägenhetsnummer: {}", 
                pendingTask.getAddress(), pendingTask.getApartment());
                
            // Här skulle du kunna implementera mer avancerad sökning av lägenheter
            // baserat på adress och lägenhetsnummer i databasen
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
        
        // Dela upp texten på rader för analys
        String[] lines = content.split("\\r?\\n");
        
        // Extrahera namn
        extractName(lines, details);
        
        // Extrahera e-post
        extractEmail(lines, details);
        
        // Extrahera telefonnummer
        extractPhone(lines, details);
        
        // Extrahera lägenhetsnummer
        extractApartment(lines, details);
        
        // Extrahera meddelande/beskrivning av problemet
        extractMessage(lines, details);
        
        // Logga resultat
        logExtractedDetails(details);
        
        return details;
    }
    
    private void extractName(String[] lines, Map<String, String> details) {
        // Först, leta direkt efter "namn:" eller "name:" i början av raden
        for (String line : lines) {
            if (line.toLowerCase().startsWith("namn:") || line.toLowerCase().startsWith("name:")) {
                String[] parts = line.split(":", 2);
                if (parts.length > 1 && !parts[1].trim().isEmpty()) {
                    String name = parts[1].trim();
                    // Ta bort eventuell annan information som adress, e-post eller telefon från namn-delen
                    name = name.replaceAll("(?i)adress\\s*:\\s*.*", "").trim();
                    name = name.replaceAll("(?i)e-?post\\s*:\\s*[^\\s]+@[^\\s]+", "").trim();
                    name = name.replaceAll("(?i)telefon(?:nummer)?\\s*:\\s*\\d+", "").trim();
                    name = name.replaceAll("(?i)lägenhet(?:snummer)?\\s*:\\s*\\d+", "").trim();
                    details.put("name", name);
                    log.info("Extraherat namn (standardformat): {}", name);
                    return;
                }
            }
        }
        
        // Hantera format som: "Testa Testsson Adress: Testagatan 1 Lägenhetsnummer: 1001 Meddelande"
        for (String line : lines) {
            // Hitta rader som innehåller "Adress:" för att isolera namndelarna
            if (line.toLowerCase().contains("adress:")) {
                // Dela upp vid "Adress:" för att få namn-delen
                String[] parts = line.split("(?i)adress:", 2);
                if (parts.length > 0 && !parts[0].trim().isEmpty()) {
                    String name = parts[0].trim();
                    
                    // Rensa från andra taggar som kan finnas i namnet
                    name = name.replaceAll("(?i)namn\\s*:", "").trim();
                    name = name.replaceAll("(?i)e-?post\\s*:\\s*[^\\s]+@[^\\s]+", "").trim();
                    name = name.replaceAll("(?i)telefon(?:nummer)?\\s*:\\s*\\d+", "").trim();
                    
                    details.put("name", name);
                    log.info("Extraherat namn från rad med adress: {}", name);
                    
                    // Extrahera adress och lägenhetsnummer samtidigt
                    String addressPart = parts[1];
                    
                    // Om adressen innehåller lägenhetsnummer, extrahera båda
                    if (addressPart.toLowerCase().contains("lägenhet")) {
                        String[] addressApartmentParts = addressPart.split("(?i)lägenhet(?:snummer)?\\s*:", 2);
                        
                        if (addressApartmentParts.length > 0 && !addressApartmentParts[0].trim().isEmpty()) {
                            details.put("address", addressApartmentParts[0].trim());
                            log.info("Extraherad adress från samma rad: {}", details.get("address"));
                        }
                        
                        if (addressApartmentParts.length > 1 && !addressApartmentParts[1].trim().isEmpty()) {
                            // Ta allt fram till ett eventuellt "Meddelande:" eller slutet av raden
                            String apartmentPart = addressApartmentParts[1].split("(?i)meddelande:", 2)[0].trim();
                            details.put("apartment", apartmentPart);
                            log.info("Extraherat lägenhetsnummer från samma rad: {}", details.get("apartment"));
                        }
                    } else {
                        // Om det inte finns lägenhetsnummer, spara bara adressen
                        details.put("address", addressPart.trim());
                        log.info("Extraherad adress från samma rad: {}", details.get("address"));
                    }
                    
                    return;
                }
            }
        }
        
        // Fortsätt med befintliga metoder om inget hittas ovan
        // Leta efter komplext format med regex
        for (String line : lines) {
            Pattern namePattern = Pattern.compile("(?i)(?:namn|name)\\s*:\\s*([^:]+?)(?:\\s+e-?post:|\\s+telefon(?:nummer)?:|\\s+adress:|$)");
            Matcher nameMatcher = namePattern.matcher(line);
            if (nameMatcher.find()) {
                String name = nameMatcher.group(1).trim();
                details.put("name", name);
                log.info("Extraherat namn från komplex rad: {}", name);
                return;
            }
        }
        
        // Fallback till att hitta namn i vilken rad som helst som innehåller "namn:"
        for (String line : lines) {
            if (line.toLowerCase().contains("namn:") || line.toLowerCase().contains("name:")) {
                String[] parts = line.split(":", 2);
                if (parts.length > 1 && !parts[1].trim().isEmpty()) {
                    String name = parts[1].trim();
                    // Rensa ytterligare
                    name = name.replaceAll("(?i)adress\\s*:\\s*.*", "").trim();
                    name = name.replaceAll("(?i)e-?post\\s*:\\s*[^\\s]+@[^\\s]+", "").trim();
                    name = name.replaceAll("(?i)telefon(?:nummer)?\\s*:\\s*\\d+", "").trim();
                    details.put("name", name);
                    log.info("Extraherat namn (alternativt format): {}", details.get("name"));
                    return;
                }
            }
        }
        
        // Fallback till avsändarfält
        for (String line : lines) {
            if (line.toLowerCase().startsWith("från:") || line.toLowerCase().startsWith("from:") ||
                line.toLowerCase().startsWith("avsändare:") || line.toLowerCase().startsWith("sender:")) {
                String[] parts = line.split(":", 2);
                if (parts.length > 1 && !parts[1].trim().isEmpty()) {
                    String name = parts[1].trim();
                    // Rensa
                    name = name.replaceAll("(?i)adress\\s*:\\s*.*", "").trim();
                    name = name.replaceAll("(?i)e-?post\\s*:\\s*[^\\s]+@[^\\s]+", "").trim();
                    name = name.replaceAll("(?i)telefon(?:nummer)?\\s*:\\s*\\d+", "").trim();
                    details.put("name", name);
                    log.info("Extraherat namn (avsändarformat): {}", details.get("name"));
                    return;
                }
            }
        }
        
        // Om inget namn hittades och vi har e-post, använd del av e-post som namn
        if (!details.containsKey("name") && details.containsKey("email")) {
            String email = details.get("email");
            String name = email.split("@")[0].replace(".", " ");
            details.put("name", name);
            log.info("Konstruerat namn från e-post: {}", name);
        }
    }
    
    private void extractEmail(String[] lines, Map<String, String> details) {
        // E-post regex mönster
        Pattern emailPattern = Pattern.compile("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b");
        
        // Först, försök hitta e-post i en rad som innehåller "E-post:" eller liknande
        for (String line : lines) {
            if (line.toLowerCase().contains("e-post:") || 
                line.toLowerCase().contains("email:") ||
                line.toLowerCase().contains("mail:") || 
                line.toLowerCase().contains("e-mail:")) {
                // Om raden innehåller e-post: text, extrahera e-postadressen specifikt
                Matcher emailMatcher = emailPattern.matcher(line);
                if (emailMatcher.find()) {
                    String email = emailMatcher.group();
                    details.put("email", email);
                    log.info("Extraherad e-post från rad med e-post-nyckelord: {}", email);
                    return;
                }
                
                // Fallback till delning på kolon om vi inte hittar med regex
                String[] parts = line.split(":", 2);
                if (parts.length > 1 && !parts[1].trim().isEmpty()) {
                    String emailCandidate = parts[1].trim();
                    // Rensa bort allt efter eventuellt mellanslag (om det finns telefonnummer osv)
                    if (emailCandidate.contains(" ")) {
                        emailCandidate = emailCandidate.split("\\s+")[0];
                    }
                    if (emailCandidate.contains("@")) {
                        details.put("email", emailCandidate);
                        log.info("Extraherad e-post (delning på kolon): {}", details.get("email"));
                        return;
                    }
                }
            }
        }
        
        // Om ovanstående inte fungerar, leta efter vilken rad som helst som innehåller e-postadress
        for (String line : lines) {
            Matcher emailMatcher = emailPattern.matcher(line);
            if (emailMatcher.find()) {
                details.put("email", emailMatcher.group());
                log.info("Extraherad e-post (mönstermatchning): {}", details.get("email"));
                return;
            }
        }
    }
    
    private void extractPhone(String[] lines, Map<String, String> details) {
        // Telefonnummer regex mönster - mer generell version
        Pattern phonePattern = Pattern.compile("\\b(?:\\+?\\d{1,3}[- ]?)?\\d{3,4}[- ]?\\d{2,3}[- ]?\\d{2,4}\\b");
        
        // Först, försök hitta telefonnummer i rader som uttryckligen anger telefon
        for (String line : lines) {
            if (line.toLowerCase().contains("telefon") || 
                line.toLowerCase().contains("tel:") ||
                line.toLowerCase().contains("phone:") || 
                line.toLowerCase().contains("mobil:") ||
                line.toLowerCase().contains("mobile:") ||
                line.toLowerCase().contains("telefonnummer:")) {
                
                // Använd regex för att hitta telefonnumret i raden
                Matcher phoneMatcher = phonePattern.matcher(line);
                if (phoneMatcher.find()) {
                    String phone = phoneMatcher.group();
                    details.put("phone", phone);
                    log.info("Extraherat telefonnummer med regex från telefon-rad: {}", phone);
                    return;
                }
                
                // Fallback: Split på kolon
                String[] parts = line.split(":", 2);
                if (parts.length > 1 && !parts[1].trim().isEmpty()) {
                    String phoneCandidate = parts[1].trim();
                    // Rensa bara siffror och eventuella tecken som vanligtvis finns i telefonnummer
                    phoneCandidate = phoneCandidate.replaceAll("[^\\d+\\-\\s]", "").trim();
                    if (!phoneCandidate.isEmpty()) {
                        details.put("phone", phoneCandidate);
                        log.info("Extraherat telefonnummer (delning på kolon): {}", phoneCandidate);
                        return;
                    }
                }
            }
        }
        
        // Om inget telefonnummer hittats explicit, sök hela texten efter telefonnummermönster
        for (String line : lines) {
            Matcher phoneMatcher = phonePattern.matcher(line);
            if (phoneMatcher.find()) {
                String phone = phoneMatcher.group();
                details.put("phone", phone);
                log.info("Extraherat telefonnummer (mönstermatchning): {}", phone);
                return;
            }
        }
    }
    
    private void extractApartment(String[] lines, Map<String, String> details) {
        // Sök efter lägenhetsnummer i tydligt format
        Pattern apartmentPattern = Pattern.compile("(?i)(?:lägenhet(?:snummer)?|lgh\\.?|apartment)\\s*(\\d+[A-ZÅÄÖa-zåäö]?)", Pattern.CASE_INSENSITIVE);
        
        // Först söker vi efter standardformat
        for (String line : lines) {
            if (line.toLowerCase().contains("lägenhet") || 
                line.toLowerCase().contains("lgh") || 
                line.toLowerCase().contains("apartment")) {
                
                Matcher apartmentMatcher = apartmentPattern.matcher(line);
                if (apartmentMatcher.find()) {
                    String apartmentNumber = apartmentMatcher.group(1).trim();
                    details.put("apartment", apartmentNumber);
                    log.info("Extraherat lägenhetsnummer (standardformat): {}", apartmentNumber);
                    return;
                }
                
                // Om vi inte hittar med regex, kolla efter kolon
                if (line.contains(":")) {
                    String[] parts = line.split(":", 2);
                    if (parts.length > 1 && !parts[1].trim().isEmpty()) {
                        // Plocka ut första delen efter kolon som kan vara numret
                        String potentialNumber = parts[1].trim().split("\\s+")[0];
                        // Om det ser ut som ett lägenhetsnummer (siffror, eventuellt med bokstav)
                        if (potentialNumber.matches("\\d+[A-Za-z]?")) {
                            details.put("apartment", potentialNumber);
                            log.info("Extraherat lägenhetsnummer (efter kolon): {}", potentialNumber);
                            return;
                        }
                    }
                }
            }
        }
        
        // Sök efter det vanliga formatet "lgh XXX" eller "lgh. XXX" var som helst i text
        Pattern lghPattern = Pattern.compile("(?i)lgh\\.?\\s*(\\d+[A-ZÅÄÖa-zåäö]?)", Pattern.CASE_INSENSITIVE);
        for (String line : lines) {
            Matcher lghMatcher = lghPattern.matcher(line);
            if (lghMatcher.find()) {
                details.put("apartment", lghMatcher.group(1).trim());
                log.info("Extraherat lägenhetsnummer (lgh-format): {}", details.get("apartment"));
                return;
            }
        }
        
        // Sök efter alternativa format (t.ex. "Lägenhet: 123")
        for (String line : lines) {
            if (line.toLowerCase().contains("lägenhet:") || 
                line.toLowerCase().contains("lägenhets nr:") || 
                line.toLowerCase().contains("lgh:") || 
                line.toLowerCase().contains("apartment:")) {
                
                String[] parts = line.split(":", 2);
                if (parts.length > 1) {
                    // Plocka ut bara siffror och eventuell bokstav
                    String apartmentCandidate = parts[1].trim();
                    Pattern numberPattern = Pattern.compile("(\\d+[A-ZÅÄÖa-zåäö]?)");
                    Matcher numberMatcher = numberPattern.matcher(apartmentCandidate);
                    
                    if (numberMatcher.find()) {
                        details.put("apartment", numberMatcher.group(1));
                        log.info("Extraherat lägenhetsnummer (alternativt format): {}", details.get("apartment"));
                        return;
                    }
                }
            }
        }
        
        // Sök efter nummer efter "nr." eller "#" som ofta indikerar lägenhetsnummer
        Pattern numberPattern = Pattern.compile("(?i)(?:nr\\.?|#)\\s*(\\d+[A-ZÅÄÖa-zåäö]?)", Pattern.CASE_INSENSITIVE);
        for (String line : lines) {
            Matcher numberMatcher = numberPattern.matcher(line);
            if (numberMatcher.find()) {
                details.put("apartment", numberMatcher.group(1).trim());
                log.info("Extraherat lägenhetsnummer (nr/# format): {}", details.get("apartment"));
                return;
            }
        }
    }
    
    private void extractMessage(String[] lines, Map<String, String> details) {
        StringBuilder message = new StringBuilder();
        boolean isMessageSection = false;
        boolean foundMessageStart = false;
        
        // Leta efter "Meddelande:" och ta med allt till "---"
        for (String line : lines) {
            // Om vi hittar början av meddelandet
            if (!isMessageSection && line.toLowerCase().contains("meddelande:")) {
                isMessageSection = true;
                foundMessageStart = true;
                
                // Extrahera bara den del av raden som kommer efter "Meddelande:"
                String[] parts = line.split("(?i)meddelande:", 2);
                if (parts.length > 1 && !parts[1].trim().isEmpty()) {
                    message.append(parts[1].trim()).append("\n");
                }
                continue;
            }
            
            // Om vi hittar slutet av meddelandet
            if (isMessageSection && line.contains("---")) {
                isMessageSection = false;
                break;
            }
            
            // Samla in meddelandet om vi är i meddelande-sektionen
            if (isMessageSection) {
                message.append(line).append("\n");
            }
        }
        
        // Om vi inte hittade "Meddelande:" men behöver innehållet ändå
        if (!foundMessageStart) {
            // Sök igenom mer generellt för att hitta meddelande i andra format
            boolean inContent = false;
            boolean skipHeader = true;
            
            for (String line : lines) {
                // Hoppa över standard e-postrubrikrader
                if (skipHeader && (
                        line.toLowerCase().startsWith("från:") ||
                        line.toLowerCase().startsWith("till:") ||
                        line.toLowerCase().startsWith("kopia:") ||
                        line.toLowerCase().startsWith("ämne:") ||
                        line.toLowerCase().startsWith("skickat:") ||
                        line.isEmpty())) {
                    continue;
                }
                
                // Börja samla innehåll när vi kommit förbi rubriker
                skipHeader = false;
                
                // Avsluta om vi stöter på "---"
                if (line.contains("---")) {
                    break;
                }
                
                // Avsluta om vi stöter på en signatur
                if (line.toLowerCase().contains("hälsningar") ||
                    line.toLowerCase().contains("mvh") ||
                    line.toLowerCase().contains("vänligen")) {
                    break;
                }
                
                // Lägg till aktuell rad till meddelandet (bara om vi är förbi rubrikerna)
                if (!inContent) {
                    inContent = true;
                }
                
                if (inContent) {
                    message.append(line).append("\n");
                }
            }
        }
        
        String finalMessage = message.toString().trim();
        if (!finalMessage.isEmpty()) {
            details.put("description", finalMessage);
            log.info("Extraherat meddelande med längd: {}", finalMessage.length());
        } else {
            log.info("Inget meddelande hittades");
        }
    }
    
    private void logExtractedDetails(Map<String, String> details) {
        for (Map.Entry<String, String> entry : details.entrySet()) {
            String value = entry.getValue();
            if (entry.getKey().equals("message") && value != null && value.length() > 50) {
                log.info("Extraherat {}: {}", entry.getKey(), value.substring(0, 50) + "...");
            } else {
                log.info("Extraherat {}: {}", entry.getKey(), value);
            }
        }
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

    private void extractAddress(String[] lines, Map<String, String> details) {
        // Försök med standardformat (Adress: xxx)
        for (String line : lines) {
            if (line.toLowerCase().startsWith("adress:") || line.toLowerCase().startsWith("address:")) {
                String[] parts = line.split(":", 2);
                if (parts.length > 1) {
                    String address = parts[1].trim();
                    
                    // Ta bort lägenhetsnummer från adressen om det finns
                    address = address.replaceAll("(?i)\\s*lgh\\.?\\s*\\d+.*|\\s*lägenhet\\s*\\d+.*", "").trim();
                    
                    details.put("address", address);
                    log.info("Extraherad adress (standardformat): {}", details.get("address"));
                    return;
                }
            }
        }
        
        // Sök efter rader som innehåller adress:
        for (String line : lines) {
            if (line.toLowerCase().contains("adress:") || line.toLowerCase().contains("address:")) {
                String[] parts = line.split(":", 2);
                if (parts.length > 1) {
                    String address = parts[1].trim();
                    
                    // Ta bort lägenhetsnummer från adressen om det finns
                    address = address.replaceAll("(?i)\\s*lgh\\.?\\s*\\d+.*|\\s*lägenhet\\s*\\d+.*", "").trim();
                    
                    details.put("address", address);
                    log.info("Extraherad adress (innehåller adress:): {}", details.get("address"));
                    return;
                }
            }
        }
        
        // Sök efter adressmönster (gatunamn + nummer)
        Pattern addressPattern = Pattern.compile("\\b[A-ZÅÄÖa-zåäö]+(?:gatan|vägen|gränden|allén|platsen|torget|backen)\\s+\\d+\\b", Pattern.CASE_INSENSITIVE);
        
        for (String line : lines) {
            Matcher addressMatcher = addressPattern.matcher(line);
            if (addressMatcher.find()) {
                details.put("address", addressMatcher.group());
                log.info("Extraherad adress (mönstermatchning gata): {}", details.get("address"));
                return;
            }
        }
        
        // Sök efter mönster med var: eller plats: som ofta indikerar adress
        for (String line : lines) {
            if (line.toLowerCase().contains("var:") || line.toLowerCase().contains("plats:") ||
                line.toLowerCase().contains("location:") || line.toLowerCase().contains("place:")) {
                String[] parts = line.split(":", 2);
                if (parts.length > 1 && !parts[1].trim().isEmpty()) {
                    details.put("address", parts[1].trim());
                    log.info("Extraherad adress (var/plats format): {}", details.get("address"));
                    return;
                }
            }
        }
    }
} 