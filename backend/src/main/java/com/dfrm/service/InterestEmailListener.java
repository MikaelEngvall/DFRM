package com.dfrm.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Properties;

import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.Scheduled;
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

    @Scheduled(fixedDelay = 60000) // Var 60:e sekund
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

    public void processEmail(Message message) {
        try {
            String from = null;
            Address[] fromAddresses = message.getFrom();
            if (fromAddresses != null && fromAddresses.length > 0) {
                if (fromAddresses[0] instanceof InternetAddress) {
                    from = ((InternetAddress) fromAddresses[0]).getAddress();
                }
            }
            
            // Om ingen avsändaradress, hoppa över
            if (from == null || from.trim().isEmpty()) {
                log.warn("Ingen avsändaradress hittad - hoppar över bearbetning");
                return;
            }
            
            // Extrahera innehåll
            String subject = message.getSubject();
            String content = extractContent(message);
            
            // Om inget innehåll, hoppa över
            if (content == null || content.trim().isEmpty()) {
                log.warn("Inget e-postinnehåll hittades - hoppar över bearbetning");
                return;
            }
            
            log.info("Kontrollerar om intresseanmälan redan finns för avsändare: {}", from);
            
            // Kontrollera befintliga intresseanmälningar med samma e-post
            List<Interest> existingInterests = interestRepository.findByEmail(from);
            
            if (!existingInterests.isEmpty()) {
                for (Interest existing : existingInterests) {
                    // Rensa både gamla och nya meddelanden för jämförelse (ta bort whitespace)
                    String cleanExistingMessage = existing.getMessage().replaceAll("\\s+", "").toLowerCase();
                    String cleanNewMessage = content.replaceAll("\\s+", "").toLowerCase();
                    
                    // Om de är identiska, hoppa över
                    if (cleanExistingMessage.equals(cleanNewMessage)) {
                        log.warn("Hittade en identisk intresseanmälan - hoppar över dubblett från: {}", from);
                        return;
                    }
                    
                    // Kolla om de är väldigt lika
                    if (cleanExistingMessage.length() > 30 && cleanNewMessage.length() > 30) {
                        // Om meddelandena är långa, kolla om de är till 80% lika
                        if (cleanExistingMessage.contains(cleanNewMessage.substring(0, (int)(cleanNewMessage.length() * 0.8))) || 
                            cleanNewMessage.contains(cleanExistingMessage.substring(0, (int)(cleanExistingMessage.length() * 0.8)))) {
                            log.warn("Hittade en liknande intresseanmälan - hoppar över möjlig dubblett från: {}", from);
                            return;
                        }
                    }
                }
            }
            
            // Extrahera namn, lägenhet och telefon från innehållet
            String name = extractName(content, from);
            String apartment = extractApartment(content, subject);
            String phone = extractPhone(content);
            
            // Skapa och spara ny intresseanmälan
            Interest interest = Interest.builder()
                .name(name)
                .email(from)
                .phone(phone)
                .message(content)
                .received(LocalDateTime.now())
                .status("NEW")
                .apartment(apartment)
                .build();
            
            log.info("Sparar ny intresseanmälan från: {} för lägenhet: {}", interest.getEmail(), interest.getApartment());
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
            
            if (content instanceof String) {
                return (String) content;
            } else if (content instanceof MimeMultipart) {
                MimeMultipart multipart = (MimeMultipart) content;
                StringBuilder result = new StringBuilder();
                
                for (int i = 0; i < multipart.getCount(); i++) {
                    BodyPart bodyPart = multipart.getBodyPart(i);
                    if (bodyPart.getContentType().toLowerCase().startsWith("text/plain")) {
                        result.append(bodyPart.getContent().toString());
                    }
                }
                
                return result.toString();
            }
            
            return ""; // Tom sträng om inget innehåll kunde extraheras
        } catch (Exception e) {
            log.error("Fel vid extrahering av e-postinnehåll: {}", e.getMessage(), e);
            return "";
        }
    }

    // Hjälpmetod för att extrahera namn från e-postinnehåll eller avsändaradress
    private String extractName(String content, String email) {
        // Försök hitta ett namn i innehållet
        String[] lines = content.split("\\r?\\n");
        for (String line : lines) {
            if (line.toLowerCase().contains("namn:") || line.toLowerCase().contains("name:")) {
                String[] parts = line.split(":", 2);
                if (parts.length > 1 && !parts[1].trim().isEmpty()) {
                    return parts[1].trim();
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
                    return parts[1].trim();
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
                    return parts[1].trim();
                }
            }
        }
        
        return "";
    }
} 