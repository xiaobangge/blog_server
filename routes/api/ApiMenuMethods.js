const db = require("../../db/sql");
const path = require("path");
const fs = require("fs");
const moment = require("moment");

// 过滤菜单列表
const filterList = (list, pid) => {
    const result = []
    const routes = list.filter(item => item.parent_id === pid)
    routes.forEach(item => {
        let children = []
        console.log(item.id)
        if (pid === 0) {
          children = filterList(list, item.id)
        }
        result.push({
            ...item,
            children
        })
    })
    return result
}
// 获取菜单列表
exports.getMenuList = async (req, res) => {
  try {
    db.queryPage('sys_menu',1, 1000, '', (result) => {
      const list = result.data?.list || []
      console.log(result)
      const data = filterList(list, 0)
      res.status(result.code).json({
        ...result,
        data
      })
      // db.sqlExport(res, result)
    });
  } catch (err) {
    db.sqlExport(res, null)
  }
}

// 创建菜单
exports.createMenu = async (req, res) => {
  const { menu_name, menu_type, url, icon, parent_id, open_type, sort, visible } = req.body
  let msg = ''
  if (!menu_name) msg = '菜单名称不能为空';
  if (!menu_type) msg = '菜单类型不能为空';
  if (!url) msg = '菜单路径不能为空';
  if (msg) {
    return res.status(400).json({
      code: 400,
      message: msg
    })
  }
  db.queryAdd('sys_menu', { menu_name, menu_type, url, icon, parent_id: parent_id || 0, open_type, sort, visible }, (result) => {
    res.status(result.code).json(result)
  });
}

// 更新菜单
exports.updateMenu = async (req, res) => {
  const { id, menu_name, menu_type, url, icon, parent_id, open_type, sort, visible } = req.body
  let msg = ''
  if (!id) msg = 'ID不能为空';
  if (!menu_name) msg = '菜单名称不能为空';
  if (!menu_type) msg = '菜单类型不能为空';
  if (!url) msg = '菜单路径不能为空';
  if (msg) {
    return res.status(400).json({
      code: 400,
      message: msg
    })
  }
  db.queryUpdate('sys_menu', { menu_name, menu_type, url, icon, parent_id: parent_id || 0, open_type, sort, visible }, id, (result) => {
    res.status(result.code).json(result)
  });
}

// 删除菜单
exports.deleteMenu = async (req, res) => {
  const { id } = req.body
  let msg = ''
  if (!id) msg = 'ID不能为空';
  if (msg) {
    return res.status(400).json({
      code: 400,
      message: msg
    })
  }
  db.queryDelete('sys_menu', id, (result) => {
    res.status(result.code).json(result)
  });
}