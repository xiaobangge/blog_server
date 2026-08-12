const db = require("../../db/sql");
const path = require("path");
const fs = require("fs");
const moment = require("moment");

// 获取友联列表
exports.getLinkList = (req, res) => {
  const { page=1, pageSize=1000, type } = req.body;
  const tj = type ? `WHERE type=${type}` : ''
  db.queryPage('sys_link', page, pageSize, tj, (result) => {
    db.sqlExport(res, result)
  })
};

// 添加友联
exports.addLink = (req, res) => {
  const { name, url, avatar, remark, type } = req.body;
  // 2. 并行查询评论和评论
  db.queryAdd('sys_link', { name, url, avatar, remark, type }, (result) => {
    db.sqlExport(res, result)
  });
}

// 删除友联
exports.deleteLink = (req, res) => {
  const { id } = req.body;
  let msg = "";
  if (!id) msg = "ID不能为空";
  if (msg) {
    return res.status(400).json({
      code: 400,
      message: msg,
    });
  }
  db.queryDelete('sys_link', id, (result) => {
    db.sqlExport(res, result)
  });
}
// 修改友联
exports.updateLink = (req, res) => {
  const { id, name, url, avatar, remark, type } = req.body;
  let msg = ''
  if (!id) msg = 'ID不能为空';
  if (!name) msg = '链接名称不能为空';
  if (!url) msg = '链接地址不能为空';
  if (!avatar) msg = '链接图标不能为空';
  if (!type) msg = '链接类型不能为空';
  if (msg) {
    return res.status(400).json({
      code: 400,
      message: msg
    })
  }
  db.queryUpdate('sys_link', { name, url, avatar, remark, type }, id, (result) => {
    db.sqlExport(res, result)
  });
}