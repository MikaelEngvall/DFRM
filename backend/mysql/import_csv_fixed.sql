-- Skapa tabeller fÃ¶r hyresgÃ¤ster och lÃ¤genheter

-- Skapa tenants-tabell
CREATE TABLE IF NOT EXISTS tenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(50),
    moved_in_date DATE,
    street VARCHAR(100),
    number VARCHAR(50),
    apartment_no VARCHAR(50),
    old VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (first_name, last_name)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Skapa apartments-tabell
CREATE TABLE IF NOT EXISTS apartments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    street VARCHAR(100) NOT NULL,
    number VARCHAR(50),
    apartment_number VARCHAR(50),
    old VARCHAR(50),
    postal_code VARCHAR(50),
    city VARCHAR(100),
    rooms INT,
    area DECIMAL(10,2),
    price DECIMAL(10,2),
    move_in_date DATE,
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

-- Importera hyresgÃ¤ster
INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Glenn',
    'Almqvist',
    'jimmy.almqvist@blekingerot.se',
    '0708-493949',
    NULL,
    'Chapmansgatan',
    '6',
    'Lgh 1001',
    '1'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Sanna',
    'Bergqvist',
    'sannabergqvist@outlook.com',
    '0723964538',
    NULL,
    'Chapmansgatan',
    '6',
    'Lgh 1002',
    '2'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Aram',
    'Hovhannisyan',
    'suzi.hov@hotmail.com',
    '0708-744534',
    NULL,
    'Chapmansgatan',
    '6',
    'Lgh 1201',
    '5'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Marta',
    'Sargsyan',
    'suzi.hov@hotmail.com',
    '0708-744534',
    NULL,
    'Chapmansgatan',
    '6',
    'Lgh 1101',
    '3'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Hugo',
    'Danell',
    'hugo.danell00@gmail.com',
    '0729-699653',
    NULL,
    'Chapmansgatan',
    '6',
    'Lgh 1202',
    '6'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Fabian',
    'Arvidsson',
    'fabian@wilfab.se',
    '0704222231',
    NULL,
    'Chapmansgatan',
    '6',
    'Lgh 1102',
    '4'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Anne At All',
    'AB',
    'anne@anneatall.se',
    '0706482060',
    NULL,
    'Fortifikationsgatan',
    '1',
    'Lgh 1001',
    '1'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'PM INDIAN SHORNA',
    'AB',
    'alamsmejl@hotmail.com',
    '0739711320',
    NULL,
    'Fortifikationsgatan',
    '1',
    'Lgh 1207',
    '7'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Alice Yu',
    'Hï¿½kansson',
    'alice.uy.hakansson@gmail.com',
    '0763128791',
    NULL,
    'Fortifikationsgatan',
    '10',
    'Lgh 1102',
    '5'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Towa',
    'Jenglï¿½r',
    'jenglertowa@gmail.com',
    '0709378441',
    NULL,
    'Fortifikationsgatan',
    '10',
    'Lgh 1002',
    '2'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Ehab Al',
    'Nawakil',
    'ehabalnawakil@gmail.com',
    '0760058318',
    NULL,
    'Fortifikationsgatan',
    '10',
    'Lgh 1003',
    '3'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Jonathan',
    'Mikael',
    'elsa3244@gmail.com',
    '070 145 0872',
    NULL,
    'Fortifikationsgatan',
    '10',
    'Lgh 1101',
    '4'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Fredrik',
    'Gren',
    'fredrikgren1@hotmail.com',
    '0709-162457',
    NULL,
    'Fortifikationsgatan',
    '10',
    'Lgh 1103',
    '6'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Albin',
    'Valastig',
    'albin.valastig@hotmail.com',
    '0767847279',
    NULL,
    'Fortifikationsgatan',
    '10',
    'Lgh 1104',
    '7'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Ronja',
    'Palm',
    'ronja.palm1@hotmail.com',
    '0706711819',
    NULL,
    'Fortifikationsgatan',
    '10',
    'Lgh 1001',
    '1'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Zahra',
    'Alsalloum',
    'ebrahimee250@gmail.com',
    '0760-327146',
    NULL,
    'Gångbrogatan',
    '13',
    'Lgh 1203',
    '13'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Haneen',
    'Masoud',
    'haneenmasoud199388@gmail.com',
    '0735834362',
    NULL,
    'Gångbrogatan',
    '13',
    'Lgh 1202',
    '12'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Ali',
    'Alshikh',
    'ali.alshikh1986@gmail.com',
    '0725777778',
    NULL,
    'Gångbrogatan',
    '13',
    'Lgh 1104',
    '10'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Ahmed',
    'Raimi',
    'ahmadraimi020@gmail.com',
    '0764072017',
    NULL,
    'Gångbrogatan',
    '13',
    'Lgh 1103',
    '9'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Sandra',
    'Widegren',
    'sandrawidegren5@gmail.com',
    '0735415614',
    NULL,
    'Gångbrogatan',
    '13',
    'Lgh 1001',
    '8'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Ibrahim Alshikh',
    'Mohamad',
    'ebrahimee250@gmail.com',
    '0768771887',
    NULL,
    'Gångbrogatan',
    '13',
    'Lgh 1201',
    '11'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Meja',
    'Holm',
    'meja0330@gmail.com',
    '0704448317',
    NULL,
    'Gångbrogatan',
    '13',
    'Lgh 1301',
    '14'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Ulrika',
    'Gustafsson',
    'vanillo8006@gmail.com',
    '0709103739',
    NULL,
    'Hagagatan',
    '5',
    'Lgh 1101',
    '1'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Catarina',
    'Lindstrï¿½m',
    'catarinalindstrm@yahoo.com',
    '0702-741467',
    NULL,
    'Hagagatan',
    '5',
    'Lgh 1001',
    '2'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Dan',
    'Altehed',
    'alteheddan@yahoo.com',
    '0763175685',
    NULL,
    'Hagagatan',
    '5',
    'Lgh 1101',
    '4'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Azra',
    'Faller',
    'azra_bihorac@hotmail.com',
    '0723390733',
    NULL,
    'Hagagatan',
    '5',
    'Lgh 1002',
    '3'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Vivi-Anne',
    'Svensson',
    'viv.sve@outlook.com',
    '0732066015',
    NULL,
    'Hagagatan',
    '5',
    'Lgh 1102',
    '5'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Nguyen Thanh',
    'Le',
    'leebaguettevn@gmail.com',
    '0702656666',
    NULL,
    'Kyrkogatan',
    '15',
    'Lokal 1',
    '1'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Banes Kebab &',
    'Pizza',
    'ayad373@yahoo.com',
    NULL,
    NULL,
    'Kyrkogatan',
    '15',
    'Lokal 2',
    '2'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Aron',
    'Pulkkanen',
    'aronpulkkanen1@gmail.com',
    '0723370636',
    NULL,
    'Kyrkogatan',
    '15',
    'Lgh 1102',
    '2'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Jesu Kristi Kyrka / Sista Dagars',
    'Heliga',
    '2019205-fin@churchofjesuschrist.org',
    '0735-230764',
    NULL,
    'Kyrkogatan',
    '15',
    'Lgh 1301',
    '4'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Phuong Nhung',
    'Lam',
    'nhunglam9045@gmail.com',
    '0790399993',
    NULL,
    'Kyrkogatan',
    '15',
    'Lgh 1201',
    '3'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Tamari',
    'Aptsiauri',
    'tamaraaptsiauri@outlook.com',
    '0736322112',
    NULL,
    'Kyrkogatan',
    '15',
    'Lgh 1101',
    '1'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Isak',
    'Karmberg',
    'karmbergisac@gmail.com',
    '0709725352',
    NULL,
    'Landbrogatan',
    '31A',
    'Lgh 1301',
    '118'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Mhd Jaad Al',
    'jajeh',
    'haitham.aljajeh2003@gmail.com',
    '0737094428',
    NULL,
    'Landbrogatan',
    '31A',
    'Lgh 1101',
    '114'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Jimmie',
    'Alfredsson',
    'jimmie@alfredson.com',
    '0733527762',
    NULL,
    'Landbrogatan',
    '31A',
    'Lgh 1202',
    '115'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Gabriella',
    'Andersson',
    'gabrieella.andersson@gmail.com',
    '0766113211',
    NULL,
    'Landbrogatan',
    '31A',
    'Lgh 1302',
    '117'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Yenna',
    'Andersson',
    'yenna.andersson@icloud.com',
    '0737572052',
    NULL,
    'Landbrogatan',
    '31A',
    'Lgh 1201',
    '116'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Nadezhda',
    'Zaitseva',
    'yura051@mail.ru',
    '0763406226',
    NULL,
    'Landbrogatan',
    '31A',
    'Lgh 1102',
    '113'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Mita',
    'Zonnander',
    'mita.zonnander@hotmail.com',
    '0728834266',
    NULL,
    'Landbrogatan',
    '31B',
    'Lgh 1002',
    '119'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Mattias',
    'Dolk',
    'mattias.dolk@outlook.com',
    '0736691476',
    NULL,
    'Landbrogatan',
    '31B',
    'Lgh 1001',
    '120'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Issa',
    'Alobaid',
    'isaobaid1979@gmail.com',
    '0790-182093',
    NULL,
    'Landbrogatan',
    '31B',
    'Lgh 1302',
    '124'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Darwish i Karlskrona',
    'AB',
    'wesambarberare@gmail.com',
    '0708723264',
    NULL,
    'Landbrogatan',
    '31B',
    'Lokal',
    'Lokal'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Louise',
    'Lundqvist',
    'l.lundkvist76@gmail.com',
    '0709593948',
    NULL,
    'Landbrogatan',
    '31B',
    'Lgh 1301',
    '125'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Ronja',
    'Jespersen',
    'ronja.jespersen1@gmail.com',
    '0763-900610',
    NULL,
    'Landbrogatan',
    '31B',
    'Lgh 1102',
    '121'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Qasem Khaled Al',
    'Qasimi',
    'k55955521@gmail.com',
    '0764069820',
    NULL,
    'Landbrogatan',
    '31B',
    'Lgh 1101',
    '122'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Edvin',
    'Dapo',
    'edvin321000@gmail.com',
    '0765953020',
    NULL,
    'Landbrogatan',
    '31B',
    'Lgh 1202',
    '123'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Daniel',
    'Jönsson',
    'daniel_j76@hotmail.se',
    '0709286757',
    NULL,
    'Södra Smedjegatan',
    '3',
    'Lgh 1301',
    '5'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Lynn',
    'Larsson',
    'larsson.lynn@gmail.com',
    '0768-771593',
    NULL,
    'Södra Smedjegatan',
    '3',
    'Lgh 1201',
    '4'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Liwaa Adin Omar',
    'Bhtiti',
    'leoaa1976@hotmail.com',
    '0455-340215, 0729264702',
    NULL,
    'Södra Smedjegatan',
    '3',
    'Lgh 1001',
    '1'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Beiges Paola',
    'Orobio',
    'orobio.col26@gmail.com',
    '0735760819',
    NULL,
    'Södra Smedjegatan',
    '3',
    'Lgh 1201',
    '2'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Bianca',
    'Mejia',
    'bmejia39@gmail.com',
    '0793514290',
    NULL,
    'Södra Smedjegatan',
    '3',
    'Lgh 1101',
    '3'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Christoph Samfass',
    'Dykfirma',
    'unique.dive.travel@hotmail.com',
    '070-8867431',
    NULL,
    'Styrmansgatan',
    '38',
    'Lokal 3',
    '38'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Ferdos Al',
    'Adawy',
    'fardoos931@gmail.com',
    '0790144037',
    NULL,
    'Styrmansgatan',
    '38',
    'Lokal 2',
    '38'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Karin',
    'Persson',
    'portalen2018@gmail.com',
    '0708379390',
    NULL,
    'Styrmansgatan',
    '38',
    'Lgh 1001',
    '1'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Jenny  Al-Aezi',
    'Fransson',
    'jennyalaezi@gmail.com',
    '0762607822',
    NULL,
    'Styrmansgatan',
    '38',
    'Lgh 1001',
    '3'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Adnan',
    'Demirovic',
    'demirovicadnan@yahoo.com',
    '0760865620',
    NULL,
    'Styrmansgatan',
    '38',
    'Lgh 1101',
    '2'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Raji Abdelfattah Ali',
    'Jabr',
    'alijabeer2@icloud.com',
    '0723177634',
    NULL,
    'Styrmansgatan',
    '38',
    'Lgh 1101',
    '4'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Rukaya',
    'Alkhalaf',
    'rukayaalkhalaf51@gmail.com',
    '0700541384',
    NULL,
    'Tingsgatan',
    '9',
    'Lgh 1001',
    '3'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Khaled  Chekh',
    'Mohamed',
    'kahlednor339@gmail.com',
    '0760384486',
    NULL,
    'Tingsgatan',
    '9',
    'Lgh 1201',
    '6'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Silvana Yordanova',
    'Milteva',
    'jjkhjjb357@gmail.com',
    '0790404701',
    NULL,
    'Tingsgatan',
    '9',
    'Lgh 1002',
    '1'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Iman Alsheikh',
    'Mohamad',
    'ebrahimee250@gmail.com',
    '0765-174892',
    NULL,
    'Tingsgatan',
    '9',
    'Lgh 1101',
    '4'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Emma',
    'Ahlborg',
    'emma_sulan@hotmail.com',
    '0733-898272',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1102',
    '2'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Johan',
    'Lagerstrï¿½m',
    'johsve5@gmail.com',
    '0709218332',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1103',
    '5'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Manuel Felipe',
    'Yelicich',
    'sweyeli1@hotmail.com',
    '0763453601',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1201',
    '7'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Alfred',
    'Eriksson',
    'alfred.ae.eriksson@gmail.com',
    '0734-266607',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1201',
    '9'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Alexandra',
    'Hï¿½kansson',
    'nettans-kryddbod@live.se',
    '0733265925',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1202',
    '10'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Ingemar',
    'Persson',
    'afrim.beka@karlskrona.se',
    NULL,
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1204',
    '12'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Saqib',
    'Zaman',
    'saqiati28@gmail.com',
    '0793449544',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1501',
    '22'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Alicia',
    'Persson',
    'alicia.persson0007@gmail.com',
    '0723078792',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1101',
    '1'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Danny',
    'Simonsson',
    'eye_of_the_sun82@hotmail.com',
    '0708-862706',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1101',
    '3'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Ananda',
    'Karaszi',
    'ananda.himani@gmail.com',
    '0720151003',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1302',
    '14'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Khaled',
    'Hamdan',
    'kh2017026@gmail.com',
    '0735014326',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1403',
    '16'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Tamer M A',
    'Darwish',
    'tamer.darwish1981@gmail.com',
    '0764020789',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1401',
    '21'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Carolin',
    'Mï¿½ller',
    'carolin.muller.14@gmail.com',
    '0709-112311',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1202',
    '8'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Jade',
    'Manning',
    'jademanning2022@gmail.com',
    '0720310423',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1203',
    '11'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Per',
    'Gunaropulos',
    'pergun57@gmail.com',
    '0723-947560',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1303',
    '15'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Thitima',
    'Andersson',
    'thitima.andersson@gmail.com',
    '0761-958632',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1002',
    '23'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Marcus',
    'Nilsson',
    'marcusnilsson6@gmail.com',
    '0708605267',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1404',
    '19'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Thitima Andersson',
    '(2)',
    'thitima.andersson@gmail.com',
    '0761958632',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1001',
    '25'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Ulrica',
    'Tillman',
    'ulrica.tillman@gmail.com',
    '0768-542268',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1401',
    '18'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Hanan Nsaif',
    'Jasim',
    'hanan.nsaief1985@gmail.com',
    '0767-161436',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1102',
    '4'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Magnus',
    'Berg',
    'bazze1@live.se',
    '0720-337503',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1104',
    '6'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Eva-Lena',
    'Lindell',
    'eva-lena.lindell@hotmail.com',
    '0760-278336',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1301',
    '13'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Albert',
    'Florinus',
    'abbeflorinus@gmail.com',
    '0760206395',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1402',
    '17'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Pontus',
    'Lindroth',
    'pontuslin99@gmail.com',
    '0733117720',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1001',
    '24'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Tindra',
    'Muller',
    'ppiiiip97123@gmail.com',
    '0768-859522',
    NULL,
    'Utridarevägen',
    '3B',
    'Lgh 1402',
    '20'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Wilber',
    'Henriquez',
    'wiber_gr@hotmail.com',
    '0722-938564',
    NULL,
    'Västra Prinsgatan',
    '44',
    'Lgh 1102',
    '4'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Christel',
    'Jönsson',
    'christel8989@gmail.com',
    '0724490412',
    NULL,
    'Västra Prinsgatan',
    '44',
    'Lgh 1301',
    '9'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Iwona',
    'Slojka',
    'iwona.slojka@gmail.com',
    '0734-292399',
    NULL,
    'Västra Prinsgatan',
    '44',
    'Lgh 1303',
    '11'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Annica',
    'Smï¿½lander',
    'annica24@msn.com',
    '0736-378177',
    NULL,
    'Västra Prinsgatan',
    '44',
    'Lgh 1001',
    '1'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Ingrid Britt-Stina',
    'Berglund',
    'britstina@hotmail.com',
    '0705814837',
    NULL,
    'Västra Prinsgatan',
    '44',
    'Lgh 1002',
    '2'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Konstantinos',
    'Kiouros',
    'kiouros@hotmail.com',
    '0760-943283',
    NULL,
    'Västra Prinsgatan',
    '44',
    'Lgh 1201',
    '6'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Ludvig',
    'Nilsson',
    'ludvig.nilsson15@gmail.com',
    '0737886589',
    NULL,
    'Västra Prinsgatan',
    '44',
    'Lgh 1203',
    '8'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Piyaphat',
    'Thongkham',
    'auithongkham@hotmail.com',
    '0765-657662',
    NULL,
    'Västra Prinsgatan',
    '44',
    'Lgh 1101',
    '3'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Maj Britt',
    'Nilsson',
    'gunilla.mansson@hotmail.se',
    '0705-825543',
    NULL,
    'Västra Prinsgatan',
    '44',
    'Lgh 1103',
    '5'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Ville',
    'Frank',
    'ville.vf.frank@gmail.com',
    '0720157531',
    NULL,
    'Västra Prinsgatan',
    '44',
    'Lgh 1202',
    '7'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Jan',
    'Wallin',
    'janwallin63@hotmail.com',
    '0733-108039',
    NULL,
    'Västra Prinsgatan',
    '44',
    'Lgh 1302',
    '10'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Tony  Mikael',
    'Brandt',
    'henningssonronny@gmail.com',
    '0706-709179',
    NULL,
    'Västra Vittusgatan',
    '2',
    'Lgh 1103',
    '107'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Allan',
    'Jakoub',
    'rinketallan@gmail.com',
    '0733427973',
    NULL,
    'Västra Vittusgatan',
    '2',
    'Lgh 1202',
    '110'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Obida',
    'Albasha',
    'obidaalbassa873@gmail.com',
    '0707435635',
    NULL,
    'Västra Vittusgatan',
    '2',
    'Lgh 1201',
    '111'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Alina',
    'Yehorova',
    'dizialina@gmail.com',
    '0762-977985',
    NULL,
    'Västra Vittusgatan',
    '2',
    'Lgh 1001',
    '105'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Sharmarke Ali',
    'Hussein',
    'sharmarke.aliiihussein@gmail.com',
    '0762757585 ',
    NULL,
    'Västra Vittusgatan',
    '2',
    'Lgh 1002',
    '106'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Konrad Karol',
    'Koblak',
    'konrad.koblak@gmail.com',
    '0703024958',
    NULL,
    'Västra Vittusgatan',
    '2',
    'Lgh 1102',
    '108'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Sompong',
    'Rosenius',
    'thomas.blissing@gmail.com',
    '0709499170',
    NULL,
    'Västra Vittusgatan',
    '2',
    'Lgh 1101',
    '109'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Johan',
    'Olofsson',
    'stigsdotter.johnson@gmail.com',
    '0734-066824',
    NULL,
    'Valhallavägen',
    '10C',
    'Lgh 1101',
    '111'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Malin',
    'Jensen',
    'malinjensen01@gmail.com',
    '0709207104',
    NULL,
    'Valhallavägen',
    '10C',
    'Lgh 1002',
    '102'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Karol',
    'Pundzis',
    NULL,
    '0737-574943',
    NULL,
    'Valhallavägen',
    '10B',
    'Lgh 1002',
    '104'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Jack',
    'ï¿½kesson',
    'jackakesson7@gmail.com',
    '0763251722',
    NULL,
    'Valhallavägen',
    '10A',
    'Lgh 1001',
    '0108'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Roland',
    'Runberg',
    NULL,
    '0709-640022',
    NULL,
    'Valhallavägen',
    '10C',
    'Lgh 1202',
    '110'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Anas',
    'Alhariri',
    'anasalhariri0085@gmail.com',
    '0707135200',
    NULL,
    'Valhallavägen',
    '10B',
    'Lgh 1102',
    '112'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Alen',
    'Qenaj',
    'alenqenaj2@gmail.com',
    '0762-876855',
    NULL,
    'Valhallavägen',
    '10A',
    'Lgh 1102',
    '115'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Michael',
    'Mostrï¿½m',
    'mikewestse@gmail.com',
    '0760368890',
    NULL,
    'Valhallavägen',
    '10C',
    'Lgh 1201',
    '119'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Bashir',
    'Rames',
    'dragan.cado@karlskrona.se',
    '0700-284-117',
    NULL,
    'Valhallavägen',
    '10C',
    'Lgh 0902',
    '126'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Kayleigh Laura',
    'Mildner',
    'kayleigh.laura.mildner@gmail.com',
    '0760507221',
    NULL,
    'Valhallavägen',
    '10A',
    'Lgh 1201',
    '124'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Jimmy Steen',
    'Karlman',
    'kaptenssg@gmail.com',
    '0708898929',
    NULL,
    'Valhallavägen',
    '10C',
    'Lgh 0903',
    '127'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Omar Al',
    'Zoaabi',
    'omar.alzoaabi@gmail.com',
    '0700430083',
    NULL,
    'Valhallavägen',
    '10A',
    'Lgh 1202',
    '123'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Zirak Ali Shaheen',
    'Rehman',
    'zkgtmotors@gmail.com',
    '0706101349',
    NULL,
    'Valhallavägen',
    '10A',
    'Lgh 1103',
    '114'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Vidhyadhari',
    'Gurrala',
    'vidhyadhari98@gmail.com',
    '0793576762',
    NULL,
    'Valhallavägen',
    '10C',
    'Lgh 1001',
    '103'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Nikita',
    'Karlsson',
    'nikita.karlsson002@hotmail.com',
    '0707691032',
    NULL,
    'Valhallavägen',
    '10A',
    'Lgh 1202',
    '123'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Savithri Venkata',
    'Tejeswar',
    NULL,
    '0763467895',
    NULL,
    'Valhallavägen',
    '10A',
    'Lgh 1002',
    '107'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Kenneth',
    'Persson',
    'kennethpersson@outlook.com',
    '0454-10299',
    NULL,
    'Valhallavägen',
    '10C',
    'Lgh 1103',
    '109'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Jan',
    'Taxï¿½n',
    NULL,
    '070-5118888',
    NULL,
    'Valhallavägen',
    '10B',
    'Lgh 1101',
    '113'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Yaser Ziad Nofal',
    'Darwish',
    'darwish.yaser@hotmail.com',
    '0764483090',
    NULL,
    'Valhallavägen',
    '10C',
    'Lgh 0901',
    '125'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Jonathan Adam',
    'Lindh',
    'jonathan.adam.lindh@gmail.com',
    '0760174074',
    NULL,
    'Valhallavägen',
    '10B',
    'Lgh 1301',
    '121'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Mohammad Mheear Al',
    'Rifai',
    'mheear@yahoo.com',
    '0762462028',
    NULL,
    'Valhallavägen',
    '10A',
    'Lgh 1003',
    '106'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Joakim',
    'Rickardsson',
    'joakim.rickardsson@gmail.com',
    '0730466789',
    NULL,
    'Valhallavägen',
    '10C',
    'Lgh 1203',
    '122'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Kabir',
    'Husseini',
    'Kabir.husseini@gmail.com',
    '0765553345',
    NULL,
    'Valhallavägen',
    '10A',
    'Lgh 1203',
    '123'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Hassan',
    'Kassar',
    'kasarhassan8@gmail.com',
    '0722532952',
    NULL,
    'Valhallavägen',
    '10C',
    'Lgh 1001',
    '103'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Nikita Lillian',
    'Kristofikova',
    'niki55@email.cz',
    '0760445090',
    NULL,
    'Valhallavägen',
    '10C',
    'Lgh 1003',
    '101'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Eleonor',
    'ï¿½lstig',
    'eleonor76@gmail.com',
    '0736301114',
    NULL,
    'Valhallavägen',
    '10B',
    'Lgh 1001',
    '105'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Mai',
    'Nantachad',
    'nanmaii@live.se',
    '0702688055',
    NULL,
    'Valhallavägen',
    '10A',
    'Lgh 1101',
    '116'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Per-Anders',
    'Persson',
    'pa@havsudden.se',
    '076-1145591',
    NULL,
    'Valhallavägen',
    '10C',
    'Lgh 1202',
    '118'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

