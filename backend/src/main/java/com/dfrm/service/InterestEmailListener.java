package com.dfrm.service;

import java.time.LocalDateTime;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import com.dfrm.client.GoogleTranslateClient;
import com.dfrm.config.JavaMailProperties;
import com.dfrm.model.Interest;
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
import jakarta.mail.search.FlagTerm;
import jakarta.mail.search.SearchTerm;
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
    private final InterestEmailHashGenerator hashGenerator;
    
    private static final String TARGET_RECIPIENT = "info@duggalsfastigheter.se";
    private static final String TARGET_SENDER = "info@duggalsfastigheter.se";

    private boolean isDevEnvironment() {
        String[] activeProfiles = environment.getActiveProfiles();
        for (String profile : activeProfiles) {
            if ("dev".equals(profile)) {
                return true;
            }
        }
        return false;
    }

    // Borttagen automatisk schemaläggning för att endast köra manuellt
    public void checkEmails() {
        log.info("Kontrollerar e-post för intresseanmälningar...");
        
        // Kontrollera att vi har konfigurererat e-post
        if (mailProperties == null || 
            mailProperties.getHost() == null || 
            mailProperties.getIntresseUsername() == null || 
            mailProperties.getIntressePassword() == null) {
            log.error("E-postkonfiguration saknas. Host: {}, username: {}, password: {}", 
                mailProperties != null ? "OK" : "SAKNAS", 
                mailProperties != null ? mailProperties.getIntresseUsername() : "SAKNAS",
                mailProperties != null && mailProperties.getIntressePassword() != null ? "OK" : "SAKNAS");
            return;
        }
        
        log.info("Använder e-postkonfiguration: {} på {}", mailProperties.getIntresseUsername(), mailProperties.getHost());
        
        try {
            Properties props = new Properties();
            props.put("mail.store.protocol", "imaps");
            props.put("mail.imaps.host", mailProperties.getHost());
            props.put("mail.imaps.port", String.valueOf(mailProperties.getIntressePort()));
            props.put("mail.imaps.ssl.enable", "true");
            props.put("mail.imaps.ssl.trust", "*");
            
            // För felsökning
            boolean isDev = isDevEnvironment();
            if (isDev) {
                log.debug("Aktiverar e-post-debugging i utvecklingsläge");
                props.put("mail.debug", "true");
            }
            
            Session session = Session.getDefaultInstance(props);
            Store store = session.getStore("imaps");
                store.connect(
                    mailProperties.getHost(),
                    mailProperties.getIntressePort(),
                    mailProperties.getIntresseUsername(),
                    mailProperties.getIntressePassword()
                );
                
            log.info("Ansluten till e-postkonto: {}", mailProperties.getIntresseUsername());

                Folder inbox = store.getFolder("INBOX");
                inbox.open(Folder.READ_WRITE);
                
            // Sök efter olästa meddelanden
            SearchTerm searchTerm = new FlagTerm(new Flags(Flags.Flag.SEEN), false);
            Message[] messages = inbox.search(searchTerm);
                
                log.info("Hittade {} olästa meddelanden", messages.length);
                
                for (Message message : messages) {
                log.info("Bearbetar e-post: Ämne={}, Från={}", message.getSubject(), getFromAddress(message));
                
                try {
                    // Bearbeta e-postmeddelandet
                    processEmail(message);
                    
                    // Markera som läst
                    message.setFlag(Flags.Flag.SEEN, true);
                    log.info("E-post markerad som läst");
                } catch (Exception e) {
                    log.error("Fel vid bearbetning av enskilt e-postmeddelande: {}", e.getMessage(), e);
                }
            }
            
            inbox.close(false);
            store.close();
            log.info("E-postkontroll slutförd");
        } catch (Exception e) {
            log.error("Fel vid kontroll av e-post: {}", e.getMessage(), e);
        }
    }

    // Hjälpmetod för att få avsändaradressen från ett meddelande
    private String getFromAddress(Message message) {
        try {
            Address[] fromAddresses = message.getFrom();
            if (fromAddresses != null && fromAddresses.length > 0) {
                if (fromAddresses[0] instanceof InternetAddress) {
                    return ((InternetAddress) fromAddresses[0]).getAddress();
                }
                return fromAddresses[0].toString();
            }
        } catch (Exception e) {
            log.error("Kunde inte läsa avsändaradress: {}", e.getMessage());
        }
        return "okänd";
    }
    
    // Hjälpmetod för att få reply-to-adressen från ett meddelande
    private String getReplyToAddress(Message message) {
        try {
            Address[] replyToAddresses = message.getReplyTo();
            if (replyToAddresses != null && replyToAddresses.length > 0) {
                if (replyToAddresses[0] instanceof InternetAddress) {
                    return ((InternetAddress) replyToAddresses[0]).getAddress();
                }
                return replyToAddresses[0].toString();
            }
        } catch (Exception e) {
            log.error("Kunde inte läsa reply-to-adress: {}", e.getMessage());
        }
        return "okänd";
    }

    public void processEmail(Message message) {
        try {
            // Kontrollera om vi är i utvecklingsläge
            boolean isDev = isDevEnvironment();
            
            // Hämta avsändaradress från From-fältet
            String fromAddress = null;
            Address[] fromAddresses = message.getFrom();
            if (fromAddresses != null && fromAddresses.length > 0) {
                if (fromAddresses[0] instanceof InternetAddress) {
                    fromAddress = ((InternetAddress) fromAddresses[0]).getAddress();
                }
            }
            
            // Om ingen avsändaradress, hoppa över
            if (fromAddress == null || fromAddress.trim().isEmpty()) {
                log.warn("Ingen avsändaradress hittad - hoppar över bearbetning");
                return;
            }
            
            // Extrahera innehåll
            String subject = message.getSubject();
            String content = extractContent(message);
            log.info("\u001B[32mExtraherat innehåll: {} tecken\u001B[0m", content.length());
            
            // Om inget innehåll, hoppa över
            if (content == null || content.trim().isEmpty()) {
                log.warn("Inget e-postinnehåll hittades - hoppar över bearbetning");
                return;
            }
            
            // Extrahera e-postadress först från innehållet, annars använd avsändaradressen
            String emailFromContent = extractEmail(content);
            String email = !emailFromContent.isEmpty() ? emailFromContent : fromAddress;
            
            log.info("Kontrollerar om intresseanmälan redan finns för e-post: {}", email);
            
            // Extrahera andra fält för hashberäkning
            String name = extractName(content, email);
            String apartment = extractApartment(content, subject);
            String phone = extractPhone(content);
            String extractedMessage = extractMessage(content);
            
            // Generera primär hash baserad på e-post och lägenhet
            String primaryHash = hashGenerator.generatePrimaryHash(email, apartment);
            
            // Generera sekundär hash om den primära saknar lägenhetsinformation
            String secondaryHash = hashGenerator.generateSecondaryHash(email, phone, name);
            
            // Generera innehållshash för att kontrollera om exakt samma innehåll skickades
            String contentHash = hashGenerator.generateContentHash(email, extractedMessage);
            
            log.info("Genererade hash-värden för dubblettkontroll:");
            log.info(" - Primär hash: {}", primaryHash);
            log.info(" - Sekundär hash: {}", secondaryHash);
            log.info(" - Innehålls-hash: {}", contentHash);
            
            // Kontrollera dubbletter baserat på hashar
            if (primaryHash != null) {
                if (interestRepository.existsByHashId(primaryHash)) {
                    log.warn("Dubblett detekterad med primär hash - hoppar över: {}", primaryHash);
                    return;
                }
            }
            
            // Om ingen primär hash-match hittades, kontrollera sekundär hash
            if (secondaryHash != null) {
                if (interestRepository.existsByHashId(secondaryHash)) {
                    log.warn("Dubblett detekterad med sekundär hash - hoppar över: {}", secondaryHash);
                    return;
                }
            }
            
            // Om ingen hash-match hittades alls, gör en sista kontroll på innehållshashen
            if (contentHash != null) {
                if (interestRepository.existsByHashId(contentHash)) {
                    log.warn("Dubblett detekterad med innehålls-hash - hoppar över: {}", contentHash);
                    return;
                }
            }
            
            // Logga extraherade fält på debug-nivå utan färgkodning
            log.debug("Extraherade fält från intresseanmälan:");
            log.debug(" - Namn: {}", name);
            log.debug(" - E-post: {}", email);
            log.debug(" - Telefon: {}", phone);
            log.debug(" - Lägenhet: {}", apartment);
            log.debug(" - Ämne: {}", subject);
            log.debug(" - Meddelande: {}", extractedMessage.length() > 100 ? 
                     extractedMessage.substring(0, 100) + "..." : extractedMessage);
            
            // Om inget meddelande extraherades, logga varning men fortsätt att spara
            if (extractedMessage.isEmpty()) {
                log.warn("Inget meddelande hittades. Intresseanmälan sparas ändå.");
            }
            
            // Välj hash att spara (prioritera i ordning: primär, sekundär, innehåll)
            String hashToSave = primaryHash;
            if (hashToSave == null) {
                hashToSave = secondaryHash;
                if (hashToSave == null) {
                    hashToSave = contentHash;
                }
            }
            
            // Skapa och spara ny intresseanmälan med endast det extraherade meddelandet
            Interest interest = Interest.builder()
                    .name(name)
                    .email(email)
                    .phone(phone)
                    .message(extractedMessage) // Använd endast det extraherade meddelandet, inte hela innehållet
                    .received(LocalDateTime.now())
                    .status("NEW")
                    .apartment(apartment)
                    .hashId(hashToSave) // Spara vald hash-ID för dubblettkontroll
                    .build();
        
            log.info("Sparar ny intresseanmälan från: {} för lägenhet: {} med hashId: {}", 
                  interest.getEmail(), interest.getApartment(), interest.getHashId());
            Interest savedInterest = interestRepository.save(interest);
            log.info("Sparad intresseanmälan med ID: {}", savedInterest.getId());
        } catch (Exception e) {
            log.error("Fel vid bearbetning av intresseanmälan: {}", e.getMessage(), e);
        }
    }

    // Hjälpmetod för att extrahera innehåll från ett e-postmeddelande
    private String extractContent(Message message) {
        try {
            Object content = message.getContent();
            log.debug("Försöker extrahera innehåll från e-post av typ: {}", message.getContentType());
            
            String result = "";
            if (content instanceof String) {
                result = (String) content;
                log.debug("Extraherat textinnehåll med längd: {}", result.length());
            } else if (content instanceof MimeMultipart) {
                MimeMultipart multipart = (MimeMultipart) content;
                StringBuilder sb = new StringBuilder();
                
                log.debug("Extraherar innehåll från multipart-meddelande med {} delar", multipart.getCount());
                
                for (int i = 0; i < multipart.getCount(); i++) {
                    BodyPart bodyPart = multipart.getBodyPart(i);
                    log.debug("Bearbetar del {} med innehållstyp: {}", i, bodyPart.getContentType());
                    
                    if (bodyPart.getContentType().toLowerCase().startsWith("text/plain")) {
                        String partContent = bodyPart.getContent().toString();
                        sb.append(partContent);
                        log.debug("Lade till text/plain-innehåll med längd: {}", partContent.length());
                    } else if (bodyPart.getContentType().toLowerCase().startsWith("text/html")) {
                        // För HTML-innehåll, försök extrahera texten
                        String htmlContent = bodyPart.getContent().toString();
                        log.debug("Hittade HTML-innehåll med längd: {}", htmlContent.length());
                        // Lägg till HTML-innehållet som det är, kommer att rensas senare
                        sb.append(htmlContent);
                    } else {
                        log.debug("Hoppar över innehåll av typ: {}", bodyPart.getContentType());
                    }
                }
                
                result = sb.toString();
                log.debug("Extraktion klar. Totalt extraherat innehåll: {} tecken", result.length());
            } else {
                log.warn("Okänd innehållstyp: {}. Returnerar tom sträng.", 
                    content != null ? content.getClass().getName() : "null");
                return "";
            }
            
            // Rensa HTML-innehåll och normalisera radbrytningar
            String cleanedContent = cleanHtmlContent(result);
            log.debug("Rensat HTML-innehåll. Ny längd: {} tecken", cleanedContent.length());
            return cleanedContent;
            
        } catch (Exception e) {
            log.error("Fel vid extrahering av e-postinnehåll: {}", e.getMessage(), e);
            return "";
        }
    }

    // Hjälpmetod för att rensa HTML-innehåll
    private String cleanHtmlContent(String content) {
        if (content == null) {
            return "";
        }
        
        // Ersätt <br> med radbrytningar först för att bevara radstrukturen
        String result = content.replaceAll("<br\\s*/?\\s*>", "\n");
        
        // Ta bort alla andra HTML-taggar
        result = result.replaceAll("<[^>]*>", " ");
        
        // Ta bort överflödiga mellanslag och radbrytningar
        result = result.replaceAll("\\s*\\n\\s*", "\n");
        result = result.replaceAll("\\s+", " ");
        result = result.trim();
        
        // Konvertera HTML-entiteter
        result = result.replaceAll("&nbsp;", " ");
        result = result.replaceAll("&amp;", "&");
        result = result.replaceAll("&lt;", "<");
        result = result.replaceAll("&gt;", ">");
        result = result.replaceAll("&#\\d+;", "");
        
        // Ytterligare rensning av tomma rader
        result = result.replaceAll("\\s*\\n\\s*", "\n");
        
        log.debug("Html-rensning: Ursprunglig längd: {}, Ny längd: {}", 
                content.length(), result.length());
        
        return result;
    }

    // Hjälpmetod för att extrahera namn från e-postinnehåll eller avsändaradress
    private String extractName(String content, String email) {
        // Försök hitta ett namn i innehållet
        String[] lines = content.split("\\r?\\n");
        for (String line : lines) {
            if (line.toLowerCase().contains("namn:") || line.toLowerCase().contains("name:")) {
                String[] parts = line.split(":", 2);
                if (parts.length > 1 && !parts[1].trim().isEmpty()) {
                    // Ta bara med texten från namnet direkt efter "Namn:"
                    String name = parts[1].trim();
                    
                    // Begränsa till första delen (innan e-post eller annan info)
                    // Stoppa vid "E-post:" eller liknande
                    if (name.toLowerCase().contains("e-post:") || 
                        name.toLowerCase().contains("email:") ||
                        name.toLowerCase().contains("mail:")) {
                        name = name.split("(?i)e-post:|(?i)email:|(?i)mail:", 2)[0].trim();
                    }
                    
                    // Identifiera och ta bort eventuella e-postadresser som är del av namnet
                    Matcher emailMatcher = Pattern.compile("[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}").matcher(name);
                    if (emailMatcher.find()) {
                        name = name.substring(0, emailMatcher.start()).trim();
                    }
                    
                    // Identifiera och ta bort eventuella telefonnummer som är del av namnet
                    Matcher phoneMatcher = Pattern.compile("\\d{6,}").matcher(name);
                    if (phoneMatcher.find()) {
                        name = name.substring(0, phoneMatcher.start()).trim();
                    }

                    // Rensa HTML-taggar
                    name = name.replaceAll("<[^>]*>", "").trim();
                    
                    log.info("\u001B[32mExtraherat namn (rensat från annan info): '{}'\u001B[0m", name);
                    return name;
                }
            }
        }
        
        // Om inget namn hittades i innehållet, använd del av e-postadressen
        if (email != null && email.contains("@")) {
            return email.substring(0, email.indexOf("@")).replace(".", " ");
        }
        
        return "Okänd";
    }

    // Hjälpmetod för att extrahera lägenhet från e-postinnehåll eller ämne
    private String extractApartment(String content, String subject) {
        // Försök först hitta en lägenhet i innehållet
        String[] lines = content.split("\\r?\\n");
        for (String line : lines) {
            if (line.toLowerCase().contains("lägenhet:") || 
                line.toLowerCase().contains("apartment:") || 
                line.toLowerCase().contains("adress:") || 
                line.toLowerCase().contains("address:")) {
                String[] parts = line.split(":", 2);
                if (parts.length > 1 && !parts[1].trim().isEmpty()) {
                    // Ta bara med texten från lägenhetsnumret direkt efter "Lägenhet:"
                    String apartment = parts[1].trim();
                    
                    // Stoppa vid nästa markör om den finns (t.ex. Meddelande:)
                    if (apartment.toLowerCase().contains("meddelande:") || 
                        apartment.toLowerCase().contains("message:")) {
                        apartment = apartment.split("(?i)meddelande:|(?i)message:", 2)[0].trim();
                    }
                    
                    // Rensa bort eventuella HTML-taggar
                    apartment = apartment.replaceAll("<[^>]*>", "").trim();
                    
                    log.info("\u001B[32mExtraherat lägenhetsnummer (rensat): '{}'\u001B[0m", apartment);
                    return apartment;
                }
            }
        }
        
        // Om inget hittades i innehållet, kolla ämnesraden
        if (subject != null && !subject.trim().isEmpty()) {
            return subject.trim();
        }
        
        return "Okänd lägenhet";
    }

    // Hjälpmetod för att extrahera telefonnummer från e-postinnehåll
    private String extractPhone(String content) {
        // Försök hitta ett telefonnummer i innehållet
        String[] lines = content.split("\\r?\\n");
        for (String line : lines) {
            if (line.toLowerCase().contains("telefon:") || 
                line.toLowerCase().contains("phone:") || 
                line.toLowerCase().contains("mobil:") || 
                line.toLowerCase().contains("mobile:") || 
                line.toLowerCase().contains("tel:")) {
                String[] parts = line.split(":", 2);
                if (parts.length > 1 && !parts[1].trim().isEmpty()) {
                    // Ta bara med texten från telefonnumret direkt efter "Tel:"
                    String phone = parts[1].trim();
                    
                    // Stoppa vid nästa markör om den finns
                    if (phone.toLowerCase().contains("meddelande:") || 
                        phone.toLowerCase().contains("message:") ||
                        phone.toLowerCase().contains("lägenhet:") ||
                        phone.toLowerCase().contains("apartment:")) {
                        phone = phone.split("(?i)meddelande:|(?i)message:|(?i)lägenhet:|(?i)apartment:", 2)[0].trim();
                    }
                    
                    // Extrahera bara själva telefonnumret (siffror, plus, bindestreck)
                    Matcher phoneMatcher = Pattern.compile("[0-9+\\-\\s]{6,}").matcher(phone);
                    if (phoneMatcher.find()) {
                        phone = phoneMatcher.group().trim();
                    }
                    
                    // Rensa HTML-taggar
                    phone = phone.replaceAll("<[^>]*>", "").trim();
                    
                    log.info("\u001B[32mExtraherat telefonnummer (rensat): '{}'\u001B[0m", phone);
                    return phone;
                }
            }
        }
        
        return "";
    }

    // Lägg till en ny hjälpmetod för att extrahera meddelande från e-postinnehåll
    private String extractMessage(String content) {
        log.info("\u001B[32mFörsöker extrahera meddelande från e-postinnehåll\u001B[0m");
        
        StringBuilder message = new StringBuilder();
        boolean foundMessageStart = false;
        boolean foundMessageEnd = false;
        
        // Dela på rader och sök igenom
        String[] lines = content.split("\\r?\\n");
        for (String line : lines) {
            // Om vi hittar början av meddelandet
            if (!foundMessageStart && 
                (line.toLowerCase().contains("meddelande:") || 
                 line.toLowerCase().contains("message:"))) {
                
                foundMessageStart = true;
                
                // Extrahera bara den del av raden som kommer efter "Meddelande:"
                String[] parts = line.toLowerCase().contains("meddelande:") ? 
                    line.split("(?i)meddelande:", 2) : 
                    line.split("(?i)message:", 2);
                
                if (parts.length > 1) {
                    String firstLine = parts[1].trim();
                    if (!firstLine.isEmpty()) {
                        // Kontrollera om det finns "---" på samma rad som meddelandet
                        int dashIndex = firstLine.indexOf("---");
                        if (dashIndex != -1) {
                            firstLine = firstLine.substring(0, dashIndex).trim();
                            foundMessageEnd = true;
                        }
                        message.append(firstLine).append("\n");
                    }
                }
                
                continue;
            }
            
            // Om vi hittar slutet av meddelandet ("---"), avbryt
            if (foundMessageStart && !foundMessageEnd && 
                (line.trim().startsWith("---") || line.trim().contains("---"))) {
                foundMessageEnd = true;
                log.info("\u001B[32mHittade slut på meddelande (---)\u001B[0m");
                break;
            }
            
            // Samla in meddelandet mellan "Meddelande:" och "---"
            if (foundMessageStart && !foundMessageEnd) {
                message.append(line).append("\n");
            }
        }
        
        String extractedMessage = message.toString().trim();
        
        // Ta bort eventuell trailing text efter "---" om den missades
        int dashIndex = extractedMessage.indexOf("---");
        if (dashIndex != -1) {
            extractedMessage = extractedMessage.substring(0, dashIndex).trim();
            log.info("\u001B[32mRensade bort '---' och efterföljande text från meddelandet\u001B[0m");
        }
        
        // Logga resultat
        if (foundMessageStart) {
            log.info("\u001B[32mExtraherat meddelande (rensat): '{}'\u001B[0m", 
                extractedMessage.isEmpty() ? "(tomt)" : extractedMessage);
        } else {
            log.info("\u001B[32mIngen 'Meddelande:'-markör hittades\u001B[0m");
        }
        
        return extractedMessage;
    }

    // Hjälpmetod för att extrahera e-postadress från innehållet
    private String extractEmail(String content) {
        log.info("\u001B[32mFörsöker extrahera e-postadress från innehållet\u001B[0m");
        
        // Försök hitta en e-postadress i innehållet
        String[] lines = content.split("\\r?\\n");
        for (String line : lines) {
            if (line.toLowerCase().contains("e-post:") || 
                line.toLowerCase().contains("email:") || 
                line.toLowerCase().contains("mail:")) {
                
                String[] parts = line.split(":", 2);
                if (parts.length > 1 && !parts[1].trim().isEmpty()) {
                    // Rensa text och extrahera e-postadressen
                    String emailPart = parts[1].trim();
                    
                    // Använd regex för att extrahera e-postadressen
                    Matcher emailMatcher = Pattern.compile("[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}").matcher(emailPart);
                    if (emailMatcher.find()) {
                        String email = emailMatcher.group().trim();
                        log.info("\u001B[32mExtraherad e-postadress från innehållet: '{}'\u001B[0m", email);
                        return email;
                    } else {
                        // Om ingen e-postadress hittades, ta första delen av texten
                        // Stoppa vid eventuella andra fält
                        if (emailPart.toLowerCase().contains("telefon:") || 
                            emailPart.toLowerCase().contains("phone:") || 
                            emailPart.toLowerCase().contains("tel:")) {
                            emailPart = emailPart.split("(?i)telefon:|(?i)phone:|(?i)tel:", 2)[0].trim();
                        }
                        
                        // Rensa HTML-taggar
                        emailPart = emailPart.replaceAll("<[^>]*>", "").trim();
                        
                        log.info("\u001B[32mExtraherad e-postadress (utan regex-matchning): '{}'\u001B[0m", emailPart);
                        return emailPart;
                    }
                }
            }
        }
        
        // Använd regex för att hitta första e-postadressen i hela innehållet om inget annat fungerar
        Matcher matcher = Pattern.compile("[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}").matcher(content);
        if (matcher.find()) {
            String email = matcher.group().trim();
            log.info("\u001B[32mHittade e-postadress i allmänt innehåll: '{}'\u001B[0m", email);
            return email;
        }
        
        log.info("\u001B[32mIngen e-postadress hittades i innehållet\u001B[0m");
        return "";
    }
} 