const app = require('express')();
const db = require("../../db/sql");
const moment = require("moment");

/**
 * 获取文章类型列表
 */
app.post('/type/list', function (req, res) {
    const sql = "SELECT * FROM sys_article_type";
    db.queryAction(sql, '获取文章类型列表成功', (result) => {
      res.status(200).json(result);
    });
  });

/**
 * 获取文章列表
 */
app.post('/list', function (req, res) {
    const { currentPage, pageSize, type } = req.body;
    const tj = type ? `WHERE type = ${type}` : "";
    db.queryPage('sys_article', currentPage, pageSize, tj, (result) => {
      res.status(200).json(result);
    })
  });

  /**
   * 新增文章
   */
  app.post('/add', function (req, res) {
    const { title, content, type, image } = req.body;
    const create_at = moment().format("YYYY-MM-DD HH:mm:ss");
    const sql = "INSERT INTO sys_article (title, content, type, image, create_at) VALUES (?,?,?,?,?)";
    db.query(sql, [title, content, type, image, create_at], (err, result) => {
        if (err) {
        console.log(err);
        res.status(500).json({
            message: "服务器错误",
        });
        } else {
        res.status(200).json({
            message: "新增文章成功",
            data: result,
        });
        }
    });
  });

/*
 * 获取文章详情
 *
*/ 
app.post('/detail/:id', function (req, res) {
  const { id } = req.params;
  const sql = `SELECT * FROM sys_article WHERE id = ${id}`;
  db.queryAction(sql, '', (result) => {
    const info = result[0] || null;
    res.status(200).json({
      code: 200,
      data: info && {
        ...info,
        content: info.content.toString(),
        create_at: moment(info.create_at).format("YYYY-MM-DD HH:mm:ss"),
      } || null,
      message: "获取文章详情成功",
    });
  });
});

module.exports = app;
