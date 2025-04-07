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

-- Importera hyresgäster
INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '11',
    '',
    '12',
    '13',
    NULL,
    '1900-02-08',
    '16',
    '18'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '22',
    '',
    '23',
    '24',
    NULL,
    '1900-01-29',
    '27',
    '29'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '33',
    '',
    '34',
    '35',
    NULL,
    '1900-01-29',
    '38',
    '40'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '44',
    '',
    '45',
    '46',
    NULL,
    '1900-01-31',
    '49',
    '51'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '55',
    '',
    '56',
    '57',
    NULL,
    '1900-02-10',
    '60',
    '62'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '66',
    '',
    '67',
    '68',
    NULL,
    '1899-12-30',
    '71',
    '73'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '77',
    '',
    '78',
    '79',
    NULL,
    '1899-12-30',
    '82',
    '84'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '88',
    '',
    '89',
    '90',
    NULL,
    '1900-01-22',
    '93',
    '95'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '99',
    '',
    '100',
    '101',
    NULL,
    '1900-01-25',
    '104',
    '106'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '110',
    '',
    '111',
    '112',
    NULL,
    '1900-01-22',
    '115',
    '117'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '121',
    '',
    '122',
    '123',
    NULL,
    '1900-01-23',
    '126',
    '128'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '132',
    '',
    '133',
    '134',
    NULL,
    '1900-01-18',
    '137',
    '139'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '143',
    '',
    '144',
    '145',
    NULL,
    '1900-01-22',
    '148',
    '150'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '154',
    '',
    '155',
    '156',
    NULL,
    '1900-01-30',
    '159',
    '161'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '165',
    '',
    '166',
    '167',
    NULL,
    '1900-02-08',
    '170',
    '172'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '176',
    '',
    '177',
    '178',
    NULL,
    '1900-03-04',
    '181',
    '183'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '187',
    '',
    '188',
    '189',
    NULL,
    '1900-02-16',
    '192',
    '194'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '198',
    '',
    '199',
    '200',
    NULL,
    '1900-02-08',
    '203',
    '205'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '209',
    '',
    '210',
    '211',
    NULL,
    '1900-03-04',
    '214',
    '216'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '220',
    '',
    '221',
    '222',
    NULL,
    '1900-02-26',
    '225',
    '227'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '231',
    '',
    '232',
    '233',
    NULL,
    '1900-02-03',
    '236',
    '238'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '242',
    '',
    '243',
    '244',
    NULL,
    '1900-02-25',
    '247',
    '249'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '253',
    '',
    '254',
    '255',
    NULL,
    '1900-02-26',
    '258',
    '260'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '264',
    '',
    '265',
    '266',
    NULL,
    '1900-02-16',
    '269',
    '271'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '275',
    '',
    '276',
    '277',
    NULL,
    '1900-02-18',
    '280',
    '282'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '286',
    '',
    '287',
    '288',
    NULL,
    '1900-02-26',
    '291',
    '293'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '297',
    '',
    '298',
    '299',
    NULL,
    '1899-12-30',
    '302',
    '304'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '308',
    '',
    '309',
    NULL,
    NULL,
    '1899-12-30',
    '312',
    '314'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '318',
    '',
    '319',
    '320',
    NULL,
    '1900-02-06',
    '323',
    '325'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '329',
    '',
    '330',
    '331',
    NULL,
    '1900-03-10',
    '334',
    '336'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '340',
    '',
    '341',
    '342',
    NULL,
    '1900-04-07',
    '345',
    '347'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '351',
    '',
    '352',
    '353',
    NULL,
    '1900-03-04',
    '356',
    '358'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '362',
    '',
    '363',
    '364',
    NULL,
    '1900-03-20',
    '367',
    '369'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '373',
    '',
    '374',
    '375',
    NULL,
    '1900-02-28',
    '378',
    '380'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '384',
    '',
    '385',
    '386',
    NULL,
    '1900-03-24',
    '389',
    '391'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '395',
    '',
    '396',
    '397',
    NULL,
    '1900-02-28',
    '400',
    '402'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '406',
    '',
    '407',
    '408',
    NULL,
    '1900-02-27',
    '411',
    '413'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '417',
    '',
    '418',
    '419',
    NULL,
    '1900-03-24',
    '422',
    '424'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '428',
    '',
    '429',
    '430',
    NULL,
    '1900-02-28',
    '433',
    '435'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '439',
    '',
    '440',
    '441',
    NULL,
    '1900-03-24',
    '444',
    '446'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '450',
    '',
    '451',
    '452',
    NULL,
    '1900-03-24',
    '455',
    '457'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '461',
    '',
    '462',
    '463',
    NULL,
    '1899-12-30',
    '466',
    '468'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '472',
    '',
    '473',
    '474',
    NULL,
    '1900-03-16',
    '477',
    '479'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '483',
    '',
    '484',
    '485',
    NULL,
    '1900-02-21',
    '488',
    '490'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '494',
    '',
    '495',
    '496',
    NULL,
    '1900-03-24',
    '499',
    '501'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '505',
    '',
    '506',
    '507',
    NULL,
    '1900-02-27',
    '510',
    '512'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '516',
    '',
    '517',
    '518',
    NULL,
    '1900-02-26',
    '521',
    '523'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '527',
    '',
    '528',
    '529',
    NULL,
    '1900-02-26',
    '532',
    '534'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '538',
    '',
    '539',
    '540',
    NULL,
    '1900-04-29',
    '543',
    '545'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '549',
    '',
    '550',
    '551',
    NULL,
    '1900-03-18',
    '554',
    '556'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '560',
    '',
    '561',
    '562',
    NULL,
    '1900-03-20',
    '565',
    '567'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '571',
    '',
    '572',
    '573',
    NULL,
    '1899-12-30',
    '576',
    '578'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '582',
    '',
    '583',
    '584',
    NULL,
    '1899-12-30',
    '587',
    '589'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '593',
    '',
    '594',
    '595',
    NULL,
    '1900-05-07',
    '598',
    '600'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '604',
    '',
    '605',
    '606',
    NULL,
    '1900-05-07',
    '609',
    '611'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '615',
    '',
    '616',
    '617',
    NULL,
    '1900-03-25',
    '620',
    '622'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '626',
    '',
    '627',
    '628',
    NULL,
    '1900-05-07',
    '631',
    '633'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '637',
    '',
    '638',
    '639',
    NULL,
    '1900-03-08',
    '642',
    '644'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '648',
    '',
    '649',
    '650',
    NULL,
    '1900-03-10',
    '653',
    '655'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '659',
    '',
    '660',
    '661',
    NULL,
    '1900-02-14',
    '664',
    '666'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '670',
    '',
    '671',
    '672',
    NULL,
    '1900-03-08',
    '675',
    '677'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '681',
    '',
    '682',
    '683',
    NULL,
    '1900-03-18',
    '686',
    '688'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '692',
    '',
    '693',
    '694',
    NULL,
    '1900-02-23',
    '697',
    '699'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '703',
    '',
    '704',
    '705',
    NULL,
    '1900-03-13',
    '708',
    '710'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '714',
    '',
    '715',
    '716',
    NULL,
    '1900-02-05',
    '719',
    '721'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '725',
    '',
    '726',
    '727',
    NULL,
    '1900-02-22',
    '730',
    '732'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '736',
    '',
    '737',
    NULL,
    NULL,
    '1900-02-11',
    '740',
    '742'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '746',
    '',
    '747',
    '748',
    NULL,
    '1900-03-27',
    '751',
    '753'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '757',
    '',
    '758',
    '759',
    NULL,
    '1900-03-13',
    '762',
    '764'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '768',
    '',
    '769',
    '770',
    NULL,
    '1900-02-05',
    '773',
    '775'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '779',
    '',
    '780',
    '781',
    NULL,
    '1900-02-22',
    '784',
    '786'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '790',
    '',
    '791',
    '792',
    NULL,
    '1900-03-31',
    '795',
    '797'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '801',
    '',
    '802',
    '803',
    NULL,
    '1900-04-21',
    '806',
    '808'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '812',
    '',
    '813',
    '814',
    NULL,
    '1900-03-18',
    '817',
    '819'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '823',
    '',
    '824',
    '825',
    NULL,
    '1900-03-10',
    '828',
    '830'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '834',
    '',
    '835',
    '836',
    NULL,
    '1900-03-16',
    '839',
    '841'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '845',
    '',
    '846',
    '847',
    NULL,
    '1900-03-17',
    '850',
    '852'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '856',
    '',
    '857',
    '858',
    NULL,
    '1900-02-26',
    '861',
    '863'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '867',
    '',
    '868',
    '869',
    NULL,
    '1900-01-21',
    '872',
    '874'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '878',
    '',
    '879',
    '880',
    NULL,
    '1900-03-13',
    '883',
    '885'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '889',
    '',
    '890',
    '891',
    NULL,
    '1900-02-22',
    '894',
    '896'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '900',
    '',
    '901',
    '902',
    NULL,
    '1900-02-11',
    '905',
    '907'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '911',
    '',
    '912',
    '913',
    NULL,
    '1900-03-13',
    '916',
    '918'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '922',
    '',
    '923',
    '924',
    NULL,
    '1900-04-30',
    '927',
    '929'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '933',
    '',
    '934',
    '935',
    NULL,
    '1900-03-13',
    '938',
    '940'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '944',
    '',
    '945',
    '946',
    NULL,
    '1900-02-21',
    '949',
    '951'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '955',
    '',
    '956',
    '957',
    NULL,
    '1900-02-26',
    '960',
    '962'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '966',
    '',
    '967',
    '968',
    NULL,
    '1900-03-13',
    '971',
    '973'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '977',
    '',
    '978',
    '979',
    NULL,
    '1900-03-09',
    '982',
    '984'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '988',
    '',
    '989',
    '990',
    NULL,
    '1900-03-09',
    '993',
    '995'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '999',
    '',
    '1000',
    '1001',
    NULL,
    '1900-02-26',
    '1004',
    '1006'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1010',
    '',
    '1011',
    '1012',
    NULL,
    '1900-03-09',
    '1015',
    '1017'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1021',
    '',
    '1022',
    '1023',
    NULL,
    '1900-03-10',
    '1026',
    '1028'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1032',
    '',
    '1033',
    '1034',
    NULL,
    '1900-03-09',
    '1037',
    '1039'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1043',
    '',
    '1044',
    '1045',
    NULL,
    '1900-03-09',
    '1048',
    '1050'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1054',
    '',
    '1055',
    '1056',
    NULL,
    '1900-03-09',
    '1059',
    '1061'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1065',
    '',
    '1066',
    '1067',
    NULL,
    '1900-02-26',
    '1070',
    '1072'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1076',
    '',
    '1077',
    '1078',
    NULL,
    '1900-02-08',
    '1081',
    '1083'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1087',
    '',
    '1088',
    '1089',
    NULL,
    '1900-02-28',
    '1092',
    '1094'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1098',
    '',
    '1099',
    '1100',
    NULL,
    '1900-03-06',
    '1103',
    '1105'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1109',
    '',
    '1110',
    '1111',
    NULL,
    '1900-03-25',
    '1114',
    '1116'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1120',
    '',
    '1121',
    '1122',
    NULL,
    '1900-02-08',
    '1125',
    '1127'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1131',
    '',
    '1132',
    '1133',
    NULL,
    '1900-02-08',
    '1136',
    '1138'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1142',
    '',
    '1143',
    '1144',
    NULL,
    '1900-02-28',
    '1147',
    '1149'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1153',
    '',
    '1154',
    '1155',
    NULL,
    '1900-02-05',
    '1158',
    '1160'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1164',
    '',
    '1165',
    '1166',
    NULL,
    '1900-02-20',
    '1169',
    '1171'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1175',
    '',
    NULL,
    '1176',
    NULL,
    '1900-02-16',
    '1179',
    '1181'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1185',
    '',
    '1186',
    '1187',
    NULL,
    '1900-02-05',
    '1190',
    '1192'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1196',
    '',
    NULL,
    '1197',
    NULL,
    '1900-02-16',
    '1200',
    '1202'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1206',
    '',
    '1207',
    '1208',
    NULL,
    '1900-02-16',
    '1211',
    '1213'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1217',
    '',
    '1218',
    '1219',
    NULL,
    '1900-02-16',
    '1222',
    '1224'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1228',
    '',
    '1229',
    '1230',
    NULL,
    '1900-02-05',
    '1233',
    '1235'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1239',
    '',
    '1240',
    '1241',
    NULL,
    '1900-02-05',
    '1244',
    '1246'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1250',
    '',
    '1251',
    '1252',
    NULL,
    '1900-02-02',
    '1255',
    '1257'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1261',
    '',
    '1262',
    '1263',
    NULL,
    '1900-02-16',
    '1266',
    '1268'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1272',
    '',
    '1273',
    '1274',
    NULL,
    '1900-02-16',
    '1277',
    '1279'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1283',
    '',
    '1284',
    '1285',
    NULL,
    '1900-02-05',
    '1288',
    '1290'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1294',
    '',
    '1295',
    '1296',
    NULL,
    '1900-02-05',
    '1299',
    '1301'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1305',
    '',
    '1306',
    '1307',
    NULL,
    '1900-02-16',
    '1310',
    '1312'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1316',
    '',
    '1317',
    '1318',
    NULL,
    '1900-02-16',
    '1321',
    '1323'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1327',
    '',
    NULL,
    '1328',
    NULL,
    '1900-02-02',
    '1331',
    '1333'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1337',
    '',
    '1338',
    '1339',
    NULL,
    '1900-02-05',
    '1342',
    '1344'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1348',
    '',
    '1349',
    '1350',
    NULL,
    '1900-02-13',
    '1353',
    '1355'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1359',
    '',
    '1360',
    '1361',
    NULL,
    '1900-02-05',
    '1364',
    '1366'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1370',
    '',
    '1371',
    '1372',
    NULL,
    '1900-02-05',
    '1375',
    '1377'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1381',
    '',
    '1382',
    '1383',
    NULL,
    '1900-02-02',
    '1386',
    '1388'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1392',
    '',
    '1393',
    '1394',
    NULL,
    '1900-02-05',
    '1397',
    '1399'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1403',
    '',
    '1404',
    '1405',
    NULL,
    '1900-02-05',
    '1408',
    '1410'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1414',
    '',
    '1415',
    '1416',
    NULL,
    '1900-02-02',
    '1419',
    '1421'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1425',
    '',
    '1426',
    '1427',
    NULL,
    '1900-02-05',
    '1430',
    '1432'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1436',
    '',
    '1437',
    '1438',
    NULL,
    '1900-02-02',
    '1441',
    '1443'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1447',
    '',
    '1448',
    '1449',
    NULL,
    '1900-02-16',
    '1452',
    '1454'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

