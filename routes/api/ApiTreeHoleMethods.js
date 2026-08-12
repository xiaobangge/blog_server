const db = require("../../db/sql");
const moment = require("moment");
// 获取树洞列表
exports.getTreeList = (req, res) => {
    const { currentPage=1, pageSize=100 } = req.body;
    db.queryPage('sys_treehole', currentPage, pageSize, '', (result) => {
      res.status(200).json(result);
    })
};

// 添加树洞
exports.addTreeHole = (req, res) => {
    const { content } = req.body;
      db.queryAdd('sys_treehole', {content}, (result) => {
        if (!result) {
          res.status(500).json({
            message: "服务器错误",
          });
        } else {
          res.status(200).json(result);
        }
      });
}