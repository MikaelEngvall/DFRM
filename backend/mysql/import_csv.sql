-- Skapa tabeller för hyresgäster och lägenheter

-- Skapa tenants-tabell
CREATE TABLE IF NOT EXISTS tenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(50),
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
INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Glenn',
    'Almqvist',
    'jimmy.almqvist@blekingerot.se',
    '0708-493949',
    NULL,
    'Chapmansgatan 6',
    'Lgh 1001/1'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Sanna',
    'Bergqvist',
    'sannabergqvist@outlook.com',
    '0723964538',
    NULL,
    'Chapmansgatan 6',
    'Lgh 1002/2'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Aram',
    'Hovhannisyan',
    'suzi.hov@hotmail.com',
    '0708-744534',
    NULL,
    'Chapmansgatan 6',
    'Lgh 1201/5'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Marta',
    'Sargsyan',
    'suzi.hov@hotmail.com',
    '0708-744534',
    NULL,
    'Chapmansgatan 6',
    'Lgh 1101/3'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Hugo',
    'Danell',
    'hugo.danell00@gmail.com',
    '0729-699653',
    NULL,
    'Chapmansgatan 6',
    'Lgh 1202/6'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Fabian',
    'Arvidsson',
    'fabian@wilfab.se',
    '0704222231',
    NULL,
    'Chapmansgatan 6',
    'Lgh 1102/4'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Anne At All',
    'AB',
    'anne@anneatall.se',
    '0706482060',
    NULL,
    'Fortifikationsgatan 1',
    'Lgh 1001/1'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'PM INDIAN SHORNA',
    'AB',
    'alamsmejl@hotmail.com',
    '0739711320',
    NULL,
    'Fortifikationsgatan 1',
    'Lgh 1207/7'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Alice Yu',
    'H�kansson',
    'alice.uy.hakansson@gmail.com',
    '0763128791',
    NULL,
    'Fortifikationsgatan 10',
    'Lgh 1102/5'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Towa',
    'Jengl�r',
    'jenglertowa@gmail.com',
    '0709378441',
    NULL,
    'Fortifikationsgatan 10',
    'Lgh 1002/2'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Ehab Al',
    'Nawakil',
    'ehabalnawakil@gmail.com',
    '0760058318',
    NULL,
    'Fortifikationsgatan 10',
    'Lgh 1003/3'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Jonathan',
    'Mikael',
    'elsa3244@gmail.com',
    '070 145 0872',
    NULL,
    'Fortifikationsgatan 10',
    'Lgh 1101/4'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Fredrik',
    'Gren',
    'fredrikgren1@hotmail.com',
    '0709-162457',
    NULL,
    'Fortifikationsgatan 10',
    'Lgh 1103/6'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Albin',
    'Valastig',
    'albin.valastig@hotmail.com',
    '0767847279',
    NULL,
    'Fortifikationsgatan 10',
    'Lgh 1104/7'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Ronja',
    'Palm',
    'ronja.palm1@hotmail.com',
    '0706711819',
    NULL,
    'Fortifikationsgatan 10',
    'Lgh 1001/1'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Zahra',
    'Alsalloum',
    'ebrahimee250@gmail.com',
    '0760-327146',
    NULL,
    'G�ngbrogatan 13',
    'Lgh 1203/13'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Haneen',
    'Masoud',
    'haneenmasoud199388@gmail.com',
    '0735834362',
    NULL,
    'G�ngbrogatan 13',
    'Lgh 1202/12'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Ali',
    'Alshikh',
    'ali.alshikh1986@gmail.com',
    '0725777778',
    NULL,
    'G�ngbrogatan 13',
    'Lgh 1104/10'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Ahmed',
    'Raimi',
    'ahmadraimi020@gmail.com',
    '0764072017',
    NULL,
    'G�ngbrogatan 13',
    'Lgh 1103/9'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Sandra',
    'Widegren',
    'sandrawidegren5@gmail.com',
    '0735415614',
    NULL,
    'G�ngbrogatan 13',
    'Lgh 1001/8'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Ibrahim Alshikh',
    'Mohamad',
    'ebrahimee250@gmail.com',
    '0768771887',
    NULL,
    'G�ngbrogatan 13',
    'Lgh 1201/11'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Meja',
    'Holm',
    'meja0330@gmail.com',
    '0704448317',
    NULL,
    'G�ngbrogatan 13',
    'Lgh 1301/14'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Ulrika',
    'Gustafsson',
    'vanillo8006@gmail.com',
    '0709103739',
    NULL,
    'Hagagatan 5',
    'Lgh 1101/1'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Catarina',
    'Lindstr�m',
    'catarinalindstrm@yahoo.com',
    '0702-741467',
    NULL,
    'Hagagatan 5',
    'Lgh 1001/2'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Dan',
    'Altehed',
    'alteheddan@yahoo.com',
    '0763175685',
    NULL,
    'Hagagatan 5',
    'Lgh 1101/4'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Azra',
    'Faller',
    'azra_bihorac@hotmail.com',
    '0723390733',
    NULL,
    'Hagagatan 5',
    'Lgh 1002/3'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Vivi-Anne',
    'Svensson',
    'viv.sve@outlook.com',
    '0732066015',
    NULL,
    'Hagagatan 5',
    'Lgh 1102/5'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Nguyen Thanh',
    'Le',
    'leebaguettevn@gmail.com',
    '0702656666',
    NULL,
    'Kyrkogatan 15',
    'Lokal 1'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Banes Kebab &',
    'Pizza',
    'ayad373@yahoo.com',
    NULL,
    NULL,
    'Kyrkogatan 15',
    'Lokal 2'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Aron',
    'Pulkkanen',
    'aronpulkkanen1@gmail.com',
    '0723370636',
    NULL,
    'Kyrkogatan 15',
    'Lgh 1102/2'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Jesu Kristi Kyrka / Sista Dagars',
    'Heliga',
    '2019205-fin@churchofjesuschrist.org',
    '0735-230764',
    NULL,
    'Kyrkogatan 15',
    'Lgh 1301/4'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Phuong Nhung',
    'Lam',
    'nhunglam9045@gmail.com',
    '0790399993',
    NULL,
    'Kyrkogatan 15',
    'Lgh 1201/3'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Tamari',
    'Aptsiauri',
    'tamaraaptsiauri@outlook.com',
    '0736322112',
    NULL,
    'Kyrkogatan 15',
    'Lgh 1101/1'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Isak',
    'Karmberg',
    'karmbergisac@gmail.com',
    '0709725352',
    NULL,
    'Landbrogatan 31A',
    'Lgh 1301/118'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Mhd Jaad Al',
    'jajeh',
    'haitham.aljajeh2003@gmail.com',
    '0737094428',
    NULL,
    'Landbrogatan 31A',
    'Lgh 1101/114'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Jimmie',
    'Alfredsson',
    'jimmie@alfredson.com',
    '0733527762',
    NULL,
    'Landbrogatan 31A',
    'Lgh 1202/115'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Gabriella',
    'Andersson',
    'gabrieella.andersson@gmail.com',
    '0766113211',
    NULL,
    'Landbrogatan 31A',
    'Lgh 1302/117'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Yenna',
    'Andersson',
    'yenna.andersson@icloud.com',
    '0737572052',
    NULL,
    'Landbrogatan 31A',
    'Lgh 1201/116'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Nadezhda',
    'Zaitseva',
    'yura051@mail.ru',
    '0763406226',
    NULL,
    'Landbrogatan 31A',
    'Lgh 1102/113'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Mita',
    'Zonnander',
    'mita.zonnander@hotmail.com',
    '0728834266',
    NULL,
    'Landbrogatan 31B',
    'Lgh 1002/119'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Mattias',
    'Dolk',
    'mattias.dolk@outlook.com',
    '0736691476',
    NULL,
    'Landbrogatan 31B',
    'Lgh 1001/120'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Issa',
    'Alobaid',
    'isaobaid1979@gmail.com',
    '0790-182093',
    NULL,
    'Landbrogatan 31B',
    'Lgh 1302/124'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Darwish i Karlskrona',
    'AB',
    'wesambarberare@gmail.com',
    '0708723264',
    NULL,
    'Landbrogatan 31B',
    'Lokal'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Louise',
    'Lundqvist',
    'l.lundkvist76@gmail.com',
    '0709593948',
    NULL,
    'Landbrogatan 31B',
    'Lgh 1301/125'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Ronja',
    'Jespersen',
    'ronja.jespersen1@gmail.com',
    '0763-900610',
    NULL,
    'Landbrogatan 31B',
    'Lgh 1102/121'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Qasem Khaled Al',
    'Qasimi',
    'k55955521@gmail.com',
    '0764069820',
    NULL,
    'Landbrogatan 31B',
    'Lgh 1101/122'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Edvin',
    'Dapo',
    'edvin321000@gmail.com',
    '0765953020',
    NULL,
    'Landbrogatan 31B',
    'Lgh 1202/123'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Daniel',
    'J�nsson',
    'daniel_j76@hotmail.se',
    '0709286757',
    NULL,
    'S. Smedjegatan 3',
    'Lgh 1301/5'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Lynn',
    'Larsson',
    'larsson.lynn@gmail.com',
    '0768-771593',
    NULL,
    'S. Smedjegatan 3',
    'Lgh 1201/4'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Liwaa Adin Omar',
    'Bhtiti',
    'leoaa1976@hotmail.com',
    '0455-340215, 0729264702',
    NULL,
    'S. Smedjegatan 3',
    'Lgh 1001/1'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Beiges Paola',
    'Orobio',
    'orobio.col26@gmail.com',
    '0735760819',
    NULL,
    'S. Smedjegatan 3',
    'Lgh 1201/2'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Bianca',
    'Mejia',
    'bmejia39@gmail.com',
    '0793514290',
    NULL,
    'S. Smedjegatan 3',
    'Lgh 1101/3'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Christoph Samfass',
    'Dykfirma',
    'unique.dive.travel@hotmail.com',
    '070-8867431',
    NULL,
    'Styrmansgatan 38',
    'Lokal 3'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Ferdos Al',
    'Adawy',
    'fardoos931@gmail.com',
    '0790144037',
    NULL,
    'Styrmansgatan 38',
    'Lokal 2'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Karin',
    'Persson',
    'portalen2018@gmail.com',
    '0708379390',
    NULL,
    'Styrmansgatan 38',
    'Lgh 1001/1'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Jenny  Al-Aezi',
    'Fransson',
    'jennyalaezi@gmail.com',
    '0762607822',
    NULL,
    'Styrmansgatan 38',
    'Lgh 1001/3'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Adnan',
    'Demirovic',
    'demirovicadnan@yahoo.com',
    '0760865620',
    NULL,
    'Styrmansgatan 38',
    'Lgh 1101/2'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Raji Abdelfattah Ali',
    'Jabr',
    'alijabeer2@icloud.com',
    '0723177634',
    NULL,
    'Styrmansgatan 38',
    'Lgh 1101/4'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Rukaya',
    'Alkhalaf',
    'rukayaalkhalaf51@gmail.com',
    '0700541384',
    NULL,
    'Tingsgatan 9',
    'Lgh 1001/3'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Khaled  Chekh',
    'Mohamed',
    'kahlednor339@gmail.com',
    '0760384486',
    NULL,
    'Tingsgatan 9',
    'Lgh 1201/6'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Silvana Yordanova',
    'Milteva',
    'jjkhjjb357@gmail.com',
    '0790404701',
    NULL,
    'Tingsgatan 9',
    'Lgh 1002/1'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Iman Alsheikh',
    'Mohamad',
    'ebrahimee250@gmail.com',
    '0765-174892',
    NULL,
    'Tingsgatan 9',
    'Lgh 1101/4'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Emma',
    'Ahlborg',
    'emma_sulan@hotmail.com',
    '0733-898272',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1102/02'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Johan',
    'Lagerstr�m',
    'johsve5@gmail.com',
    '0709218332',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1103/05'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Manuel Felipe',
    'Yelicich',
    'sweyeli1@hotmail.com',
    '0763453601',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1201/07'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Alfred',
    'Eriksson',
    'alfred.ae.eriksson@gmail.com',
    '0734-266607',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1201/09'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Alexandra',
    'H�kansson',
    'nettans-kryddbod@live.se',
    '0733265925',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1202/10'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Ingemar',
    'Persson',
    'afrim.beka@karlskrona.se',
    NULL,
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1204/12'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Saqib',
    'Zaman',
    'saqiati28@gmail.com',
    '0793449544',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1501/22'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Alicia',
    'Persson',
    'alicia.persson0007@gmail.com',
    '0723078792',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1101/01'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Danny',
    'Simonsson',
    'eye_of_the_sun82@hotmail.com',
    '0708-862706',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1101/03'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Ananda',
    'Karaszi',
    'ananda.himani@gmail.com',
    '0720151003',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1302/14'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Khaled',
    'Hamdan',
    'kh2017026@gmail.com',
    '0735014326',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1403/16'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Tamer M A',
    'Darwish',
    'tamer.darwish1981@gmail.com',
    '0764020789',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1401/21'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Carolin',
    'M�ller',
    'carolin.muller.14@gmail.com',
    '0709-112311',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1202/08'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Jade',
    'Manning',
    'jademanning2022@gmail.com',
    '0720310423',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1203/11'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Per',
    'Gunaropulos',
    'pergun57@gmail.com',
    '0723-947560',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1303/15'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Thitima',
    'Andersson',
    'thitima.andersson@gmail.com',
    '0761-958632',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1002/23'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Marcus',
    'Nilsson',
    'marcusnilsson6@gmail.com',
    '0708605267',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1404/19'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Thitima Andersson',
    '(2)',
    'thitima.andersson@gmail.com',
    '0761958632',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1001/25'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Ulrica',
    'Tillman',
    'ulrica.tillman@gmail.com',
    '0768-542268',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1401/18'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Hanan Nsaif',
    'Jasim',
    'hanan.nsaief1985@gmail.com',
    '0767-161436',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1102/04'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Magnus',
    'Berg',
    'bazze1@live.se',
    '0720-337503',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1104/06'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Eva-Lena',
    'Lindell',
    'eva-lena.lindell@hotmail.com',
    '0760-278336',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1301/13'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Albert',
    'Florinus',
    'abbeflorinus@gmail.com',
    '0760206395',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1402/17'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Pontus',
    'Lindroth',
    'pontuslin99@gmail.com',
    '0733117720',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1001/24'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Tindra',
    'Muller',
    'ppiiiip97123@gmail.com',
    '0768-859522',
    NULL,
    'Utridarev�gen 3 B',
    'Lgh 1402/20'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Wilber',
    'Henriquez',
    'wiber_gr@hotmail.com',
    '0722-938564',
    NULL,
    'V. Prinsgatan 44',
    'Lgh 1102/4'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Christel',
    'J�nsson',
    'christel8989@gmail.com',
    '0724490412',
    NULL,
    'V. Prinsgatan 44',
    'Lgh 1301/9'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Iwona',
    'Slojka',
    'iwona.slojka@gmail.com',
    '0734-292399',
    NULL,
    'V. Prinsgatan 44',
    'Lgh 1303/11'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Annica',
    'Sm�lander',
    'annica24@msn.com',
    '0736-378177',
    NULL,
    'V. Prinsgatan 44',
    'Lgh 1001/1'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Ingrid Britt-Stina',
    'Berglund',
    'britstina@hotmail.com',
    '0705814837',
    NULL,
    'V. Prinsgatan 44',
    'Lgh 1002/2'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Konstantinos',
    'Kiouros',
    'kiouros@hotmail.com',
    '0760-943283',
    NULL,
    'V. Prinsgatan 44',
    'Lgh 1201/6'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Ludvig',
    'Nilsson',
    'ludvig.nilsson15@gmail.com',
    '0737886589',
    NULL,
    'V. Prinsgatan 44',
    'Lgh 1203/8'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Piyaphat',
    'Thongkham',
    'auithongkham@hotmail.com',
    '0765-657662',
    NULL,
    'V. Prinsgatan 44',
    'Lgh 1101/3'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Maj Britt',
    'Nilsson',
    'gunilla.mansson@hotmail.se',
    '0705-825543',
    NULL,
    'V. Prinsgatan 44',
    'Lgh 1103/5'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Ville',
    'Frank',
    'ville.vf.frank@gmail.com',
    '0720157531',
    NULL,
    'V. Prinsgatan 44',
    'Lgh 1202/7'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Jan',
    'Wallin',
    'janwallin63@hotmail.com',
    '0733-108039',
    NULL,
    'V. Prinsgatan 44',
    'Lgh 1302/10'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Tony  Mikael',
    'Brandt',
    'henningssonronny@gmail.com',
    '0706-709179',
    NULL,
    'V. Vittusgatan 2',
    'Lgh 1103/107'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Allan',
    'Jakoub',
    'rinketallan@gmail.com',
    '0733427973',
    NULL,
    'V. Vittusgatan 2',
    'Lgh 1202/110'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Obida',
    'Albasha',
    'obidaalbassa873@gmail.com',
    '0707435635',
    NULL,
    'V. Vittusgatan 2',
    'Lgh 1201/111'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Alina',
    'Yehorova',
    'dizialina@gmail.com',
    '0762-977985',
    NULL,
    'V. Vittusgatan 2',
    'Lgh 1001/105'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Sharmarke Ali',
    'Hussein',
    'sharmarke.aliiihussein@gmail.com',
    '0762757585 ',
    NULL,
    'V. Vittusgatan 2',
    'Lgh 1002/106'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Konrad Karol',
    'Koblak',
    'konrad.koblak@gmail.com',
    '0703024958',
    NULL,
    'V. Vittusgatan 2',
    'Lgh 1102/108'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Sompong',
    'Rosenius',
    'thomas.blissing@gmail.com',
    '0709499170',
    NULL,
    'V. Vittusgatan 2',
    'Lgh 1101/109'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Johan',
    'Olofsson',
    'stigsdotter.johnson@gmail.com',
    '0734-066824',
    NULL,
    'Valhallavägen 10',
    'Lgh 1101C/111'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Malin',
    'Jensen',
    'malinjensen01@gmail.com',
    '0709207104',
    NULL,
    'Valhallavägen 10',
    'Lgh 1002C/102'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Karol',
    'Pundzis',
    NULL,
    '0737-574943',
    NULL,
    'Valhallavägen 10',
    'Lgh 1002B/104'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Jack',
    '�kesson',
    'jackakesson7@gmail.com',
    '0763251722',
    NULL,
    'Valhallavägen 10',
    'Lgh 1001A/0108'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Roland',
    'Runberg',
    NULL,
    '0709-640022',
    NULL,
    'Valhallavägen 10',
    'Lgh 1202C/110'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Anas',
    'Alhariri',
    'anasalhariri0085@gmail.com',
    '0707135200',
    NULL,
    'Valhallavägen 10',
    'Lgh 1102B/112'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Alen',
    'Qenaj',
    'alenqenaj2@gmail.com',
    '0762-876855',
    NULL,
    'Valhallavägen 10',
    'Lgh 1102A/115'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Michael',
    'Mostr�m',
    'mikewestse@gmail.com',
    '0760368890',
    NULL,
    'Valhallavägen 10',
    'Lgh 1201C/119'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Bashir',
    'Rames',
    'dragan.cado@karlskrona.se',
    '0700-284-117',
    NULL,
    'Valhallavägen 10',
    'Lgh 0902C/126'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Kayleigh Laura',
    'Mildner',
    'kayleigh.laura.mildner@gmail.com',
    '0760507221',
    NULL,
    'Valhallavägen 10',
    'Lgh 1201A/124'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Jimmy Steen',
    'Karlman',
    'kaptenssg@gmail.com',
    '0708898929',
    NULL,
    'Valhallavägen 10',
    'Lgh 0903C/127'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Omar Al',
    'Zoaabi',
    'omar.alzoaabi@gmail.com',
    '0700430083',
    NULL,
    'Valhallavägen 10',
    'Lgh 1202A/123'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Zirak Ali Shaheen',
    'Rehman',
    'zkgtmotors@gmail.com',
    '0706101349',
    NULL,
    'Valhallavägen 10',
    'Lgh 1103A/114'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Vidhyadhari',
    'Gurrala',
    'vidhyadhari98@gmail.com',
    '0793576762',
    NULL,
    'Valhallavägen 10',
    'Lgh 1001C/103'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Nikita',
    'Karlsson',
    'nikita.karlsson002@hotmail.com',
    '0707691032',
    NULL,
    'Valhallavägen 10',
    'Lgh 1202A/123'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Savithri Venkata',
    'Tejeswar',
    'savithrivenkatatejeswar@gmail.com',
    '0793537281',
    NULL,
    'Valhallavägen 10',
    'Lgh 1002A/107'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Kenneth',
    'Persson',
    NULL,
    '0455-26435',
    NULL,
    'Valhallavägen 10',
    'Lgh 1103C/109'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Jan',
    'Tax�n',
    'jantaxen49@hotmail.com',
    '0733-662691',
    NULL,
    'Valhallavägen 10',
    'Lgh 1101B/113'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Yaser Ziad Nofal',
    'Darwish',
    'yy0477906@gmail.com',
    '0762828283',
    NULL,
    'Valhallavägen 10',
    'Lgh 0901C/125'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Jonathan Adam',
    'Lindh',
    'lindh.jonathan@gmail.com',
    '0727-172839',
    NULL,
    'Valhallavägen 10',
    'Lgh 1301B/121'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Mohammad Mheear Al',
    'Rifai',
    'mheearalrifai10@icloud.com',
    '0735853228',
    NULL,
    'Valhallavägen 10',
    'Lgh 1003A/106'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Joakim',
    'Rickardsson',
    'spicycook1986@gmail.com',
    '0705-822978',
    NULL,
    'Valhallavägen 10',
    'Lgh 1203C/117'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Kabir',
    'Husseini',
    'kabir.husseini.20011010@gmail.com',
    '0763-226685',
    NULL,
    'Valhallavägen 10',
    'Lgh 1203A/122'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Hassan',
    'Kassar',
    'hasan.kassar1@gmail.com',
    '0728-362350',
    NULL,
    'Valhallavägen 10',
    'Lgh 1001C/103'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Nikita Lillian',
    'Kristofikova',
    'nlkristofikova@gmail.com',
    '0733291504',
    NULL,
    'Valhallavägen 10',
    'Lgh 1003C/101'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Eleonor',
    '�lstig',
    'eleonor.alstig@gmail.com',
    '0727048845',
    NULL,
    'Valhallavägen 10',
    'Lgh 1001B/105'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Mai',
    'Nantachad',
    'mai_dahlberg@hotmail.com',
    '0761057765',
    NULL,
    'Valhallavägen 10',
    'Lgh 1101A/116'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Per-Anders',
    'Persson',
    'solisofelix@gmail.com',
    '0709-843806',
    NULL,
    'Valhallavägen 10',
    'Lgh 1202C/118'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no) VALUES (
    'Mikael',
    'Persson',
    'mikaelpersson123@yahoo.com',
    '0704-085934',
    NULL,
    'Valhallavägen 10',
    'Lgh 1202B/120'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

-- Importera lägenheter
INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'G�ngbrogatan',
    '13',
    'Lgh 1202/12',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'V. Prinsgatan',
    '44',
    'Lgh 1101/3',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1303/15',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Fortifikationsgatan',
    '10',
    'Lgh 1102/5',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1102B/112',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Landbrogatan 31B',
    '',
    'Lgh 1001/120',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1002/23',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1103/05',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'V. Vittusgatan',
    '2',
    'Lgh 1002/106',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Landbrogatan 31A',
    '',
    'Lgh 1102/113',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Styrmansgatan',
    '38',
    'Lgh 1001/3',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Hagagatan',
    '5',
    'Lgh 1001/2',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Styrmansgatan',
    '38',
    'Lgh 1001/1',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1101B/113',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Chapmansgatan',
    '6',
    'Lgh 1102/4',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'S. Smedjegatan',
    '3',
    'Lgh 1001/1',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1203/11',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Hagagatan',
    '5',
    'Lgh 1102/5',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1202B/120',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'G�ngbrogatan',
    '13',
    'Lgh 1104/10',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1401/18',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Landbrogatan 31B',
    '',
    'Lgh 1102/121',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'S. Smedjegatan',
    '3',
    'Lgh 1201/2',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Landbrogatan 31A',
    '',
    'Lgh 1201/116',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1301B/121',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1103C/109',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1001B/105',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'S. Smedjegatan',
    '3',
    'Lgh 1201/4',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'V. Prinsgatan',
    '44',
    'Lgh 1202/7',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'V. Vittusgatan',
    '2',
    'Lgh 1101/109',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1301/13',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Fortifikationsgatan',
    '10',
    'Lgh 1103/6',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Chapmansgatan',
    '6',
    'Lgh 1001/1',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Landbrogatan 31A',
    '',
    'Lgh 1202/115',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1202/10',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Kyrkogatan',
    '15',
    'Lgh 1101/1',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Kyrkogatan',
    '15',
    'Lgh 1301/4',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Tingsgatan',
    '9',
    'Lgh 1101/4',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1101/01',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'V. Prinsgatan',
    '44',
    'Lgh 1002/2',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Fortifikationsgatan',
    '10',
    'Lgh 1001/1',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1101/03',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1203C/117',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1002C/102',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 0902C/126',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Chapmansgatan',
    '6',
    'Lgh 1202/6',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Landbrogatan 31A',
    '',
    'Lgh 1302/117',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'V. Vittusgatan',
    '2',
    'Lgh 1001/105',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Tingsgatan',
    '9',
    'Lgh 1002/1',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'V. Vittusgatan',
    '2',
    'Lgh 1202/110',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'V. Prinsgatan',
    '44',
    'Lgh 1301/9',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1001/24',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1001/25',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Landbrogatan 31B',
    '',
    'Lgh 1301/125',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1002A/107',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'V. Prinsgatan',
    '44',
    'Lgh 1303/11',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Landbrogatan 31B',
    '',
    'Lgh 1002/119',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'V. Prinsgatan',
    '44',
    'Lgh 1203/8',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1403/16',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Fortifikationsgatan',
    '1',
    'Lgh 1207/7',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Landbrogatan 31B',
    '',
    'Lgh 1302/124',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1101C/111',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Chapmansgatan',
    '6',
    'Lgh 1002/2',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1001A/0108',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Fortifikationsgatan',
    '10',
    'Lgh 1104/7',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1201C/119',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Landbrogatan 31B',
    '',
    'Lokal',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'S. Smedjegatan',
    '3',
    'Lgh 1101/3',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'V. Prinsgatan',
    '44',
    'Lgh 1103/5',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Kyrkogatan',
    '15',
    'Lgh 1102/2',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Fortifikationsgatan',
    '10',
    'Lgh 1002/2',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1402/17',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'V. Prinsgatan',
    '44',
    'Lgh 1001/1',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1203A/122',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Landbrogatan 31A',
    '',
    'Lgh 1101/114',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1102A/115',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'G�ngbrogatan',
    '13',
    'Lgh 1203/13',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1202/08',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1202A/123',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1302/14',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Tingsgatan',
    '9',
    'Lgh 1001/3',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'V. Vittusgatan',
    '2',
    'Lgh 1102/108',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Landbrogatan 31B',
    '',
    'Lgh 1101/122',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 0903C/127',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1001C/103',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'S. Smedjegatan',
    '3',
    'Lgh 1301/5',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Chapmansgatan',
    '6',
    'Lgh 1201/5',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1103A/114',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1104/06',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1204/12',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'G�ngbrogatan',
    '13',
    'Lgh 1301/14',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1202C/118',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1402/20',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1202C/110',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1201/09',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1201/07',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Tingsgatan',
    '9',
    'Lgh 1201/6',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Fortifikationsgatan',
    '10',
    'Lgh 1101/4',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1003C/101',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'V. Prinsgatan',
    '44',
    'Lgh 1102/4',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1501/22',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1201A/124',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1404/19',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'G�ngbrogatan',
    '13',
    'Lgh 1103/9',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Landbrogatan 31A',
    '',
    'Lgh 1301/118',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Fortifikationsgatan',
    '1',
    'Lgh 1001/1',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Fortifikationsgatan',
    '10',
    'Lgh 1003/3',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'V. Prinsgatan',
    '44',
    'Lgh 1302/10',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1003A/106',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1401/21',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'V. Vittusgatan',
    '2',
    'Lgh 1103/107',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Kyrkogatan',
    '15',
    'Lokal 2',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Styrmansgatan',
    '38',
    'Lokal 2',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Chapmansgatan',
    '6',
    'Lgh 1101/3',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Styrmansgatan',
    '38',
    'Lokal 3',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Hagagatan',
    '5',
    'Lgh 1002/3',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Kyrkogatan',
    '15',
    'Lokal 1',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Kyrkogatan',
    '15',
    'Lgh 1201/3',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'G�ngbrogatan',
    '13',
    'Lgh 1201/11',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1101A/116',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 1002B/104',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Styrmansgatan',
    '38',
    'Lgh 1101/4',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Hagagatan',
    '5',
    'Lgh 1101/1',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Landbrogatan 31B',
    '',
    'Lgh 1202/123',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Hagagatan',
    '5',
    'Lgh 1101/4',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Styrmansgatan',
    '38',
    'Lgh 1101/2',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1102/04',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Utridarev�gen 3 B',
    '',
    'Lgh 1102/02',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'Valhallavägen',
    '10',
    'Lgh 0901C/125',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'V. Prinsgatan',
    '44',
    'Lgh 1201/6',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'V. Vittusgatan',
    '2',
    'Lgh 1201/111',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

INSERT INTO apartments (street, number, apartment_number, postal_code, city) VALUES (
    'G�ngbrogatan',
    '13',
    'Lgh 1001/8',
    NULL,
    NULL
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number);

-- Koppla hyresgäster till lägenheter
INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Glenn' AND t.last_name = 'Almqvist'
AND a.street = 'Chapmansgatan' AND a.number = '6' AND a.apartment_number = 'Lgh 1001/1'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Sanna' AND t.last_name = 'Bergqvist'
AND a.street = 'Chapmansgatan' AND a.number = '6' AND a.apartment_number = 'Lgh 1002/2'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Aram' AND t.last_name = 'Hovhannisyan'
AND a.street = 'Chapmansgatan' AND a.number = '6' AND a.apartment_number = 'Lgh 1201/5'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Marta' AND t.last_name = 'Sargsyan'
AND a.street = 'Chapmansgatan' AND a.number = '6' AND a.apartment_number = 'Lgh 1101/3'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Hugo' AND t.last_name = 'Danell'
AND a.street = 'Chapmansgatan' AND a.number = '6' AND a.apartment_number = 'Lgh 1202/6'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Fabian' AND t.last_name = 'Arvidsson'
AND a.street = 'Chapmansgatan' AND a.number = '6' AND a.apartment_number = 'Lgh 1102/4'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Anne At All' AND t.last_name = 'AB'
AND a.street = 'Fortifikationsgatan' AND a.number = '1' AND a.apartment_number = 'Lgh 1001/1'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'PM INDIAN SHORNA' AND t.last_name = 'AB'
AND a.street = 'Fortifikationsgatan' AND a.number = '1' AND a.apartment_number = 'Lgh 1207/7'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Alice Yu' AND t.last_name = 'Hkansson'
AND a.street = 'Fortifikationsgatan' AND a.number = '10' AND a.apartment_number = 'Lgh 1102/5'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Towa' AND t.last_name = 'Jenglr'
AND a.street = 'Fortifikationsgatan' AND a.number = '10' AND a.apartment_number = 'Lgh 1002/2'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ehab Al' AND t.last_name = 'Nawakil'
AND a.street = 'Fortifikationsgatan' AND a.number = '10' AND a.apartment_number = 'Lgh 1003/3'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Jonathan' AND t.last_name = 'Mikael'
AND a.street = 'Fortifikationsgatan' AND a.number = '10' AND a.apartment_number = 'Lgh 1101/4'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Fredrik' AND t.last_name = 'Gren'
AND a.street = 'Fortifikationsgatan' AND a.number = '10' AND a.apartment_number = 'Lgh 1103/6'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Albin' AND t.last_name = 'Valastig'
AND a.street = 'Fortifikationsgatan' AND a.number = '10' AND a.apartment_number = 'Lgh 1104/7'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ronja' AND t.last_name = 'Palm'
AND a.street = 'Fortifikationsgatan' AND a.number = '10' AND a.apartment_number = 'Lgh 1001/1'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Zahra' AND t.last_name = 'Alsalloum'
AND a.street = 'Gngbrogatan' AND a.number = '13' AND a.apartment_number = 'Lgh 1203/13'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Haneen' AND t.last_name = 'Masoud'
AND a.street = 'Gngbrogatan' AND a.number = '13' AND a.apartment_number = 'Lgh 1202/12'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ali' AND t.last_name = 'Alshikh'
AND a.street = 'Gngbrogatan' AND a.number = '13' AND a.apartment_number = 'Lgh 1104/10'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ahmed' AND t.last_name = 'Raimi'
AND a.street = 'Gngbrogatan' AND a.number = '13' AND a.apartment_number = 'Lgh 1103/9'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Sandra' AND t.last_name = 'Widegren'
AND a.street = 'Gngbrogatan' AND a.number = '13' AND a.apartment_number = 'Lgh 1001/8'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ibrahim Alshikh' AND t.last_name = 'Mohamad'
AND a.street = 'Gngbrogatan' AND a.number = '13' AND a.apartment_number = 'Lgh 1201/11'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Meja' AND t.last_name = 'Holm'
AND a.street = 'Gngbrogatan' AND a.number = '13' AND a.apartment_number = 'Lgh 1301/14'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ulrika' AND t.last_name = 'Gustafsson'
AND a.street = 'Hagagatan' AND a.number = '5' AND a.apartment_number = 'Lgh 1101/1'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Catarina' AND t.last_name = 'Lindstrm'
AND a.street = 'Hagagatan' AND a.number = '5' AND a.apartment_number = 'Lgh 1001/2'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Dan' AND t.last_name = 'Altehed'
AND a.street = 'Hagagatan' AND a.number = '5' AND a.apartment_number = 'Lgh 1101/4'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Azra' AND t.last_name = 'Faller'
AND a.street = 'Hagagatan' AND a.number = '5' AND a.apartment_number = 'Lgh 1002/3'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Vivi-Anne' AND t.last_name = 'Svensson'
AND a.street = 'Hagagatan' AND a.number = '5' AND a.apartment_number = 'Lgh 1102/5'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Nguyen Thanh' AND t.last_name = 'Le'
AND a.street = 'Kyrkogatan' AND a.number = '15' AND a.apartment_number = 'Lokal 1'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Banes Kebab &' AND t.last_name = 'Pizza'
AND a.street = 'Kyrkogatan' AND a.number = '15' AND a.apartment_number = 'Lokal 2'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Aron' AND t.last_name = 'Pulkkanen'
AND a.street = 'Kyrkogatan' AND a.number = '15' AND a.apartment_number = 'Lgh 1102/2'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Jesu Kristi Kyrka / Sista Dagars' AND t.last_name = 'Heliga'
AND a.street = 'Kyrkogatan' AND a.number = '15' AND a.apartment_number = 'Lgh 1301/4'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Phuong Nhung' AND t.last_name = 'Lam'
AND a.street = 'Kyrkogatan' AND a.number = '15' AND a.apartment_number = 'Lgh 1201/3'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Tamari' AND t.last_name = 'Aptsiauri'
AND a.street = 'Kyrkogatan' AND a.number = '15' AND a.apartment_number = 'Lgh 1101/1'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Isak' AND t.last_name = 'Karmberg'
AND a.street = 'Landbrogatan 31A' AND a.number = '' AND a.apartment_number = 'Lgh 1301/118'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Mhd Jaad Al' AND t.last_name = 'jajeh'
AND a.street = 'Landbrogatan 31A' AND a.number = '' AND a.apartment_number = 'Lgh 1101/114'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Jimmie' AND t.last_name = 'Alfredsson'
AND a.street = 'Landbrogatan 31A' AND a.number = '' AND a.apartment_number = 'Lgh 1202/115'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Gabriella' AND t.last_name = 'Andersson'
AND a.street = 'Landbrogatan 31A' AND a.number = '' AND a.apartment_number = 'Lgh 1302/117'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Yenna' AND t.last_name = 'Andersson'
AND a.street = 'Landbrogatan 31A' AND a.number = '' AND a.apartment_number = 'Lgh 1201/116'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Nadezhda' AND t.last_name = 'Zaitseva'
AND a.street = 'Landbrogatan 31A' AND a.number = '' AND a.apartment_number = 'Lgh 1102/113'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Mita' AND t.last_name = 'Zonnander'
AND a.street = 'Landbrogatan 31B' AND a.number = '' AND a.apartment_number = 'Lgh 1002/119'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Mattias' AND t.last_name = 'Dolk'
AND a.street = 'Landbrogatan 31B' AND a.number = '' AND a.apartment_number = 'Lgh 1001/120'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Issa' AND t.last_name = 'Alobaid'
AND a.street = 'Landbrogatan 31B' AND a.number = '' AND a.apartment_number = 'Lgh 1302/124'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Darwish i Karlskrona' AND t.last_name = 'AB'
AND a.street = 'Landbrogatan 31B' AND a.number = '' AND a.apartment_number = 'Lokal'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Louise' AND t.last_name = 'Lundqvist'
AND a.street = 'Landbrogatan 31B' AND a.number = '' AND a.apartment_number = 'Lgh 1301/125'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ronja' AND t.last_name = 'Jespersen'
AND a.street = 'Landbrogatan 31B' AND a.number = '' AND a.apartment_number = 'Lgh 1102/121'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Qasem Khaled Al' AND t.last_name = 'Qasimi'
AND a.street = 'Landbrogatan 31B' AND a.number = '' AND a.apartment_number = 'Lgh 1101/122'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Edvin' AND t.last_name = 'Dapo'
AND a.street = 'Landbrogatan 31B' AND a.number = '' AND a.apartment_number = 'Lgh 1202/123'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Daniel' AND t.last_name = 'Jnsson'
AND a.street = 'S. Smedjegatan' AND a.number = '3' AND a.apartment_number = 'Lgh 1301/5'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Lynn' AND t.last_name = 'Larsson'
AND a.street = 'S. Smedjegatan' AND a.number = '3' AND a.apartment_number = 'Lgh 1201/4'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Liwaa Adin Omar' AND t.last_name = 'Bhtiti'
AND a.street = 'S. Smedjegatan' AND a.number = '3' AND a.apartment_number = 'Lgh 1001/1'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Beiges Paola' AND t.last_name = 'Orobio'
AND a.street = 'S. Smedjegatan' AND a.number = '3' AND a.apartment_number = 'Lgh 1201/2'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Bianca' AND t.last_name = 'Mejia'
AND a.street = 'S. Smedjegatan' AND a.number = '3' AND a.apartment_number = 'Lgh 1101/3'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Christoph Samfass' AND t.last_name = 'Dykfirma'
AND a.street = 'Styrmansgatan' AND a.number = '38' AND a.apartment_number = 'Lokal 3'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ferdos Al' AND t.last_name = 'Adawy'
AND a.street = 'Styrmansgatan' AND a.number = '38' AND a.apartment_number = 'Lokal 2'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Karin' AND t.last_name = 'Persson'
AND a.street = 'Styrmansgatan' AND a.number = '38' AND a.apartment_number = 'Lgh 1001/1'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Jenny  Al-Aezi' AND t.last_name = 'Fransson'
AND a.street = 'Styrmansgatan' AND a.number = '38' AND a.apartment_number = 'Lgh 1001/3'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Adnan' AND t.last_name = 'Demirovic'
AND a.street = 'Styrmansgatan' AND a.number = '38' AND a.apartment_number = 'Lgh 1101/2'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Raji Abdelfattah Ali' AND t.last_name = 'Jabr'
AND a.street = 'Styrmansgatan' AND a.number = '38' AND a.apartment_number = 'Lgh 1101/4'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Rukaya' AND t.last_name = 'Alkhalaf'
AND a.street = 'Tingsgatan' AND a.number = '9' AND a.apartment_number = 'Lgh 1001/3'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Khaled  Chekh' AND t.last_name = 'Mohamed'
AND a.street = 'Tingsgatan' AND a.number = '9' AND a.apartment_number = 'Lgh 1201/6'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Silvana Yordanova' AND t.last_name = 'Milteva'
AND a.street = 'Tingsgatan' AND a.number = '9' AND a.apartment_number = 'Lgh 1002/1'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Iman Alsheikh' AND t.last_name = 'Mohamad'
AND a.street = 'Tingsgatan' AND a.number = '9' AND a.apartment_number = 'Lgh 1101/4'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Emma' AND t.last_name = 'Ahlborg'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1102/02'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Johan' AND t.last_name = 'Lagerstrm'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1103/05'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Manuel Felipe' AND t.last_name = 'Yelicich'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1201/07'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Alfred' AND t.last_name = 'Eriksson'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1201/09'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Alexandra' AND t.last_name = 'Hkansson'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1202/10'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ingemar' AND t.last_name = 'Persson'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1204/12'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Saqib' AND t.last_name = 'Zaman'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1501/22'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Alicia' AND t.last_name = 'Persson'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1101/01'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Danny' AND t.last_name = 'Simonsson'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1101/03'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ananda' AND t.last_name = 'Karaszi'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1302/14'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Khaled' AND t.last_name = 'Hamdan'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1403/16'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Tamer M A' AND t.last_name = 'Darwish'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1401/21'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Carolin' AND t.last_name = 'Mller'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1202/08'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Jade' AND t.last_name = 'Manning'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1203/11'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Per' AND t.last_name = 'Gunaropulos'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1303/15'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Thitima' AND t.last_name = 'Andersson'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1002/23'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Marcus' AND t.last_name = 'Nilsson'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1404/19'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Thitima Andersson' AND t.last_name = '(2)'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1001/25'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ulrica' AND t.last_name = 'Tillman'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1401/18'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Hanan Nsaif' AND t.last_name = 'Jasim'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1102/04'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Magnus' AND t.last_name = 'Berg'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1104/06'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Eva-Lena' AND t.last_name = 'Lindell'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1301/13'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Albert' AND t.last_name = 'Florinus'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1402/17'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Pontus' AND t.last_name = 'Lindroth'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1001/24'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Tindra' AND t.last_name = 'Muller'
AND a.street = 'Utridarevgen 3 B' AND a.number = '' AND a.apartment_number = 'Lgh 1402/20'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Wilber' AND t.last_name = 'Henriquez'
AND a.street = 'V. Prinsgatan' AND a.number = '44' AND a.apartment_number = 'Lgh 1102/4'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Christel' AND t.last_name = 'Jnsson'
AND a.street = 'V. Prinsgatan' AND a.number = '44' AND a.apartment_number = 'Lgh 1301/9'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Iwona' AND t.last_name = 'Slojka'
AND a.street = 'V. Prinsgatan' AND a.number = '44' AND a.apartment_number = 'Lgh 1303/11'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Annica' AND t.last_name = 'Smlander'
AND a.street = 'V. Prinsgatan' AND a.number = '44' AND a.apartment_number = 'Lgh 1001/1'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ingrid Britt-Stina' AND t.last_name = 'Berglund'
AND a.street = 'V. Prinsgatan' AND a.number = '44' AND a.apartment_number = 'Lgh 1002/2'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Konstantinos' AND t.last_name = 'Kiouros'
AND a.street = 'V. Prinsgatan' AND a.number = '44' AND a.apartment_number = 'Lgh 1201/6'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ludvig' AND t.last_name = 'Nilsson'
AND a.street = 'V. Prinsgatan' AND a.number = '44' AND a.apartment_number = 'Lgh 1203/8'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Piyaphat' AND t.last_name = 'Thongkham'
AND a.street = 'V. Prinsgatan' AND a.number = '44' AND a.apartment_number = 'Lgh 1101/3'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Maj Britt' AND t.last_name = 'Nilsson'
AND a.street = 'V. Prinsgatan' AND a.number = '44' AND a.apartment_number = 'Lgh 1103/5'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ville' AND t.last_name = 'Frank'
AND a.street = 'V. Prinsgatan' AND a.number = '44' AND a.apartment_number = 'Lgh 1202/7'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Jan' AND t.last_name = 'Wallin'
AND a.street = 'V. Prinsgatan' AND a.number = '44' AND a.apartment_number = 'Lgh 1302/10'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Tony  Mikael' AND t.last_name = 'Brandt'
AND a.street = 'V. Vittusgatan' AND a.number = '2' AND a.apartment_number = 'Lgh 1103/107'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Allan' AND t.last_name = 'Jakoub'
AND a.street = 'V. Vittusgatan' AND a.number = '2' AND a.apartment_number = 'Lgh 1202/110'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Obida' AND t.last_name = 'Albasha'
AND a.street = 'V. Vittusgatan' AND a.number = '2' AND a.apartment_number = 'Lgh 1201/111'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Alina' AND t.last_name = 'Yehorova'
AND a.street = 'V. Vittusgatan' AND a.number = '2' AND a.apartment_number = 'Lgh 1001/105'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Sharmarke Ali' AND t.last_name = 'Hussein'
AND a.street = 'V. Vittusgatan' AND a.number = '2' AND a.apartment_number = 'Lgh 1002/106'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Konrad Karol' AND t.last_name = 'Koblak'
AND a.street = 'V. Vittusgatan' AND a.number = '2' AND a.apartment_number = 'Lgh 1102/108'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Sompong' AND t.last_name = 'Rosenius'
AND a.street = 'V. Vittusgatan' AND a.number = '2' AND a.apartment_number = 'Lgh 1101/109'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Johan' AND t.last_name = 'Olofsson'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1101C/111'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Malin' AND t.last_name = 'Jensen'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1002C/102'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Karol' AND t.last_name = 'Pundzis'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1002B/104'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Jack' AND t.last_name = 'kesson'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1001A/0108'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Roland' AND t.last_name = 'Runberg'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1202C/110'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Anas' AND t.last_name = 'Alhariri'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1102B/112'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Alen' AND t.last_name = 'Qenaj'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1102A/115'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Michael' AND t.last_name = 'Mostrm'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1201C/119'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Bashir' AND t.last_name = 'Rames'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 0902C/126'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Kayleigh Laura' AND t.last_name = 'Mildner'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1201A/124'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Jimmy Steen' AND t.last_name = 'Karlman'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 0903C/127'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Omar Al' AND t.last_name = 'Zoaabi'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1202A/123'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Zirak Ali Shaheen' AND t.last_name = 'Rehman'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1103A/114'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Vidhyadhari' AND t.last_name = 'Gurrala'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1001C/103'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Nikita' AND t.last_name = 'Karlsson'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1202A/123'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Savithri Venkata' AND t.last_name = 'Tejeswar'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1002A/107'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Kenneth' AND t.last_name = 'Persson'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1103C/109'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Jan' AND t.last_name = 'Taxn'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1101B/113'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Yaser Ziad Nofal' AND t.last_name = 'Darwish'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 0901C/125'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Jonathan Adam' AND t.last_name = 'Lindh'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1301B/121'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Mohammad Mheear Al' AND t.last_name = 'Rifai'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1003A/106'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Joakim' AND t.last_name = 'Rickardsson'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1203C/117'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Kabir' AND t.last_name = 'Husseini'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1203A/122'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Hassan' AND t.last_name = 'Kassar'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1001C/103'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Nikita Lillian' AND t.last_name = 'Kristofikova'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1003C/101'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Eleonor' AND t.last_name = 'lstig'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1001B/105'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Mai' AND t.last_name = 'Nantachad'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1101A/116'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Per-Anders' AND t.last_name = 'Persson'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1202C/118'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Mikael' AND t.last_name = 'Persson'
AND a.street = 'Valhallavägen' AND a.number = '10' AND a.apartment_number = 'Lgh 1202B/120'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

-- Ange nödvändiga behörigheter för användaren
GRANT SELECT, INSERT, UPDATE, DELETE ON tenants TO 'boss@d374919'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON apartments TO 'boss@d374919'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON tenant_apartments TO 'boss@d374919'@'%';
