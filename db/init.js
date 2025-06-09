const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});
console.log('Connected to MySQL database', process.env.DB_HOST);
const createDatabaseSql = `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`;
pool.query(createDatabaseSql, (err, results, fields) => {
  if (err) {
    return console.error('Error creating database:', err.message);
  }
  console.log('Database created successfully');
});
// 切换到新创建的数据库
pool.changeUser({database: process.env.DB_NAME}, err => {
    if (err) {
      return console.error('Error changing user:', err.message);
    }
    console.log('User changed to boke');
  });
// 用户表
const createTableSql = `CREATE TABLE IF NOT EXISTS sys_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    avatar TEXT,
    email VARCHAR(100),
    ip VARCHAR(100),
    address VARCHAR(100),
    system VARCHAR(100),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
// 文章表
const createArticleTableSql = `CREATE TABLE IF NOT EXISTS sys_article (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content LONGBLOB,
    image_url VARCHAR(255),
    type VARCHAR(100),
    heat INT DEFAULT 0,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`;
//   文章类型表
const createArticleTypeTableSql = `CREATE TABLE IF NOT EXISTS sys_article_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
//   树洞表
const createTreeholeTableSql = `CREATE TABLE IF NOT EXISTS sys_treehole (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
  // 评论表
const createCommentTableSql = `CREATE TABLE IF NOT EXISTS sys_comment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(255),
    avatar VARCHAR(255),
    nickname VARCHAR(100),
    url VARCHAR(255),
    target_id INT,
    pid INT,
    emile VARCHAR(100),
    type VARCHAR(100),
    content TEXT NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
  // 访客表
  const createVisitorTableSql = `CREATE TABLE IF NOT EXISTS sys_visitor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip VARCHAR(100) NOT NULL,
    address VARCHAR(100),
    longitude VARCHAR(100),
    latitude VARCHAR(100),
    system VARCHAR(100),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`;
  // 友联表
  const createLinkTableSql = `CREATE TABLE IF NOT EXISTS sys_link (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    remark VARCHAR(255),
    type INT,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
  // 项目表
  const createProjectTableSql = `CREATE TABLE IF NOT EXISTS sys_project (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    remark VARCHAR(255),
    type INT,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
  // 菜单表
  const createMenuTableSql = `CREATE TABLE IF NOT EXISTS sys_menu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_name VARCHAR(100) NOT NULL,
    menu_type INT,
    url VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    parent_id INT,
    open_type INT,
    sort INT,
    visible INT,
    remark VARCHAR(255),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`;
  // 发现表
  const createFindTableSql = `CREATE TABLE IF NOT EXISTS sys_find (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    type VARCHAR(100),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`;
  // 发现-类型表
  const createFindTypeTableSql = `CREATE TABLE IF NOT EXISTS sys_find_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    image_url VARCHAR(255),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`;
  // 执行sql语句
  const sqls = [createTableSql, createArticleTableSql, createArticleTypeTableSql, createTreeholeTableSql, createCommentTableSql, createVisitorTableSql, createLinkTableSql, createProjectTableSql, createMenuTableSql, createFindTableSql, createFindTypeTableSql];
  // 执行sql语句
  sqls.forEach(sql => {
    pool.query(sql, (err, results, fields) => {
      if (err) {
        return console.error('Error creating table:', err.message);
      }
      console.log('Table created successfully');
    });
  });