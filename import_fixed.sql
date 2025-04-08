-- Skapa databasen
CREATE DATABASE IF NOT EXISTS duggalsfastigheter_se_db_1;
USE duggalsfastigheter_se_db_1;

-- Skapa tabell för användare
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(50),
    role VARCHAR(50) NOT NULL,
    preferredLanguage VARCHAR(10),
    active BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    lastLoginAt DATETIME
);

-- Skapa tabell för lägenheter
CREATE TABLE IF NOT EXISTS apartments (
    id VARCHAR(36) PRIMARY KEY,
    street VARCHAR(255) NOT NULL,
    number VARCHAR(50) NOT NULL,
    apartmentNumber VARCHAR(50) NOT NULL,
    postalCode VARCHAR(20) NOT NULL,
    city VARCHAR(255) NOT NULL,
    rooms INT NOT NULL,
    area DECIMAL(10,2) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    electricity BOOLEAN DEFAULT FALSE,
    storage BOOLEAN DEFAULT FALSE,
    internet BOOLEAN DEFAULT FALSE,
    isTemporary BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Skapa tabell för hyresgäster
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(36) PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    personnummer VARCHAR(13) NOT NULL UNIQUE,
    email VARCHAR(255),
    phone VARCHAR(50),
    street VARCHAR(255),
    postalCode VARCHAR(20),
    city VARCHAR(255),
    movedInDate DATE,
    resiliationDate DATE,
    comment TEXT,
    isTemporary BOOLEAN DEFAULT FALSE,
    apartmentId VARCHAR(36),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (apartmentId) REFERENCES apartments(id) ON DELETE SET NULL
);

-- Skapa tabell för nycklar
CREATE TABLE IF NOT EXISTS `keys` (
    id VARCHAR(36) PRIMARY KEY,
    serie VARCHAR(50) NOT NULL,
    number VARCHAR(50) NOT NULL,
    copyNumber VARCHAR(50),
    type ENUM('D', 'P', 'T', 'F', 'G', 'HN', 'Ö') NOT NULL,
    description TEXT,
    isAvailable BOOLEAN DEFAULT TRUE,
    apartmentId VARCHAR(36),
    tenantId VARCHAR(36),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (apartmentId) REFERENCES apartments(id) ON DELETE SET NULL,
    FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE SET NULL
);

-- Skapa tabell för uppgifter
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    dueDate DATE,
    completedDate DATE,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    comments TEXT,
    isRecurring BOOLEAN DEFAULT FALSE,
    recurringPattern ENUM('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'),
    assignedToUserId VARCHAR(36),
    assignedByUserId VARCHAR(36),
    apartmentId VARCHAR(36),
    tenantId VARCHAR(36),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignedToUserId) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assignedByUserId) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (apartmentId) REFERENCES apartments(id) ON DELETE SET NULL,
    FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE SET NULL
);

-- Skapa tabell för väntande uppgifter
CREATE TABLE IF NOT EXISTS pending_tasks (
    id VARCHAR(36) PRIMARY KEY,
    taskId VARCHAR(36),
    requestedByTenantId VARCHAR(36),
    requestedByApartmentId VARCHAR(36),
    requestedAt DATETIME NOT NULL,
    requestComments TEXT,
    reviewedByUserId VARCHAR(36),
    reviewedAt DATETIME,
    reviewComments TEXT,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    apartment VARCHAR(255),
    description TEXT,
    descriptionLanguage ENUM('sv', 'en', 'pl', 'uk') DEFAULT 'sv',
    status ENUM('NEW', 'REVIEWED', 'CONVERTED', 'REJECTED') NOT NULL DEFAULT 'NEW',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (requestedByTenantId) REFERENCES tenants(id) ON DELETE SET NULL,
    FOREIGN KEY (requestedByApartmentId) REFERENCES apartments(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewedByUserId) REFERENCES users(id) ON DELETE SET NULL
);

-- Skapa tabell för uppgiftsmeddelanden
CREATE TABLE IF NOT EXISTS task_messages (
    id VARCHAR(36) PRIMARY KEY,
    taskId VARCHAR(36) NOT NULL,
    senderId VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    language ENUM('SV', 'EN', 'PL', 'UK') DEFAULT 'SV',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE
);

-- Skapa tabell för visningar
CREATE TABLE IF NOT EXISTS showings (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    dateTime DATETIME NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'SCHEDULED') NOT NULL DEFAULT 'PENDING',
    apartmentAddress VARCHAR(255),
    apartmentDetails TEXT,
    assignedToUserId VARCHAR(36),
    relatedInterestId VARCHAR(36),
    contactName VARCHAR(255),
    contactPhone VARCHAR(50),
    contactEmail VARCHAR(255),
    createdById VARCHAR(36),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (assignedToUserId) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE SET NULL
);

-- Skapa tabell för intresseanmälningar
CREATE TABLE IF NOT EXISTS interests (
    id VARCHAR(36) PRIMARY KEY,
    hashId VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT,
    apartment VARCHAR(255),
    pageUrl TEXT,
    messageLanguage ENUM('SV', 'EN', 'PL', 'UK'),
    received DATETIME NOT NULL,
    status ENUM('NEW', 'REVIEWED', 'REJECTED', 'SHOWING_SCHEDULED') NOT NULL DEFAULT 'NEW',
    showingDateTime DATETIME,
    responseMessage TEXT,
    reviewedById VARCHAR(36),
    reviewedAt DATETIME,
    reviewComments TEXT,
    relatedTaskId VARCHAR(36),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewedById) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (relatedTaskId) REFERENCES tasks(id) ON DELETE SET NULL
);

-- Skapa tabell för översättningar
CREATE TABLE IF NOT EXISTS translations (
    id VARCHAR(36) PRIMARY KEY,
    entityType VARCHAR(50) NOT NULL,
    entityId VARCHAR(36) NOT NULL,
    fieldName VARCHAR(50) NOT NULL,
    language ENUM('SV', 'EN', 'PL', 'UK') NOT NULL,
    translation TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY entity_field_lang (entityType, entityId, fieldName, language)
);

-- Skapa användare med rätt behörigheter
CREATE USER IF NOT EXISTS 'boss@d374919'@'172.22.192.10' IDENTIFIED BY 'd374919';
GRANT ALL PRIVILEGES ON duggalsfastigheter_se_db_1.* TO 'boss@d374919'@'172.22.192.10';
FLUSH PRIVILEGES; 