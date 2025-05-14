const db = require("../../db/sql");
const path = require("path");
const fs = require("fs");
const moment = require("moment");

// 获取友联列表
exports.getLinkList = (req, res) => {
  const { page=1, pageSize=1000, type=1 } = req.body;
  const tj = `WHERE type=${type}`
  db.queryPage('sys_link', page, pageSize, tj, (result) => {
    db.sqlExport(res, result)
  })
};

// 添加友联
exports.addLink = (req, res) => {
// 新增评论
exports.addMoments = (req, res) => {
  const { name, url, avatar, remark, type } = req.body;
  // 2. 并行查询评论和评论
  db.queryAdd('sys_link', { name, url, avatar, remark, type }, (result) => {
    db.sqlExport(res, result)
  });
};

}