const db = require("../../db/sql");
const path = require("path");
const fs = require("fs");
const moment = require("moment");
exports.getArticleTypeList = (req, res) => {
  const sql = "SELECT * FROM sys_article_type";
  db.queryAction(sql, '获取文章类型列表成功', (result) => {
    res.status(200).json(result);
  });
};

// 获取文章列表
exports.getArticleList = (req, res) => {
  const { currentPage, pageSize, type } = req.body;
  const tj = type ? `WHERE type = ${type}` : "";
  db.queryPage('sys_article', currentPage, pageSize, tj, (result) => {
    res.status(200).json(result);
  })
};

// 获取文章详情
exports.getArticleDetail = (req, res) => {
  const { id } = req.params;
  const sql1 = `UPDATE sys_article SET heat = heat + 1 WHERE id = ${id}`;
  db.query(sql1, () => {
    const sql = `SELECT * FROM sys_article WHERE id = ${id}`;
    db.queryAction(sql, '', (result) => {
      const info = result?.[0] || null;
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
  })
};

// 文章按年份统计数量
exports.getArticleCountByYear = (req, res) => {
  const sql = `SELECT YEAR(create_at) as year, COUNT(*) as count FROM sys_article GROUP BY YEAR(create_at)`;
  db.queryAction(sql, '获取文章数量成功', (result) => {
    db.sqlExport(res, result)
  });
};


// 文章按年份获取列表
exports.getArticleListByYear = (req, res) => {
  const { year } = req.params;
  const sql = `SELECT * FROM sys_article WHERE YEAR(create_at) = ${year}`;
  db.queryAction(sql, '获取文章列表成功', (result) => {
    db.sqlExport(res, result)
  });
};

// 新增文章
exports.addArticle = (req, res) => {
  const { title, content, type, image } = req.body;
  const create_at = moment().format("YYYY-MM-DD HH:mm:ss");
  const sql = "INSERT INTO sys_article (title, content, type, image_url, create_at) VALUES (?,?,?,?,?)";
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
};

// 修改文章
exports.editArticle = (req, res) => {
  const { id } = req.params;
  const { title, content, typeId } = req.body;
  const sql = `UPDATE sys_article SET title = '${title}', content = '${content}', type_id = ${typeId} WHERE id = ${id}`;
  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({
        message: "服务器错误",
      });
    } else {
      res.status(200).json({
        message: "修改文章成功",
        data: result,
      });
    }
  });
};

// 删除文章
exports.deleteArticle = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM sys_article WHERE id = ${id}`;
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        message: "服务器错误",
      });
    } else {
      res.status(200).json({
        message: "删除文章成功",
        data: result,
      });
    }
  });
};