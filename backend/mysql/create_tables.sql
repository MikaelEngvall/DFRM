-- Skapa tabeller för hyresgäster och lägenheter

-- Skapa tenants-tabell
CREATE TABLE IF NOT EXISTS tenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(50),
    personal_id VARCHAR(50),
    moved_in_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (personal_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Skapa apartments-tabell
CREATE TABLE IF NOT EXISTS apartments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    street VARCHAR(100) NOT NULL,
    number VARCHAR(50),
    apartment_number VARCHAR(50),
    postal_code VARCHAR(50),
    city VARCHAR(100),
    rooms INT,
    area DECIMAL(10,2),
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (street, number, apartment_number)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Skapa tenant_apartments-tabell
CREATE TABLE IF NOT EXISTS tenant_apartments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    apartment_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (tenant_id, apartment_id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Ange nödvändiga behörigheter för användaren boss@d374919
GRANT SELECT, INSERT, UPDATE, DELETE ON tenants TO 'boss@d374919'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON apartments TO 'boss@d374919'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON tenant_apartments TO 'boss@d374919'@'%'; 