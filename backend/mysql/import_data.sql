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
    street, number VARCHAR(255),
    apartment_no VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (first_name, last_name, street, number, apartment_no)
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

-- Importera hyresgäster
INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'PM INDIAN SHORNA',
    'AB',
    'alamsmejl@hotmail.com',
    '0739711320',
    NULL,
    '2023-06-01',
    'Fortifikationsgatan 1',
    'Lgh 1207/7'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Fredrik',
    'Gren',
    'fredrikgren1@hotmail.com',
    '0709-162457',
    NULL,
    '2023-01-01',
    'Fortifikationsgatan 10',
    'Lgh 1103/6'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Haneen',
    'Masoud',
    'haneenmasoud199388@gmail.com',
    '0735834362',
    NULL,
    '2025-01-01',
    'Gångbrogatan 13',
    'Lgh 1202/12'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Sandra',
    'Widegren',
    'sandrawidegren5@gmail.com',
    '0735415614',
    NULL,
    '2023-12-01',
    'Gångbrogatan 13',
    'Lgh 1001/8'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Ahmed',
    'Raimi',
    'ahmadraimi020@gmail.com',
    '0764072017',
    NULL,
    '2022-11-01',
    'Gångbrogatan 13',
    'Lgh 1103/9'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Ibrahim Alshikh',
    'Mohamad',
    'ebrahimee250@gmail.com',
    '0768771887',
    NULL,
    '2024-05-01',
    'Gångbrogatan 13',
    'Lgh 1201/11'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Valhallavägen',
    '10',
    'Lägenhet',
    '2023-01-01',
    NULL,
    NULL,
    'Nej',
    'Tillsvidare'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Ali',
    'Alshikh',
    'ali.alshikh1986@gmail.com',
    '0725777778',
    NULL,
    '2025-03-01',
    'Gångbrogatan 13',
    'Lgh 1104/10'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Ulrika',
    'Gustafsson',
    'vanillo8006@gmail.com',
    '0709103739',
    NULL,
    '2025-03-01',
    'Hagagatan 5',
    'Lgh 1101/1'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Lgh',
    '1102/108',
    'V. Vittusgatan 2',
    'Lägenhet',
    NULL,
    NULL,
    'Tillsvidare',
    '2024-05-01'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Zahra',
    'Alsalloum',
    'ebrahimee250@gmail.com',
    '0760-327146',
    NULL,
    '2023-01-01',
    'Gångbrogatan 13',
    'Lgh 1203/13'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Aram',
    'Hovhannisyan',
    'suzi.hov@hotmail.com',
    '0708-744534',
    NULL,
    '2023-01-01',
    'Chapmansgatan 6',
    'Lgh 1201/5'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Meja',
    'Holm',
    'meja0330@gmail.com',
    '0704448317',
    NULL,
    '2024-09-01',
    'Gångbrogatan 13',
    'Lgh 1301/14'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Hugo',
    'Danell',
    'hugo.danell00@gmail.com',
    '0729-699653',
    NULL,
    '2023-01-01',
    'Chapmansgatan 6',
    'Lgh 1202/6'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Towa',
    'Jenglér',
    'jenglertowa@gmail.com',
    '0709378441',
    NULL,
    '2023-01-01',
    'Fortifikationsgatan 10',
    'Lgh 1002/2'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Catarina',
    'Lindström',
    'catarinalindstrm@yahoo.com',
    '0702-741467',
    NULL,
    '2022-10-01',
    'Hagagatan 5',
    'Lgh 1001/2'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Fabian',
    'Arvidsson',
    'fabian@wilfab.se',
    '0704222231',
    NULL,
    '2024-09-01',
    'Chapmansgatan 6',
    'Lgh 1102/4'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Sanna',
    'Bergqvist',
    'sannabergqvist@outlook.com',
    '0723964538',
    NULL,
    '2025-02-01',
    'Chapmansgatan 6',
    'Lgh 1002/2'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Jonathan',
    'Mikael',
    'elsa3244@gmail.com',
    '070 145 0872',
    NULL,
    '2023-04-01',
    'Fortifikationsgatan 10',
    'Lgh 1101/4'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Glenn',
    'Almqvist',
    'jimmy.almqvist@blekingerot.se',
    '0708-493949',
    NULL,
    '2023-01-01',
    'Chapmansgatan 6',
    'Lgh 1001/1'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Alice Yu',
    'Håkansson',
    'alice.uy.hakansson@gmail.com',
    '0763128791',
    NULL,
    '2024-08-01',
    'Fortifikationsgatan 10',
    'Lgh 1102/5'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Lgh',
    '1101/109',
    'V. Vittusgatan 2',
    'Lägenhet',
    NULL,
    NULL,
    'Tillsvidare',
    '2024-04-09'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Lgh',
    '1101C/111',
    'Valhallavägen 10',
    'Lägenhet',
    NULL,
    NULL,
    'Tillsvidare',
    '2023-01-01'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Anne At All',
    'AB',
    'anne@anneatall.se',
    '0706482060',
    NULL,
    '2025-06-01',
    'Fortifikationsgatan 1',
    'Lgh 1001/1'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Marta',
    'Sargsyan',
    'suzi.hov@hotmail.com',
    '0708-744534',
    NULL,
    '2023-01-01',
    'Chapmansgatan 6',
    'Lgh 1101/3'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Dan',
    'Altehed',
    'alteheddan@yahoo.com',
    '0763175685',
    NULL,
    '2022-12-01',
    'Hagagatan 5',
    'Lgh 1101/4'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Ehab Al',
    'Nawakil',
    'ehabalnawakil@gmail.com',
    '0760058318',
    NULL,
    '2024-11-01',
    'Fortifikationsgatan 10',
    'Lgh 1003/3'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Azra',
    'Faller',
    'azra_bihorac@hotmail.com',
    '0723390733',
    NULL,
    '2022-09-01',
    'Hagagatan 5',
    'Lgh 1002/3'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Lgh',
    '1002/106',
    'V. Vittusgatan 2',
    'Lägenhet',
    NULL,
    NULL,
    'Tillsvidare',
    '2024-09-01'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Albin',
    'Valastig',
    'albin.valastig@hotmail.com',
    '0767847279',
    NULL,
    '2024-08-01',
    'Fortifikationsgatan 10',
    'Lgh 1104/7'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Lgh',
    '1002C/102',
    'Valhallavägen 10',
    'Lägenhet',
    NULL,
    NULL,
    'Tillsvidare',
    '2024-02-01'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Nguyen Thanh',
    'Le',
    'leebaguettevn@gmail.com',
    '0702656666',
    NULL,
    '2024-07-01',
    'Kyrkogatan 15',
    'Lokal 1'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Ronja',
    'Palm',
    'ronja.palm1@hotmail.com',
    '0706711819',
    NULL,
    '2024-09-01',
    'Fortifikationsgatan 10',
    'Lgh 1001/1'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Vivi-Anne',
    'Svensson',
    'viv.sve@outlook.com',
    '0732066015',
    NULL,
    '2023-03-09',
    'Hagagatan 5',
    'Lgh 1102/5'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    'Banes Kebab &amp;',
    'Pizza',
    'ayad373@yahoo.com',
    'Lokal 2',
    NULL,
    NULL,
    'Lokal',
    'Kyrkogatan 15'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