INSERT INTO tenants (first_name, last_name, email, phone, moved_in_date, street, number, apartment_no, old) VALUES (
    'Mikael',
    'Persson',
    NULL,
    '0733-628998',
    NULL,
    'Valhallavägen',
    '10B',
    'Lgh 1202',
    '120'
) ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date);

-- Importera lÃ¤genheter
INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Gångbrogatan',
    '13',
    'Lgh 1202',
    '12',
    '37237',
    'Ronneby'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Västra Prinsgatan',
    '44',
    'Lgh 1101',
    '3',
    '37116',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1303',
    '15',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Fortifikationsgatan',
    '10',
    'Lgh 1102',
    '5',
    '37136',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10B',
    'Lgh 1102',
    '112',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Landbrogatan',
    '31A',
    'Lgh 1001',
    '120',
    '37134',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1002',
    '23',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1103',
    '05',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Västra Vittusgatan',
    '2',
    'Lgh 1002',
    '106',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Landbrogatan',
    '31A',
    'Lgh 1102',
    '113',
    '37134',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Styrmansgatan',
    '38',
    'Lgh 1001',
    '3',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Hagagatan',
    '5',
    'Lgh 1001',
    '2',
    '37236',
    'Ronneby'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Styrmansgatan',
    '38',
    'Lgh 1001',
    '1',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10B',
    'Lgh 1101',
    '113',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Chapmansgatan',
    '6',
    'Lgh 1102',
    '4',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Södra Smedjegatan',
    '3',
    'Lgh 1001',
    '1',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1203',
    '11',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Hagagatan',
    '5',
    'Lgh 1102',
    '5',
    '37236',
    'Ronneby'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10B',
    'Lgh 1202',
    '120',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Gångbrogatan',
    '13',
    'Lgh 1104',
    '10',
    '37237',
    'Ronneby'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1401',
    '18',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Landbrogatan',
    '31B',
    'Lgh 1102',
    '121',
    '37134',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Södra Smedjegatan',
    '3',
    'Lgh 1201',
    '2',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Landbrogatan',
    '31A',
    'Lgh 1201',
    '116',
    '37134',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10B',
    'Lgh 1301',
    '121',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10C',
    'Lgh 1103',
    '109',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10A',
    'Lgh 1001',
    '105',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Södra Smedjegatan',
    '3',
    'Lgh 1201',
    '4',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Västra Prinsgatan',
    '44',
    'Lgh 1202',
    '7',
    '37116',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Västra Vittusgatan',
    '2',
    'Lgh 1101',
    '109',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1301',
    '13',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Fortifikationsgatan',
    '10',
    'Lgh 1103',
    '6',
    '37136',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Chapmansgatan',
    '6',
    'Lgh 1001',
    '1',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Landbrogatan',
    '31A',
    'Lgh 1202',
    '115',
    '37134',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1202',
    '10',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Kyrkogatan',
    '15',
    'Lgh 1101',
    '1',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Kyrkogatan',
    '15',
    'Lgh 1301',
    '4',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Tingsgatan',
    '9',
    'Lgh 1101',
    '4',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1101',
    '1',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Västra Prinsgatan',
    '44',
    'Lgh 1002',
    '2',
    '37116',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Fortifikationsgatan',
    '10',
    'Lgh 1001',
    '1',
    '37136',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1101',
    '3',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10C',
    'Lgh 1203',
    '117',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10A',
    'Lgh 1002',
    '102',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10C',
    'Lgh 902',
    '126',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Chapmansgatan',
    '6',
    'Lgh 1202',
    '6',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Landbrogatan',
    '31A',
    'Lgh 1302',
    '117',
    '37134',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Västra Vittusgatan',
    '2',
    'Lgh 1001',
    '105',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Tingsgatan',
    '9',
    'Lgh 1002',
    '1',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Västra Vittusgatan',
    '2',
    'Lgh 1202',
    '110',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Västra Prinsgatan',
    '44',
    'Lgh 1301',
    '9',
    '37116',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1001',
    '24',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1001',
    '25',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Landbrogatan',
    '31B',
    'Lgh 1301',
    '125',
    '37134',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10A',
    'Lgh 1002',
    '107',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Västra Prinsgatan',
    '44',
    'Lgh 1303',
    '11',
    '37116',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Landbrogatan',
    '31B',
    'Lgh 1002',
    '119',
    '37134',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Västra Prinsgatan',
    '44',
    'Lgh 1203',
    '8',
    '37116',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1403',
    '16',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Fortifikationsgatan',
    '1',
    'Lgh 1207',
    '7',
    '37136',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Landbrogatan',
    '31B',
    'Lgh 1302',
    '124',
    '37134',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10C',
    'Lgh 1101',
    '111',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Chapmansgatan',
    '6',
    'Lgh 1002',
    '2',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10A',
    'Lgh 1001',
    '108',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Fortifikationsgatan',
    '10',
    'Lgh 1104',
    '7',
    '37136',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10C',
    'Lgh 1201',
    '119',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Landbrogatan',
    '31B',
    'Lokal',
    '37134',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Södra Smedjegatan',
    '3',
    'Lgh 1101',
    '3',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Västra Prinsgatan',
    '44',
    'Lgh 1103',
    '5',
    '37116',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Kyrkogatan',
    '15',
    'Lgh 1102',
    '2',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Fortifikationsgatan',
    '10',
    'Lgh 1002',
    '2',
    '37136',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1402',
    '17',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Västra Prinsgatan',
    '44',
    'Lgh 1001',
    '1',
    '37116',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10A',
    'Lgh 1203',
    '122',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Landbrogatan',
    '31A',
    'Lgh 1101',
    '114',
    '37134',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10B',
    'Lgh 1102',
    '115',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Gångbrogatan',
    '13',
    'Lgh 1203',
    '13',
    '37237',
    'Ronneby'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1202',
    '8',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10B',
    'Lgh 1202',
    '123',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1302',
    '14',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Tingsgatan',
    '9',
    'Lgh 1001',
    '3',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Västra Vittusgatan',
    '2',
    'Lgh 1102',
    '108',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Landbrogatan',
    '31B',
    'Lgh 1101',
    '122',
    '37134',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10C',
    'Lgh 903',
    '127',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10A',
    'Lgh 1001',
    '103',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Södra Smedjegatan',
    '3',
    'Lgh 1301',
    '5',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Chapmansgatan',
    '6',
    'Lgh 1201',
    '5',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10B',
    'Lgh 1103',
    '114',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1104',
    '6',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1204',
    '12',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Gångbrogatan',
    '13',
    'Lgh 1301',
    '14',
    '37237',
    'Ronneby'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10C',
    'Lgh 1202',
    '118',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1402',
    '20',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10B',
    'Lgh 1202',
    '110',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1201',
    '9',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1201',
    '7',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Tingsgatan',
    '9',
    'Lgh 1201',
    '6',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Fortifikationsgatan',
    '10',
    'Lgh 1101',
    '4',
    '37136',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10C',
    'Lgh 1003',
    '101',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Västra Prinsgatan',
    '44',
    'Lgh 1102',
    '4',
    '37116',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1501',
    '22',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10A',
    'Lgh 1201',
    '124',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1404',
    '19',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Gångbrogatan',
    '13',
    'Lgh 1103',
    '9',
    '37237',
    'Ronneby'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Landbrogatan',
    '31A',
    'Lgh 1301',
    '118',
    '37134',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Fortifikationsgatan',
    '1',
    'Lgh 1001',
    '1',
    '37136',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Fortifikationsgatan',
    '10',
    'Lgh 1003',
    '3',
    '37136',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Västra Prinsgatan',
    '44',
    'Lgh 1302',
    '10',
    '37116',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10A',
    'Lgh 1003',
    '106',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1401',
    '21',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Västra Vittusgatan',
    '2',
    'Lgh 1103',
    '107',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Kyrkogatan',
    '15',
    'Lokal 2',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Styrmansgatan',
    '38',
    'Lokal 2',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Chapmansgatan',
    '6',
    'Lgh 1101',
    '3',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Styrmansgatan',
    '38',
    'Lokal 3',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Hagagatan',
    '5',
    'Lgh 1002',
    '3',
    '37236',
    'Ronneby'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Kyrkogatan',
    '15',
    'Lokal 1',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Kyrkogatan',
    '15',
    'Lgh 1201',
    '3',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Gångbrogatan',
    '13',
    'Lgh 1201',
    '11',
    '37237',
    'Ronneby'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10B',
    'Lgh 1101',
    '116',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10A',
    'Lgh 1002',
    '104',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Styrmansgatan',
    '38',
    'Lgh 1101',
    '4',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Hagagatan',
    '5',
    'Lgh 1101',
    '1',
    '37236',
    'Ronneby'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Landbrogatan',
    '31B',
    'Lgh 1202',
    '123',
    '37134',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Hagagatan',
    '5',
    'Lgh 1101',
    '4',
    '37236',
    'Ronneby'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Styrmansgatan',
    '38',
    'Lgh 1101',
    '2',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1102',
    '4',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Utridarevägen',
    '3B',
    'Lgh 1102',
    '2',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Valhallavägen',
    '10C',
    'Lgh 901',
    '125',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Västra Prinsgatan',
    '44',
    'Lgh 1201',
    '6',
    '37116',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Västra Vittusgatan',
    '2',
    'Lgh 1201',
    '111',
    '37140',
    'Karlskrona'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);

