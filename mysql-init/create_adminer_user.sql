CREATE USER 'adminer'@'%' IDENTIFIED BY 'adminerpass';
GRANT ALL PRIVILEGES ON crmgozic.* TO 'adminer'@'%';
FLUSH PRIVILEGES;