-- Importera lägenheter
INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Gångbrogatan',
    '13',
    'Lgh 1001/8',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Fortifikationsgatan',
    '10',
    'Lgh 1101/4',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Lokal',
    '',
    'Kyrkogatan 15',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Fortifikationsgatan',
    '10',
    'Lgh 1102/5',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Chapmansgatan',
    '6',
    'Lgh 1002/2',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Fortifikationsgatan',
    '10',
    'Lgh 1103/6',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Chapmansgatan',
    '6',
    'Lgh 1001/1',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Fortifikationsgatan',
    '10',
    'Lgh 1104/7',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Tillsvidare',
    '',
    '2024-02-01',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Fortifikationsgatan',
    '10',
    'Lgh 1002/2',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Fortifikationsgatan',
    '10',
    'Lgh 1001/1',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Tillsvidare',
    '',
    '2023-01-01',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Fortifikationsgatan',
    '1',
    'Lgh 1001/1',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Gångbrogatan',
    '13',
    'Lgh 1104/10',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Fortifikationsgatan',
    '10',
    'Lgh 1003/3',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Gångbrogatan',
    '13',
    'Lgh 1203/13',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Gångbrogatan',
    '13',
    'Lgh 1201/11',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Hagagatan',
    '5',
    'Lgh 1001/2',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Chapmansgatan',
    '6',
    'Lgh 1101/3',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Chapmansgatan',
    '6',
    'Lgh 1102/4',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Hagagatan',
    '5',
    'Lgh 1002/3',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Kyrkogatan',
    '15',
    'Lokal 1',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Tillsvidare',
    '',
    '2024-05-01',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Chapmansgatan',
    '6',
    'Lgh 1202/6',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Tillsvidare',
    '',
    '2024-09-01',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Hagagatan',
    '5',
    'Lgh 1101/1',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Hagagatan',
    '5',
    'Lgh 1102/5',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Hagagatan',
    '5',
    'Lgh 1101/4',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Chapmansgatan',
    '6',
    'Lgh 1201/5',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Gångbrogatan',
    '13',
    'Lgh 1301/14',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Tillsvidare',
    '',
    '2024-04-09',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Nej',
    '',
    'Tillsvidare',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Gångbrogatan',
    '13',
    'Lgh 1202/12',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Gångbrogatan',
    '13',
    'Lgh 1103/9',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    'Fortifikationsgatan',
    '1',
    'Lgh 1207/7',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    postal_code = VALUES(postal_code),
    city = VALUES(city),
    rooms = VALUES(rooms),
    area = VALUES(area),
    price = VALUES(price);

