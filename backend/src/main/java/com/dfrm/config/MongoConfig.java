package com.dfrm.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

@Configuration
@EnableMongoRepositories(basePackages = "com.dfrm.repository")
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${spring.data.mongodb.database:dfrm}")
    private String databaseName;
    
    @Value("${spring.data.mongodb.uri:#{null}}")
    private String mongoUri;

    @Override
    protected String getDatabaseName() {
        return databaseName;
    }

    @Override
    @Bean
    public MongoClient mongoClient() {
        // Använd spring.data.mongodb.uri först, sedan MONGODB_URI miljövariabel, sedan bygg från separata miljövariabler
        String connectionUri = mongoUri;
        
        // Om ingen URI hittades i application.properties, försök med miljövariabel
        if (connectionUri == null || connectionUri.isEmpty()) {
            connectionUri = System.getProperty("MONGODB_URI");
            
            // Om fortfarande ingen URI, försök med System.getenv
            if (connectionUri == null || connectionUri.isEmpty()) {
                connectionUri = System.getenv("MONGODB_URI");
            }
            
            // Om fortfarande ingen URI, bygg från separata miljövariabler
            if (connectionUri == null || connectionUri.isEmpty()) {
                String user = System.getProperty("MONGO_USER");
                if (user == null) user = System.getenv("MONGO_USER");
                
                String password = System.getProperty("MONGO_PASSWORD");
                if (password == null) password = System.getenv("MONGO_PASSWORD");
                
                String host = System.getProperty("MONGO_HOST");
                if (host == null) host = System.getenv("MONGO_HOST");
                
                String dbName = System.getProperty("MONGO_DATABASE");
                if (dbName == null) dbName = System.getenv("MONGO_DATABASE");
                if (dbName == null) dbName = databaseName;
                
                if (user != null && password != null && host != null) {
                    // Skapa en förenklad anslutningssträng för att undvika problem med retryWrites-formatet
                    connectionUri = String.format("mongodb+srv://%s:%s@%s/%s",
                                                user, password, host, dbName);
                }
            }
        }
        
        // Om vi fortfarande inte har en URI, kasta ett fel
        if (connectionUri == null || connectionUri.isEmpty()) {
            throw new IllegalStateException("MongoDB connection information missing. Set either spring.data.mongodb.uri or MONGO_USER, MONGO_PASSWORD, MONGO_HOST environment variables.");
        }
        
        // Säkerställ att anslutningssträngen är korrekt formaterad
        // Rensa bort eventuella problemparametrar
        if (connectionUri.contains("retryWrites") && !connectionUri.contains("retryWrites=")) {
            connectionUri = connectionUri.replaceAll("retryWrites[^&]*", "retryWrites=true");
            // Ta bort extra & om det behövs
            connectionUri = connectionUri.replaceAll("&&", "&");
            connectionUri = connectionUri.replaceAll("\\?&", "?");
            // Ta bort trailing & om det finns
            if (connectionUri.endsWith("&")) {
                connectionUri = connectionUri.substring(0, connectionUri.length() - 1);
            }
            // Ta bort ? om det är sista tecknet
            if (connectionUri.endsWith("?")) {
                connectionUri = connectionUri.substring(0, connectionUri.length() - 1);
            }
        }
        
        System.out.println("Using MongoDB connection URI: " + connectionUri.replaceAll(":[^:@]+@", ":***@"));
        
        ConnectionString connectionString = new ConnectionString(connectionUri);
        MongoClientSettings mongoClientSettings = MongoClientSettings.builder()
            .applyConnectionString(connectionString)
            .build();
        return MongoClients.create(mongoClientSettings);
    }

    @Bean
    public MongoTemplate mongoTemplate() throws Exception {
        return new MongoTemplate(mongoClient(), getDatabaseName());
    }
} 