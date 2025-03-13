package com.dfrm.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dfrm.model.Language;
import com.dfrm.model.TaskMessage;
import com.dfrm.model.User;
import com.dfrm.service.TaskMessageService;
import com.dfrm.service.TaskService;
import com.dfrm.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/tasks/{taskId}/messages")
@RequiredArgsConstructor
@Slf4j
public class TaskMessageController {

    private final TaskMessageService taskMessageService;
    private final TaskService taskService;
    private final UserService userService;
    
    /**
     * Hämtar alla meddelanden för en specifik uppgift
     * 
     * @param taskId ID för uppgiften
     * @return Lista med meddelanden
     */
    @GetMapping
    public ResponseEntity<List<TaskMessage>> getMessagesByTaskId(@PathVariable String taskId) {
        // Kontrollera att uppgiften finns
        if (!taskService.existsById(taskId)) {
            return ResponseEntity.notFound().build();
        }
        
        List<TaskMessage> messages = taskMessageService.getMessagesByTaskId(taskId);
        return ResponseEntity.ok(messages);
    }
    
    /**
     * Skapar ett nytt meddelande för en uppgift
     * 
     * @param taskId ID för uppgiften
     * @param messageData Data för det nya meddelandet
     * @return Det skapade meddelandet
     */
    @PostMapping
    public ResponseEntity<?> createMessage(
            @PathVariable String taskId,
            @RequestBody Map<String, String> messageData) {
        
        // Kontrollera att uppgiften finns
        if (!taskService.existsById(taskId)) {
            return ResponseEntity.notFound().build();
        }
        
        // Hämta inloggad användare
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User currentUser = userService.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Inloggad användare hittades inte"));
        
        // Validera indata
        String content = messageData.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Meddelandeinnehåll saknas"));
        }
        
        // Bestäm språk (använd användarens föredragna språk eller svenska som standard)
        String languageCode = messageData.get("language");
        Language language = Language.SV; // Standard är svenska
        
        if (languageCode != null) {
            for (Language lang : Language.values()) {
                if (lang.getCode().equals(languageCode)) {
                    language = lang;
                    break;
                }
            }
        } else if (currentUser.getPreferredLanguage() != null) {
            for (Language lang : Language.values()) {
                if (lang.getCode().equals(currentUser.getPreferredLanguage())) {
                    language = lang;
                    break;
                }
            }
        }
        
        try {
            TaskMessage message = taskMessageService.createMessage(taskId, currentUser.getId(), content, language);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            log.error("Fel vid skapande av meddelande", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Tar bort ett meddelande
     * 
     * @param taskId ID för uppgiften
     * @param messageId ID för meddelandet
     * @return Tomt svar
     */
    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable String taskId,
            @PathVariable String messageId) {
        
        // Kontrollera att uppgiften finns
        if (!taskService.existsById(taskId)) {
            return ResponseEntity.notFound().build();
        }
        
        try {
            taskMessageService.deleteMessage(messageId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Fel vid borttagning av meddelande", e);
            return ResponseEntity.badRequest().build();
        }
    }
} 