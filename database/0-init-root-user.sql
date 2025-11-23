-- Ensure root user has a known password for local development
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
ALTER USER 'root'@'%' IDENTIFIED BY 'root';
FLUSH PRIVILEGES;


