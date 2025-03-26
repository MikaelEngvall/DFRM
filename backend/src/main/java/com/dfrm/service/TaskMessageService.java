package com.dfrm.service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.dfrm.client.GoogleTranslateClient;
import com.dfrm.model.Language;
import com.dfrm.model.TaskMessage;
import com.dfrm.model.User;
import com.dfrm.repository.TaskMessageRepository;
import com.dfrm.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskMessageService {

    private final TaskMessageRepository taskMessageRepository;
    private final UserRepository userRepository;
    private final GoogleTranslateClient googleTranslateClient;
    
    /**
     * Hämtar alla meddelanden för en specifik uppgift
     * 
     * @param taskId ID för uppgiften
     * @return Lista med meddelanden
     */
    public List<TaskMessage> getMessagesByTaskId(String taskId) {
        return taskMessageRepository.findByTaskIdOrderByTimestampAsc(taskId);
    }
    
    /**
     * Skapar ett nytt meddelande för en uppgift
     * 
     * @param taskId ID för uppgiften
     * @param senderId ID för användaren som skickar meddelandet
     * @param content Meddelandets innehåll
     * @param language Språket som meddelandet är skrivet på
     * @return Det skapade meddelandet
     */
    public TaskMessage createMessage(String taskId, String senderId, String content, Language language) {
        Optional<User> sender = userRepository.findById(senderId);
        if (sender.isEmpty()) {
            throw new IllegalArgumentException("Användaren hittades inte");
        }
        
        // Om inget explicit språk anges, försök identifiera språket
        if (language == null) {
            String detectedCode = googleTranslateClient.detectLanguage(content);
            log.info("Upptäckt språk för meddelande: {}", detectedCode);
            
            // Hitta motsvarande Language-enum
            for (Language lang : Language.values()) {
                if (lang.getCode().equals(detectedCode)) {
                    language = lang;
                    break;
                }
            }
            
            // Fallback till svenska om vi inte kunde identifiera språket
            if (language == null) {
                language = Language.SV;
            }
        }
        
        // Skapa ett nytt meddelande
        TaskMessage message = TaskMessage.builder()
                .taskId(taskId)
                .sender(sender.get())
                .content(content)
                .timestamp(LocalDateTime.now())
                .language(language)
                .build();
        
        // Använd GoogleTranslateClient för att översätta meddelandet till alla språk
        try {
            // Skapa en lista med alla språk som ska översättas till
            List<String> targetLanguages = Arrays.stream(Language.values())
                .map(Language::getCode)
                .collect(Collectors.toList());
            
            // Använd den nya metoden för att översätta till alla språk på en gång
            Map<String, String> translations = googleTranslateClient.translateToMultipleLanguages(
                content, 
                language.getCode(), 
                targetLanguages
            );
            
            // Ta bort källspråket från översättningarna, eftersom det redan är originaltexten
            translations.remove(language.getCode());
            
            message.setTranslations(translations);
            log.info("Message translated to {} languages", translations.size());
        } catch (Exception e) {
            log.error("Fel vid översättning av meddelande", e);
            // Om översättningen misslyckas, använd originalinnehållet för alla språk
            Map<String, String> fallbackTranslations = new HashMap<>();
            for (Language targetLanguage : Language.values()) {
                if (targetLanguage != language) {
                    fallbackTranslations.put(targetLanguage.getCode(), content);
                }
            }
            message.setTranslations(fallbackTranslations);
        }
        
        // Spara och returnera meddelandet
        return taskMessageRepository.save(message);
    }
    
    /**
     * Tar bort ett meddelande
     * 
     * @param messageId ID för meddelandet
     */
    public void deleteMessage(String messageId) {
        taskMessageRepository.deleteById(messageId);
    }
    
    /**
     * Tar bort alla meddelanden för en uppgift
     * 
     * @param taskId ID för uppgiften
     */
    public void deleteAllMessagesForTask(String taskId) {
        taskMessageRepository.deleteByTaskId(taskId);
    }
    
    /**
     * Hämtar ett meddelande baserat på dess ID
     * 
     * @param messageId ID för meddelandet
     * @return Meddelandet om det finns, annars tom Optional
     */
    public Optional<TaskMessage> getMessageById(String messageId) {
        return taskMessageRepository.findById(messageId);
    }
} 