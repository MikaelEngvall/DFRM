package com.dfrm.service;

import java.util.List;
import java.util.Properties;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${mail.interest.username:intresse@duggalsfastigheter.se}")
    private String interestEmail;
    
    @Value("${spring.mail.host}")
    private String mailHost;
    
    @Value("${spring.mail.password}")
    private String mailPassword;
    
    /**
     * Returnerar mailSender-objektet för att kunna inspektera konfigurationen
     */
    public JavaMailSender getMailSender() {
        return mailSender;
    }
    
    /**
     * Kör diagnostik vid uppstart för att identifiera eventuella e-postproblem
     */
    @PostConstruct
    public void runDiagnostics() {
        log.info("Kör e-postdiagnostik vid uppstart...");
        log.info("E-postkonfiguration: host={}, username={}, password.length={}", 
                mailHost, fromEmail, (mailPassword != null ? mailPassword.length() : "null"));
        
        // Vi testar de vanligaste SMTP-portarna i en separat tråd för att inte blockera uppstart
        ExecutorService executor = Executors.newSingleThreadExecutor();
        executor.submit(() -> {
            try {
                testSmtpPorts();
            } catch (Exception e) {
                log.error("Fel vid porttestning: {}", e.getMessage());
            }
        });
        
        // Stäng ner executor efter att jobbet är slutfört
        executor.shutdown();
    }
    
    /**
     * Testar olika vanliga SMTP-portar för att se vilken som fungerar bäst
     */
    private void testSmtpPorts() {
        log.info("Testar SMTP-portar för att hitta den bästa anslutningen till {}", mailHost);
        
        int[] ports = {587, 465, 25, 2525}; // Vanliga SMTP-portar
        int workingPort = -1;
        
        for (int port : ports) {
            try {
                log.info("Testar SMTP-anslutning till {}:{}", mailHost, port);
                
                Properties props = new Properties();
                props.put("mail.smtp.host", mailHost);
                props.put("mail.smtp.port", String.valueOf(port));
                props.put("mail.smtp.auth", "true");
                props.put("mail.smtp.connectiontimeout", "10000");
                props.put("mail.smtp.timeout", "10000");
                
                // För port 465 använder vi SSL
                if (port == 465) {
                    props.put("mail.smtp.ssl.enable", "true");
                    props.put("mail.smtp.starttls.enable", "false");
                } else {
                    props.put("mail.smtp.ssl.enable", "false");
                    props.put("mail.smtp.starttls.enable", "true");
                }
                
                Session session = Session.getInstance(props, 
                    new jakarta.mail.Authenticator() {
                        protected jakarta.mail.PasswordAuthentication getPasswordAuthentication() {
                            return new jakarta.mail.PasswordAuthentication(fromEmail, mailPassword);
                        }
                    });
                
                Transport transport = session.getTransport("smtp");
                transport.connect(mailHost, port, fromEmail, mailPassword);
                transport.close();
                
                log.info("SMTP-anslutning lyckades på port {}", port);
                workingPort = port;
                
                // Uppdatera JavaMailSenderImpl-konfigurationen om möjligt
                if (mailSender instanceof JavaMailSenderImpl) {
                    JavaMailSenderImpl mailSenderImpl = (JavaMailSenderImpl) mailSender;
                    mailSenderImpl.setPort(port);
                    
                    Properties senderProps = mailSenderImpl.getJavaMailProperties();
                    if (port == 465) {
                        senderProps.put("mail.smtp.ssl.enable", "true");
                        senderProps.put("mail.smtp.starttls.enable", "false");
                        senderProps.put("mail.smtp.socketFactory.port", "465");
                        senderProps.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
                    } else {
                        senderProps.put("mail.smtp.ssl.enable", "false");
                        senderProps.put("mail.smtp.starttls.enable", "true");
                    }
                    
                    log.info("Uppdaterade mailSender-konfiguration för att använda port {}", port);
                }
                
                // Skicka ett testmeddelande till systemadministratören
                try {
                    SimpleMailMessage testMessage = new SimpleMailMessage();
                    testMessage.setFrom(fromEmail);
                    testMessage.setTo("mikael.engvall.me@gmail.com"); // Använd en verklig e-postadress för systemadministratören
                    testMessage.setSubject("DFRM E-posttest: Port " + port);
                    testMessage.setText("Det här är ett automatiskt testmeddelande för att verifiera att SMTP-konfigurationen fungerar på port " + port + ".\n\nDetta test kördes: " + java.time.LocalDateTime.now());
                    
                    if (mailSender instanceof JavaMailSenderImpl) {
                        JavaMailSenderImpl mailSenderImpl = (JavaMailSenderImpl) mailSender;
                        mailSenderImpl.send(testMessage);
                        log.info("Skickade testmeddelande från port {}", port);
                    }
                } catch (Exception e) {
                    log.warn("Kunde skapa anslutning till port {} men misslyckades med att skicka testmeddelande: {}", port, e.getMessage());
                }
                
                // Om vi hittar en fungerande port, avsluta sökningen
                break;
            } catch (Exception e) {
                log.warn("Kunde inte ansluta till SMTP-server {}:{}: {}", mailHost, port, e.getMessage());
            }
        }
        
        if (workingPort == -1) {
            log.error("Kunde inte ansluta till någon SMTP-port på {}. E-postsändning kommer inte att fungera!", mailHost);
        } else {
            log.info("Bästa SMTP-port för {} är: {}", mailHost, workingPort);
        }
    }
    
    /**
     * Skickar ett e-postmeddelande
     * 
     * @param to      mottagarens e-postadress
     * @param subject ämne
     * @param text    innehåll
     */
    public void sendEmail(String to, String subject, String text) {
        try {
            // Konfigurera timeout-värden
            configureTimeouts();
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            
            log.info("Försöker skicka e-post från {} till: {}", fromEmail, to);
            mailSender.send(message);
            log.info("E-post skickad till: {}", to);
        } catch (Exception e) {
            log.error("Fel vid skickande av e-post till: {}: {}", to, e.getMessage(), e);
            // Vi kastar inte vidare exception för att inte störa programmets flöde om e-post misslyckas
        }
    }
    
    /**
     * Skickar ett e-postmeddelande från intresse-e-postadressen
     * 
     * @param to      mottagarens e-postadress
     * @param subject ämne
     * @param text    innehåll
     */
    public void sendInterestEmail(String to, String subject, String text) {
        try {
            // För intresse-e-post behöver vi skapa en separat sender
            JavaMailSenderImpl interestMailSender = new JavaMailSenderImpl();
            
            // Grundläggande inställningar från JavaMailProperties
            if (mailSender instanceof JavaMailSenderImpl) {
                JavaMailSenderImpl mainSender = (JavaMailSenderImpl) mailSender;
                
                // Kopiera properties men uppdatera med intresse-specifika värden
                Properties props = new Properties();
                props.putAll(mainSender.getJavaMailProperties());
                
                // Hämta mail properties från configuration
                if (mainSender.getJavaMailProperties().getProperty("mail.smtp.auth") != null) {
                    props.put("mail.smtp.auth", "true");
                }
                
                if (mainSender.getJavaMailProperties().getProperty("mail.smtp.starttls.enable") != null) {
                    props.put("mail.smtp.starttls.enable", "true");
                    props.put("mail.smtp.starttls.required", "true");
                }
                
                // Ställ in timeouts
                props.put("mail.smtp.connectiontimeout", "60000");
                props.put("mail.smtp.timeout", "60000");
                props.put("mail.smtp.writetimeout", "60000");
                
                // Ställ in debug-läge
                props.put("mail.debug", "true");
                
                // Använd samma host men specifik port för intresse
                interestMailSender.setHost(mainSender.getHost());
                interestMailSender.setPort(587); // Port 587 för SMTP
                interestMailSender.setUsername(interestEmail);
                interestMailSender.setPassword(mainSender.getPassword());
                interestMailSender.setJavaMailProperties(props);
                
                log.info("Konfigurerade intresse-mailsender på {}:{} med användarnamn {}", 
                         interestMailSender.getHost(), interestMailSender.getPort(), interestMailSender.getUsername());
            } else {
                // Fallback om huvudmailsender inte är av rätt typ
                log.warn("Huvudmailsender är inte av typen JavaMailSenderImpl, använder defaultvärden för intresse");
                interestMailSender.setHost("mailcluster.loopia.se");
                interestMailSender.setPort(587);
                interestMailSender.setUsername(interestEmail);
                
                // Skapa properties för SMTP
                Properties props = new Properties();
                props.put("mail.smtp.auth", "true");
                props.put("mail.smtp.starttls.enable", "true");
                props.put("mail.smtp.starttls.required", "true");
                props.put("mail.smtp.ssl.enable", "false");
                props.put("mail.smtp.connectiontimeout", "60000");
                props.put("mail.smtp.timeout", "60000");
                props.put("mail.smtp.writetimeout", "60000");
                props.put("mail.debug", "true");
                
                interestMailSender.setJavaMailProperties(props);
            }
            
            // Skapa meddelandet
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(interestEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            
            // Skicka meddelandet
            log.info("Försöker skicka intresse-e-post från {} till: {}", interestEmail, to);
            interestMailSender.send(message);
            log.info("Intresse-e-post skickad till: {}", to);
        } catch (Exception e) {
            log.error("Fel vid skickande av intresse-e-post till: {}: {}", to, e.getMessage(), e);
            // Vi kastar inte vidare exception för att inte störa programmets flöde om e-post misslyckas
        }
    }
    
    /**
     * Konfigurerar timeout-inställningar för mailSender
     */
    private void configureTimeouts() {
        try {
            // Vi behöver kasta JavaMailSender till JavaMailSenderImpl för att få tillgång till properties
            if (mailSender instanceof JavaMailSenderImpl) {
                JavaMailSenderImpl mailSenderImpl = (JavaMailSenderImpl) mailSender;
                Properties props = mailSenderImpl.getJavaMailProperties();
                
                // Sätt lämpliga timeout-värden för att undvika att anslutningen hänger
                props.put("mail.smtp.connectiontimeout", "60000"); // Timeout för anslutning
                props.put("mail.smtp.timeout", "60000");           // Timeout för kommandon
                props.put("mail.smtp.writetimeout", "60000");      // Timeout för skrivoperationer
                
                // Optimera SMTP-konfigurationen
                props.put("mail.smtp.auth", "true");
                
                // Kontrollera om vi ska använda SSL eller STARTTLS baserat på port
                int port = mailSenderImpl.getPort();
                if (port == 465) {
                    // Port 465 använder oftast SSL
                    props.put("mail.smtp.ssl.enable", "true");
                    props.put("mail.smtp.starttls.enable", "false");
                    props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
                    props.put("mail.smtp.socketFactory.port", "465");
                } else {
                    // Port 587 och andra använder oftast STARTTLS
                    props.put("mail.smtp.ssl.enable", "false");
                    props.put("mail.smtp.starttls.enable", "true");
                    props.put("mail.smtp.starttls.required", "true");
                }
                
                props.put("mail.smtp.socketFactory.fallback", "true");
                
                // Aktivera debug för att se detaljerad information
                props.put("mail.debug", "true");
                
                // Sätt pool-inställningar om många e-postmeddelanden ska skickas
                props.put("mail.smtp.quitwait", "false");    // Vänta inte på QUIT-svar
                props.put("mail.transport.protocol", "smtp");
                
                log.info("Konfigurerat SMTP med port {}, timeout=60s, SSL={}, STARTTLS={}", 
                        mailSenderImpl.getPort(),
                        props.getProperty("mail.smtp.ssl.enable"),
                        props.getProperty("mail.smtp.starttls.enable"));
            }
        } catch (Exception e) {
            log.error("Fel vid konfigurering av timeout-inställningar: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Skickar e-post direkt via SMTP som en fallback-metod när andra metoder misslyckas
     */
    public boolean sendDirectlyViaSmtp(String to, String subject, String content) {
        try {
            log.info("Försöker skicka e-post direkt via SMTP...");
            if (!(mailSender instanceof JavaMailSenderImpl)) {
                log.warn("Kan inte skicka direkt: mailSender är inte av typen JavaMailSenderImpl");
                return false;
            }
            
            JavaMailSenderImpl mailSenderImpl = (JavaMailSenderImpl) mailSender;
            
            // Skapa en session
            Properties props = new Properties();
            props.putAll(mailSenderImpl.getJavaMailProperties());
            Session session = Session.getInstance(props, 
                    new jakarta.mail.Authenticator() {
                        protected jakarta.mail.PasswordAuthentication getPasswordAuthentication() {
                            return new jakarta.mail.PasswordAuthentication(
                                    mailSenderImpl.getUsername(), 
                                    mailSenderImpl.getPassword());
                        }
                    });
            
            // Skapa och konfigurera meddelandet
            MimeMessage message = new MimeMessage(session);
            message.setFrom(new InternetAddress(fromEmail));
            message.setRecipient(MimeMessage.RecipientType.TO, new InternetAddress(to));
            message.setSubject(subject, "UTF-8");
            message.setText(content, "UTF-8", "html");
            
            // Logga all information för felsökning
            log.info("Direkt SMTP-sändning: from={}, to={}, subject={}, session={}", 
                    fromEmail, to, subject, session);
            
            // Skicka meddelandet direkt med Transport
            Transport transport = session.getTransport("smtp");
            try {
                transport.connect(
                        mailSenderImpl.getHost(), 
                        mailSenderImpl.getPort(), 
                        mailSenderImpl.getUsername(), 
                        mailSenderImpl.getPassword());
                
                transport.sendMessage(message, message.getAllRecipients());
                log.info("E-post skickad framgångsrikt via direkt SMTP");
                return true;
            } finally {
                transport.close();
            }
        } catch (Exception e) {
            log.error("Fel vid direkt SMTP-sändning: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Skickar e-post till flera mottagare som dold kopia (BCC)
     * 
     * @param subject     ämne
     * @param content     innehåll (HTML-format stöds)
     * @param recipients  lista med e-postadresser som ska ta emot meddelandet som dold kopia
     */
    public void sendBulkEmail(String subject, String content, List<String> recipients) {
        if (recipients == null || recipients.isEmpty()) {
            log.warn("Försökte skicka bulkmail utan mottagare");
            return;
        }
        
        // Logga information om bulkmailet
        log.info("Skickar bulkmail med ämne '{}' till {} mottagare", subject, recipients.size());
        
        // Begränsa antal mottagare per batch för att undvika belastning
        int batchSize = 5;
        int totalBatches = (int) Math.ceil((double) recipients.size() / batchSize);
        
        log.info("Delar upp mottagare i {} batchar med max {} mottagare per batch", totalBatches, batchSize);
        
        int successCount = 0;
        
        for (int i = 0; i < recipients.size(); i += batchSize) {
            int endIndex = Math.min(i + batchSize, recipients.size());
            List<String> batch = recipients.subList(i, endIndex);
            
            log.info("Bearbetar batch {}/{} med {} mottagare", (i/batchSize)+1, totalBatches, batch.size());
            
            try {
                // Konfigurerar timeout-värden före varje sändning
                configureTimeouts();
                
                // Vi testar att skicka med MimeMessage direkt för att få mer kontroll
                if (mailSender instanceof JavaMailSenderImpl) {
                    JavaMailSenderImpl mailSenderImpl = (JavaMailSenderImpl) mailSender;
                    
                    // Skapa ett MIME-meddelande för korrekt formatering och kodning
                    MimeMessage message = mailSenderImpl.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                    
                    // Ange avsändare och ämne
                    helper.setFrom(fromEmail);
                    helper.setSubject(subject);
                    
                    // Lägger till mottagare som dold kopia
                    for (String recipient : batch) {
                        try {
                            helper.addBcc(recipient);
                        } catch (Exception e) {
                            log.warn("Ogiltig e-postadress i batch (hoppas över): {}", recipient);
                        }
                    }
                    
                    // Ange HTML-innehåll
                    helper.setText(content, true);
                    
                    // Skicka meddelandet
                    try {
                        log.info("Skickar e-post till batch med {} mottagare...", batch.size());
                        mailSender.send(message);
                        log.info("E-post skickad framgångsrikt till batch {}/{}", (i/batchSize)+1, totalBatches);
                        successCount += batch.size();
                    } catch (Exception e) {
                        log.error("Primär mailsändning misslyckades, försöker med direktmetod: {}", e.getMessage());
                        
                        // Försök med den direkta metoden som fallback
                        boolean fallbackSucceeded = sendBatchWithDirectMethod(subject, content, batch);
                        if (fallbackSucceeded) {
                            log.info("Fallback-metod lyckades skicka e-post till batch {}/{}", (i/batchSize)+1, totalBatches);
                            successCount += batch.size();
                        } else {
                            log.error("Både primär och fallback-metod misslyckades för batch {}/{}", (i/batchSize)+1, totalBatches);
                        }
                    }
                } else {
                    log.error("Kunde inte skicka e-post: mailSender är inte av typen JavaMailSenderImpl");
                }
                
                // Lägg in en paus mellan batchar för att undvika att överbelasta SMTP-servern
                if (i + batchSize < recipients.size()) {
                    try {
                        log.info("Väntar 5 sekunder mellan batchar...");
                        Thread.sleep(5000);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
            } catch (Exception e) {
                log.error("Fel vid skickande av bulkmail (batch {}/{}): {}", (i/batchSize)+1, totalBatches, e.getMessage(), e);
            }
        }
        
        // Sammanfatta resultatet
        if (successCount == recipients.size()) {
            log.info("Bulkmail skickat framgångsrikt till alla {} mottagare", recipients.size());
        } else if (successCount > 0) {
            log.warn("Bulkmail skickat delvis: {} av {} lyckades", successCount, recipients.size());
        } else {
            log.error("Bulkmail misslyckades helt. Inga e-postmeddelanden skickades av {}.", recipients.size());
        }
    }
    
    /**
     * Skickar ett batch med e-post med hjälp av direkt SMTP-transport som fallback
     */
    private boolean sendBatchWithDirectMethod(String subject, String content, List<String> recipients) {
        try {
            log.info("Försöker skicka batch med direkt SMTP-metod till {} mottagare", recipients.size());
            
            if (!(mailSender instanceof JavaMailSenderImpl)) {
                log.warn("Kan inte använda direktmetod: mailSender är inte av typen JavaMailSenderImpl");
                return false;
            }
            
            JavaMailSenderImpl mailSenderImpl = (JavaMailSenderImpl) mailSender;
            
            // Skapa en session med förbättrade inställningar
            Properties props = new Properties();
            props.putAll(mailSenderImpl.getJavaMailProperties());
            
            // Sätt explicita properties för direkt anslutning
            props.put("mail.smtp.connectiontimeout", "60000");
            props.put("mail.smtp.timeout", "60000");
            props.put("mail.smtp.writetimeout", "60000");
            
            // Välj rätt säkerhetsinställningar baserat på port
            int port = mailSenderImpl.getPort();
            if (port == 465) {
                props.put("mail.smtp.ssl.enable", "true");
                props.put("mail.smtp.starttls.enable", "false");
            } else {
                props.put("mail.smtp.ssl.enable", "false");
                props.put("mail.smtp.starttls.enable", "true");
                props.put("mail.smtp.starttls.required", "true");
            }
            
            Session session = Session.getInstance(props,
                    new jakarta.mail.Authenticator() {
                        protected jakarta.mail.PasswordAuthentication getPasswordAuthentication() {
                            return new jakarta.mail.PasswordAuthentication(
                                    mailSenderImpl.getUsername(), 
                                    mailSenderImpl.getPassword());
                        }
                    });
            
            // Skapa och konfigurera meddelandet
            MimeMessage message = new MimeMessage(session);
            message.setFrom(new InternetAddress(fromEmail));
            message.setSubject(subject, "UTF-8");
            
            // Lägg till BCC för varje mottagare
            for (String recipient : recipients) {
                try {
                    message.addRecipient(MimeMessage.RecipientType.BCC, new InternetAddress(recipient));
                } catch (Exception e) {
                    log.warn("Ogiltig e-postadress (hoppas över): {}", recipient);
                }
            }
            
            // Ange HTML-innehåll
            message.setContent(content, "text/html; charset=utf-8");
            
            // Logga anslutningsdetaljer
            log.info("Direkt SMTP-anslutning: host={}, port={}, auth={}",
                    mailSenderImpl.getHost(), mailSenderImpl.getPort(), props.getProperty("mail.smtp.auth"));
            
            // Skicka meddelandet med direkt Transport
            Transport transport = session.getTransport("smtp");
            try {
                transport.connect(
                        mailSenderImpl.getHost(), 
                        mailSenderImpl.getPort(), 
                        mailSenderImpl.getUsername(), 
                        mailSenderImpl.getPassword());
                
                message.saveChanges(); // Viktigt för att uppdatera headers före sändning
                
                transport.sendMessage(message, message.getAllRecipients());
                log.info("Batch framgångsrikt skickat via direkt SMTP");
                return true;
            } finally {
                transport.close();
            }
        } catch (Exception e) {
            log.error("Fel vid direkt SMTP-sändning av batch: {}", e.getMessage(), e);
            return false;
        }
    }
} 