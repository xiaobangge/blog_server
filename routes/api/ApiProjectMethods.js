const db = require("../../db/sql");
const path = require("path");
const fs = require("fs");
const moment = require("moment");

// 获取项目列表
exports.getProjectList = (req, res) => {
  const { page=1, pageSize=1000 } = req.body;
  db.queryPage('sys_project', page, pageSize, '', (result) => {
    db.sqlExport(res, result)
  })
};

// 添加项目
exports.addProject = (req, res) => {
  const { name, url, avatar, remark } = req.body;
  // 2. 并行查询评论和评论
  db.queryAdd('sys_project', { name, url, avatar, remark }, (result) => {
    db.sqlExport(res, result)
  });
};