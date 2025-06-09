const db = require("../../db/sql");
const path = require("path");
const fs = require("fs");
const moment = require("moment");
exports.getArticleTypeList = (req, res) => {
  const sql = "SELECT * FROM sys_article_type";
  db.queryAction(sql, "获取文章类型列表成功", (result) => {
    res.status(200).json(result);
  });
};

// 获取文章列表
exports.getArticleList = (req, res) => {
  const { currentPage, pageSize, type, start_time, end_time, title } = req.body;

  let where = "WHERE";
  if (start_time && end_time) {
    where += ` create_at BETWEEN '${start_time}' AND '${end_time}'`;
  }
  if (type) {
    where += ` ${start_time && end_time? "AND" : ""} type = ${type}`;
  }
  if (title) {
    const and = type || (start_time && end_time) ? 'AND' : ''
    where += ` ${and} title LIKE '%${title}%'`;
  }
  where = where == "WHERE"? "" : where;
  const sql = `
    SELECT 
        a.*, 
        COUNT(c.id) AS comment_count
    FROM 
        sys_article a
    LEFT JOIN 
        sys_comment c ON c.uid = a.id AND c.type = 'article'
    ${type ? `WHERE a.type = ${type}` : ""}
    GROUP BY 
        a.id
  `
  db.queryPage("sys_article", currentPage, pageSize, where, (result) => {
    res.status(result.code).json(result);
  }, sql);
};

// 获取文章详情
exports.getArticleDetail = (req, res) => {
  const { id } = req.params;
  const sql1 = `UPDATE sys_article SET heat = heat + 1 WHERE id = ${id}`;
  db.query(sql1, () => {
    // const sql = `SELECT * FROM sys_article WHERE id = ${id}`;
    const sql = `
      SELECT 
          curr.*,
          prev.id AS prev_id,
          next.id AS next_id
      FROM 
          sys_article curr
      LEFT JOIN 
          sys_article prev ON prev.id = (
              SELECT IFNULL(
                  (SELECT id FROM sys_article WHERE id < curr.id ORDER BY id DESC LIMIT 1),
                  (SELECT id FROM sys_article ORDER BY id DESC LIMIT 1)
              )
          )
      LEFT JOIN 
          sys_article next ON next.id = (
              SELECT IFNULL(
                  (SELECT id FROM sys_article WHERE id > curr.id ORDER BY id ASC LIMIT 1),
                  (SELECT id FROM sys_article ORDER BY id ASC LIMIT 1)
              )
          )
      WHERE 
          curr.id = ${id};

    `
    db.queryAction(sql, "", (result) => {
      console.log(result)
      const info = result?.[0] || null;
      const code = result?.code || 200;
      res.status(code).json({
        code: code,
        data:
          (info && {
            ...info,
            content: info.content.toString(),
            create_at: moment(info.create_at).format("YYYY-MM-DD HH:mm:ss"),
          }) ||
          result?.message,
        message: "获取文章详情成功",
      });
    });
  });
};

// 文章按年份统计数量
exports.getArticleCountByYear = (req, res) => {
  const sql = `SELECT YEAR(create_at) as year, COUNT(*) as count FROM sys_article GROUP BY YEAR(create_at)`;
  db.queryAction(sql, "获取文章数量成功", (result) => {
    db.sqlExport(res, result);
  });
};

// 文章按年份获取列表
exports.getArticleListByYear = (req, res) => {
  const { year } = req.params;
  const sql = `SELECT * FROM sys_article WHERE YEAR(create_at) = ${year}`;
  db.queryAction(sql, "获取文章列表成功", (result) => {
    db.sqlExport(res, result);
  });
};

// 新增文章
exports.addArticle = (req, res) => {
  const { title, content, type, image_url } = req.body;
  let msg = ''
  if (!title) msg = '文章标题不能为空';
  if (!content) msg = '文章内容不能为空';
  if (!type) msg = '文章类型不能为空';
  if (msg) {
    return res.status(400).json({
      code: 400,
      message: msg
    })
  }
  db.queryAdd('sys_article', { title, content, type, image_url }, (result) => {
    db.sqlExport(res, result);
  });
};

// 修改文章
exports.editArticle = (req, res) => {
  const { title, content, type, image_url, id } = req.body;
  let msg = ''
  if (!id) msg = 'ID不能为空';
  if (!title) msg = '文章标题不能为空';
  if (!content) msg = '文章内容不能为空';
  if (!type) msg = '文章类型不能为空';
  if (msg) {
    return res.status(400).json({
      code: 400,
      message: msg
    })
  }
  db.queryUpdate('sys_article', { title, content, type, image_url }, id, (result) => {
    db.sqlExport(res, result);
  });
};

// 删除文章
exports.deleteArticle = (req, res) => {
  const { id } = req.body;
  let msg = "";
  if (!id) msg = "ID不能为空";
  if (msg) {
    return res.status(400).json({
      code: 400,
      message: msg,
    });
  }
  db.queryDelete("sys_article", id, (result) => {
    db.sqlExport(res, result);
  });
};
