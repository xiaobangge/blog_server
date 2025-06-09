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
// 更新项目
exports.updateProject = (req, res) => {
  const { id, name, url, avatar, remark } = req.body;
  let msg = ''
  if (!id) msg = 'ID不能为空';
  if (!name) msg = '项目名称不能为空';
  if (!url) msg = '项目地址不能为空';
  if (!avatar) msg = '项目图标不能为空';
  if (msg) {
    return res.status(400).json({
      code: 400,
      message: msg
    })
  }
  db.queryUpdate('sys_project', { name, url, avatar, remark }, id, (result) => {
    db.sqlExport(res, result)
  });
};
// 删除项目
exports.deleteProject = (req, res) => {
  const { id } = req.body;
  db.queryDelete('sys_project', id, (result) => {
    db.sqlExport(res, result)
  });
};