-- Koppla hyresgäster till lägenheter
-- OBS! Detta måste köras efter att hyresgäster och lägenheter har importerats
INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'PM INDIAN SHORNA' AND t.last_name = 'AB'
AND a.street = 'Fortifikationsgatan' AND a.number = '1' AND a.apartment_number = 'Lgh 1207/7'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Fredrik' AND t.last_name = 'Gren'
AND a.street = 'Fortifikationsgatan' AND a.number = '10' AND a.apartment_number = 'Lgh 1103/6'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Haneen' AND t.last_name = 'Masoud'
AND a.street = 'Gångbrogatan' AND a.number = '13' AND a.apartment_number = 'Lgh 1202/12'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Sandra' AND t.last_name = 'Widegren'
AND a.street = 'Gångbrogatan' AND a.number = '13' AND a.apartment_number = 'Lgh 1001/8'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ahmed' AND t.last_name = 'Raimi'
AND a.street = 'Gångbrogatan' AND a.number = '13' AND a.apartment_number = 'Lgh 1103/9'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ibrahim Alshikh' AND t.last_name = 'Mohamad'
AND a.street = 'Gångbrogatan' AND a.number = '13' AND a.apartment_number = 'Lgh 1201/11'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Valhallavägen' AND t.last_name = '10'
AND a.street = 'Nej' AND a.number = '' AND a.apartment_number = 'Tillsvidare'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ali' AND t.last_name = 'Alshikh'
AND a.street = 'Gångbrogatan' AND a.number = '13' AND a.apartment_number = 'Lgh 1104/10'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ulrika' AND t.last_name = 'Gustafsson'
AND a.street = 'Hagagatan' AND a.number = '5' AND a.apartment_number = 'Lgh 1101/1'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Lgh' AND t.last_name = '1102/108'
AND a.street = 'Tillsvidare' AND a.number = '' AND a.apartment_number = '2024-05-01'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Zahra' AND t.last_name = 'Alsalloum'
AND a.street = 'Gångbrogatan' AND a.number = '13' AND a.apartment_number = 'Lgh 1203/13'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Aram' AND t.last_name = 'Hovhannisyan'
AND a.street = 'Chapmansgatan' AND a.number = '6' AND a.apartment_number = 'Lgh 1201/5'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Meja' AND t.last_name = 'Holm'
AND a.street = 'Gångbrogatan' AND a.number = '13' AND a.apartment_number = 'Lgh 1301/14'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Hugo' AND t.last_name = 'Danell'
AND a.street = 'Chapmansgatan' AND a.number = '6' AND a.apartment_number = 'Lgh 1202/6'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Towa' AND t.last_name = 'Jenglér'
AND a.street = 'Fortifikationsgatan' AND a.number = '10' AND a.apartment_number = 'Lgh 1002/2'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Catarina' AND t.last_name = 'Lindström'
AND a.street = 'Hagagatan' AND a.number = '5' AND a.apartment_number = 'Lgh 1001/2'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Fabian' AND t.last_name = 'Arvidsson'
AND a.street = 'Chapmansgatan' AND a.number = '6' AND a.apartment_number = 'Lgh 1102/4'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Sanna' AND t.last_name = 'Bergqvist'
AND a.street = 'Chapmansgatan' AND a.number = '6' AND a.apartment_number = 'Lgh 1002/2'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Jonathan' AND t.last_name = 'Mikael'
AND a.street = 'Fortifikationsgatan' AND a.number = '10' AND a.apartment_number = 'Lgh 1101/4'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Glenn' AND t.last_name = 'Almqvist'
AND a.street = 'Chapmansgatan' AND a.number = '6' AND a.apartment_number = 'Lgh 1001/1'
ON DUPLICATE KEY UPDATE id = id;

-- Ange nödvändiga behörigheter för användaren
GRANT SELECT, INSERT, UPDATE, DELETE ON tenants TO 'boss@d374919'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON apartments TO 'boss@d374919'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON tenant_apartments TO 'boss@d374919'@'%';