INSERT INTO tenants (first_name, last_name, email, phone, personal_id, moved_in_date, street, number, apartment_no) VALUES (
    '1458',
    '',
    '1459',
    '1460',
    NULL,
    '1900-02-16',
    '1463',
    '1465'
) ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    phone = VALUES(phone),
    moved_in_date = VALUES(moved_in_date),
    street, number = VALUES(street, number),
    apartment_no = VALUES(apartment_no);

-- Importera lägenheter
-- OBS: Lägenhetsinformation behöver extraheras från samma data
-- Exempel:
INSERT INTO apartments (street, number, apartment_number, postal_code, city, rooms, area, price) VALUES (
    '93',
    '',
    '95',
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
    '861',
    '',
    '863',
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
    '247',
    '',
    '249',
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
    '532',
    '',
    '534',
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
    '1026',
    '',
    '1028',
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
-- Exempel på SQL som kan köras:
INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = '88' AND t.last_name = ''
AND a.street = '93' AND a.number = '' AND a.apartment_number = '95'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = '856' AND t.last_name = ''
AND a.street = '861' AND a.number = '' AND a.apartment_number = '863'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = '242' AND t.last_name = ''
AND a.street = '247' AND a.number = '' AND a.apartment_number = '249'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = '527' AND t.last_name = ''
AND a.street = '532' AND a.number = '' AND a.apartment_number = '534'
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO tenant_apartments (tenant_id, apartment_id)
SELECT t.id, a.id FROM tenants t
JOIN apartments a ON t.first_name = '1021' AND t.last_name = ''
AND a.street = '1026' AND a.number = '' AND a.apartment_number = '1028'
ON DUPLICATE KEY UPDATE id = id;

-- Ange nödvändiga behörigheter för användaren
GRANT SELECT, INSERT, UPDATE, DELETE ON tenants TO 'boss@d374919'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON apartments TO 'boss@d374919'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON tenant_apartments TO 'boss@d374919'@'%';
