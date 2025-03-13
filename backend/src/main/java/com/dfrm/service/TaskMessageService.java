package com.dfrm.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
     * Skapar ett nytt meddelande för en uppgift och översätter det till alla språk
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
        
        // Skapa ett nytt meddelande
        TaskMessage message = TaskMessage.builder()
                .taskId(taskId)
                .sender(sender.get())
                .content(content)
                .timestamp(LocalDateTime.now())
                .language(language)
                .build();
        
        // Översätt meddelandet till alla språk
        Map<Language, String> translations = new HashMap<>();
        for (Language targetLanguage : Language.values()) {
            if (targetLanguage != language) {
                String translatedContent = googleTranslateClient.translate(
                        content, language.getCode(), targetLanguage.getCode());
                translations.put(targetLanguage, translatedContent);
            }
        }
        message.setTranslations(translations);
        
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
} 