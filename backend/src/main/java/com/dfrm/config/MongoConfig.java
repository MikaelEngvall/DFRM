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
        // Använd miljövariabel eller konfig från application.yml istället för hårdkodade värden
        String connectionUri = mongoUri;
        if (connectionUri == null || connectionUri.isEmpty()) {
            // Fallback till att använda separata miljövariabler om URI inte är satt
            String user = System.getenv("MONGO_USER");
            String password = System.getenv("MONGO_PASSWORD");
            String host = System.getenv("MONGO_HOST");
            String dbName = System.getenv("MONGO_DATABASE");
            
            if (user != null && password != null && host != null) {
                connectionUri = String.format("mongodb+srv://%s:%s@%s/%s?retryWrites=true&w=majority",
                                             user, password, host, dbName != null ? dbName : "dfrm");
            } else {
                throw new IllegalStateException("MongoDB connection information missing. Set either spring.data.mongodb.uri or MONGO_USER, MONGO_PASSWORD, MONGO_HOST environment variables.");
            }
        }
        
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