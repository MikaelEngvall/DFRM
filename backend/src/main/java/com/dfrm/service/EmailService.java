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
import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Multipart;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
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
     * Skickar ett e-postmeddelande till flera mottagare med HTML-innehåll.
     * Alla mottagare utom huvudmottagaren läggs till som BCC.
     */
    public boolean sendBulkEmail(String subject, String htmlContent, List<String> toEmails) {
        try {
            log.info("Skickar e-post till {} mottagare från {}", toEmails.size(), fromEmail);
            
            // Skapa meddelandet
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            // Ange avsändare
            helper.setFrom(fromEmail);
            
            // Sätt huvudmottagaren (från-adressen får också meddelandet)
            log.info("Lägger till huvudmottagare: {}", fromEmail);
            helper.setTo(fromEmail);
            
            // Lista alla BCC-mottagare (för att dölja mottagarlistan)
            InternetAddress[] bccAddresses = new InternetAddress[toEmails.size()];
            for (int i = 0; i < toEmails.size(); i++) {
                bccAddresses[i] = new InternetAddress(toEmails.get(i));
            }
            helper.setBcc(bccAddresses);
            
            // Sätt ämne och innehåll
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            // Skicka meddelandet i batches om det är många mottagare
            if (toEmails.size() > 50) {
                return sendInBatches(fromEmail, toEmails, subject, htmlContent);
            } else {
                // Skicka meddelandet
                log.info("Skickar e-post med {} BCC-mottagare", toEmails.size());
                mailSender.send(message);
                log.info("E-post skickad framgångsrikt");
                return true;
            }
        } catch (Exception e) {
            log.error("Fel vid skickande av e-post: {}", e.getMessage(), e);
            
            // Försök med direkt SMTP-anslutning som sista utväg
            try {
                log.info("Försöker skicka direkt via SMTP som reservmetod...");
                return sendBatchWithDirectMethod(fromEmail, toEmails, subject, htmlContent);
            } catch (Exception directEx) {
                log.error("Slutgiltigt fel vid skickande av e-post: {}", directEx.getMessage(), directEx);
                return false;
            }
        }
    }
    
    /**
     * Skickar e-post i grupper för att undvika problem med stora utskick.
     */
    private boolean sendInBatches(String fromEmail, List<String> toEmails, String subject, String htmlContent) {
        log.info("Delar upp utskick i grupper, totalt {} mottagare", toEmails.size());
        int batchSize = 50;
        int totalRecipients = toEmails.size();
        int successCount = 0;
        
        for (int i = 0; i < totalRecipients; i += batchSize) {
            int endIndex = Math.min(i + batchSize, totalRecipients);
            List<String> batch = toEmails.subList(i, endIndex);
            
            try {
                log.info("Skickar grupp {}/{} med {} mottagare", 
                       (i/batchSize)+1, (int)Math.ceil((double)totalRecipients/batchSize), batch.size());
                
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                
                helper.setFrom(fromEmail);
                
                // Sätt huvudmottagaren (från-adressen får också meddelandet)
                log.info("Lägger till huvudmottagare i batch: {}", fromEmail);
                helper.setTo(fromEmail);
                
                // Sätt BCC-mottagare för denna grupp
                InternetAddress[] bccAddresses = new InternetAddress[batch.size()];
                for (int j = 0; j < batch.size(); j++) {
                    bccAddresses[j] = new InternetAddress(batch.get(j));
                }
                helper.setBcc(bccAddresses);
                
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                
                mailSender.send(message);
                
                successCount += batch.size();
                log.info("Grupp {}/{} skickad framgångsrikt", (i/batchSize)+1, (int)Math.ceil((double)totalRecipients/batchSize));
                
                // Paus mellan grupputskick för att undvika överbelastning av servern
                if (endIndex < totalRecipients) {
                    log.info("Pausar i 2 sekunder före nästa grupputskick");
                    Thread.sleep(2000);
                }
                
            } catch (Exception e) {
                log.error("Fel vid skickande av grupp {}: {}", (i/batchSize)+1, e.getMessage(), e);
            }
        }
        
        log.info("Gruppvis utskick klart. {} av {} mottagare lyckades.", successCount, totalRecipients);
        return successCount > 0;
    }
    
    /**
     * Skickar e-post med direkt SMTP-koppling som reservmetod.
     */
    public boolean sendBatchWithDirectMethod(String fromEmail, List<String> recipients, String subject, String htmlContent) throws MessagingException {
        log.info("Försöker skicka direkt via SMTP till {} mottagare", recipients.size());
        
        // Hämta SMTP-inställningar från JavaMailSender
        JavaMailSenderImpl mailSenderImpl = (JavaMailSenderImpl) mailSender;
        String host = mailSenderImpl.getHost();
        int port = mailSenderImpl.getPort();
        String username = mailSenderImpl.getUsername();
        String password = mailSenderImpl.getPassword();
        
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", host);
        props.put("mail.smtp.port", port);
        props.put("mail.smtp.connectiontimeout", "60000");
        props.put("mail.smtp.timeout", "60000");
        props.put("mail.smtp.writetimeout", "60000");
        
        // Skapa session med autentisering
        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
        });
        
        // Skapa meddelande
        MimeMessage message = new MimeMessage(session);
        message.setFrom(new InternetAddress(fromEmail));
        
        // Sätt huvudmottagaren (från-adressen får också meddelandet)
        log.info("Lägger till huvudmottagare i direktmetoden: {}", fromEmail);
        message.addRecipient(Message.RecipientType.TO, new InternetAddress(fromEmail));
        
        // Lägg till alla mottagare som BCC
        for (String recipient : recipients) {
            message.addRecipient(Message.RecipientType.BCC, new InternetAddress(recipient));
        }
        
        message.setSubject(subject);
        
        // Skapa HTML-innehåll
        MimeBodyPart messageBodyPart = new MimeBodyPart();
        messageBodyPart.setContent(htmlContent, "text/html; charset=UTF-8");
        
        Multipart multipart = new MimeMultipart();
        multipart.addBodyPart(messageBodyPart);
        message.setContent(multipart);
        
        // Skicka meddelandet
        log.info("Skickar direkt via SMTP på port {}", port);
        Transport.send(message);
        log.info("E-post skickad framgångsrikt med direktmetoden");
        
        return true;
    }
} 