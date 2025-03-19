@echo off
echo Startar DFRM-miljö för utveckling...

:: Konfigurera miljövariabler för SMTP (utgående mail)
set SMTP_HOST=mailcluster.loopia.se
set SMTP_PORT=587
set SMTP_USER=info@duggalsfastigheter.se
set SMTP_PASS=!e8E$..n2MP2W_7

:: Konfigurera miljövariabler för felanmälan (IMAP)
set EMAIL_HOST=mailcluster.loopia.se
set EMAIL_PORT=993
set EMAIL_USER=felanmalan@duggalsfastigheter.se
set EMAIL_PASSWORD=EFtXeWpTXtn4d@?

:: Konfigurera miljövariabler för intresse (IMAP)
set EMAIL_PORT_INTRESSE=993
set EMAIL_USER_INTRESSE=intresse@duggalsfastigheter.se
set EMAIL_PASSWORD_INTRESSE=qhEYxmLw-!f5T%4

:: Konfigurera miljövariabler för intresse (SMTP)
set EMAIL_HOST_INTEREST=mailcluster.loopia.se
set EMAIL_PORT_INTEREST=587
set EMAIL_USER_INTEREST=intresse@duggalsfastigheter.se
set EMAIL_PASSWORD_INTEREST=qhEYxmLw-!f5T%4

:: Starta backend (Spring Boot)
cd backend
start cmd /k mvnw spring-boot:run

:: Vänta lite så att backend hinner starta
timeout /t 10

:: Starta frontend (React)
cd ../frontend
start cmd /k npm start

echo DFRM-miljö startad! 