-- mbg_schema.sql (optional server-side)
CREATE DATABASE mbg_attendance;
USE mbg_attendance;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) UNIQUE,
  password VARCHAR(255),
  role VARCHAR(20),
  full_name VARCHAR(150),
  class_name VARCHAR(50)
);
CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_name VARCHAR(50),
  date DATE,
  present JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- add admin example
INSERT INTO users (username,password,role,full_name) VALUES ('admin','admin123','admin','Administrator');
