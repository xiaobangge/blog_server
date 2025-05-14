const db = require("../../db/sql");
const moment = require("moment");

// 获取动态列表
exports.getDynamics = async (req, res) => {
  try {
    const sql = `SELECT *
                FROM sys_dynamics
                ORDER BY id DESC
                LIMIT 0, 10;`
    db.query(sql, (err, result) => {
        if (err) {
        console.log(err);
        res.status(500).json({
            message: "服务器错误",
        });
        } else {
          const data = result.map((item) => {
            return {
              ...item,
              create_at: moment(item.create_at).format("YYYY-MM-DD HH:mm:ss"),
              content: item.content.toString()
            };
          });
        res.status(200).json({
            code: 200,
            message: "ok",
            data,
        });
        }
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
    });
  }
};

// 新增动态
exports.addDynamics = (req, res) => {
  const { content } = req.body;
  // const create_at = moment().format("YYYY-MM-DD HH:mm:ss");
  // 2. 并行查询动态和评论
  const sql = "INSERT INTO sys_dynamics (content) VALUES (?)";
  db.query(sql, [content], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        message: "服务器错误",
      });
    } else {
      res.status(200).json({
        code: 200,
        message: "新增动态成功",
        data: result,
      });
    }
  });
};