INSERT INTO apartments (street, number, apartment_number, old, postal_code, city) VALUES (
    'Gångbrogatan',
    '13',
    'Lgh 1001',
    '8',
    '37237',
    'Ronneby'
) ON DUPLICATE KEY UPDATE
    street = VALUES(street),
    number = VALUES(number),
    old = VALUES(old);


-- Koppla hyresgÃ¤ster till lÃ¤genheter
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
AND a.street = 'Chapmansgatan' AND a.number = '6' AND a.apartment_number = 'Lgh 1201'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Marta' AND t.last_name = 'Sargsyan'
AND a.street = 'Chapmansgatan' AND a.number = '6' AND a.apartment_number = 'Lgh 1101'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Hugo' AND t.last_name = 'Danell'
AND a.street = 'Chapmansgatan' AND a.number = '6' AND a.apartment_number = 'Lgh 1202'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Fabian' AND t.last_name = 'Arvidsson'
AND a.street = 'Chapmansgatan' AND a.number = '6' AND a.apartment_number = 'Lgh 1102'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Anne At All' AND t.last_name = 'AB'
AND a.street = 'Fortifikationsgatan' AND a.number = '1' AND a.apartment_number = 'Lgh 1001'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'PM INDIAN SHORNA' AND t.last_name = 'AB'
AND a.street = 'Fortifikationsgatan' AND a.number = '1' AND a.apartment_number = 'Lgh 1207'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Alice Yu' AND t.last_name = 'Hkansson'
AND a.street = 'Fortifikationsgatan' AND a.number = '10' AND a.apartment_number = 'Lgh 1102'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Towa' AND t.last_name = 'Jenglr'
AND a.street = 'Fortifikationsgatan' AND a.number = '10' AND a.apartment_number = 'Lgh 1002'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ehab Al' AND t.last_name = 'Nawakil'
AND a.street = 'Fortifikationsgatan' AND a.number = '10' AND a.apartment_number = 'Lgh 1003'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Jonathan' AND t.last_name = 'Mikael'
AND a.street = 'Fortifikationsgatan' AND a.number = '10' AND a.apartment_number = 'Lgh 1101'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Fredrik' AND t.last_name = 'Gren'
AND a.street = 'Fortifikationsgatan' AND a.number = '10' AND a.apartment_number = 'Lgh 1103'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Albin' AND t.last_name = 'Valastig'
AND a.street = 'Fortifikationsgatan' AND a.number = '10' AND a.apartment_number = 'Lgh 1104'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ronja' AND t.last_name = 'Palm'
AND a.street = 'Fortifikationsgatan' AND a.number = '10' AND a.apartment_number = 'Lgh 1001'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Zahra' AND t.last_name = 'Alsalloum'
AND a.street = 'Gångbrogatan' AND a.number = '13' AND a.apartment_number = 'Lgh 1203'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Haneen' AND t.last_name = 'Masoud'
AND a.street = 'Gångbrogatan' AND a.number = '13' AND a.apartment_number = 'Lgh 1202'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ali' AND t.last_name = 'Alshikh'
AND a.street = 'Gångbrogatan' AND a.number = '13' AND a.apartment_number = 'Lgh 1104'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ahmed' AND t.last_name = 'Raimi'
AND a.street = 'Gångbrogatan' AND a.number = '13' AND a.apartment_number = 'Lgh 1103'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Sandra' AND t.last_name = 'Widegren'
AND a.street = 'Gångbrogatan' AND a.number = '13' AND a.apartment_number = 'Lgh 1001'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ibrahim Alshikh' AND t.last_name = 'Mohamad'
AND a.street = 'Gångbrogatan' AND a.number = '13' AND a.apartment_number = 'Lgh 1201'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Meja' AND t.last_name = 'Holm'
AND a.street = 'Gångbrogatan' AND a.number = '13' AND a.apartment_number = 'Lgh 1301'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Ulrika' AND t.last_name = 'Gustafsson'
AND a.street = 'Hagagatan' AND a.number = '5' AND a.apartment_number = 'Lgh 1101'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Catarina' AND t.last_name = 'Lindstrm'
AND a.street = 'Hagagatan' AND a.number = '5' AND a.apartment_number = 'Lgh 1001'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Dan' AND t.last_name = 'Altehed'
AND a.street = 'Hagagatan' AND a.number = '5' AND a.apartment_number = 'Lgh 1101'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Azra' AND t.last_name = 'Faller'
AND a.street = 'Hagagatan' AND a.number = '5' AND a.apartment_number = 'Lgh 1002'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Vivi-Anne' AND t.last_name = 'Svensson'
AND a.street = 'Hagagatan' AND a.number = '5' AND a.apartment_number = 'Lgh 1102'
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
AND a.street = 'Kyrkogatan' AND a.number = '15' AND a.apartment_number = 'Lgh 1102'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Jesu Kristi Kyrka / Sista Dagars' AND t.last_name = 'Heliga'
AND a.street = 'Kyrkogatan' AND a.number = '15' AND a.apartment_number = 'Lgh 1301'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Phuong Nhung' AND t.last_name = 'Lam'
AND a.street = 'Kyrkogatan' AND a.number = '15' AND a.apartment_number = 'Lgh 1201'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Tamari' AND t.last_name = 'Aptsiauri'
AND a.street = 'Kyrkogatan' AND a.number = '15' AND a.apartment_number = 'Lgh 1101/1'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Isak' AND t.last_name = 'Karmberg'
AND a.street = 'Landbrogatan' AND a.number = '31A' AND a.apartment_number = 'Lgh 1301'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Mhd Jaad Al' AND t.last_name = 'jajeh'
AND a.street = 'Landbrogatan' AND a.number = '31A' AND a.apartment_number = 'Lgh 1101'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Jimmie' AND t.last_name = 'Alfredsson'
AND a.street = 'Landbrogatan' AND a.number = '31A' AND a.apartment_number = 'Lgh 1202'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Gabriella' AND t.last_name = 'Andersson'
AND a.street = 'Landbrogatan' AND a.number = '31A' AND a.apartment_number = 'Lgh 1302'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Yenna' AND t.last_name = 'Andersson'
AND a.street = 'Landbrogatan' AND a.number = '31A' AND a.apartment_number = 'Lgh 1201'
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = 'Nadezhda' AND t.last_name = 'Zaitseva'
AND a.street = 'Landbrogatan' AND a.number = '31A' AND a.apartment_number = 'Lgh 1102'
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

-- Koppla alla hyresgäster till lägenheter
INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id 
FROM tenants t
JOIN apartments a ON t.street = a.street AND t.number = a.number AND t.apartment_no = a.apartment_number
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;

-- Extra check för att se till att alla hyresgäster har en lägenhet
INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, MIN(a.id) 
FROM tenants t
LEFT JOIN tenant_apartments ta ON t.id = ta.tenant_id
JOIN apartments a ON t.street = a.street AND t.number = a.number
WHERE ta.id IS NULL
GROUP BY t.id
ON DUPLICATE KEY UPDATE tenant_id = tenant_id;
