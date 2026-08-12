const db = require("../../db/sql");

// 获取发现类型列表
exports.getFindTypeList = (req, res) => {
  db.queryAction('SELECT * FROM sys_find_type', '获取发现类型列表成功', (result) => {
    db.sqlExport(res, result)
  });
};

// 添加发现
exports.addFindType = (req, res) => {
  const { title, image_url } = req.body;
  // 2. 并行查询评论和评论
  db.queryAdd('sys_find_type', { title, image_url }, (result) => {
    db.sqlExport(res, result)
  });
}

// 删除发现
exports.deleteFindType = (req, res) => {
  const { id } = req.body;
  let msg = "";
  if (!id) msg = "ID不能为空";
  if (msg) {
    return res.status(400).json({
      code: 400,
      message: msg,
    });
  }
  db.queryDelete('sys_find_type', id, (result) => {
    db.sqlExport(res, result)
  });
}
// 修改发现
exports.updateFindType = (req, res) => {
  const { id, title, image_url } = req.body;
  let msg = ''
  if (!id) msg = 'ID不能为空';
  if (!title) msg = '名称不能为空';
  if (!image_url) msg = '图标不能为空';
  if (msg) {
    return res.status(400).json({
      code: 400,
      message: msg
    })
  }
  db.queryUpdate('sys_find_type', { title, image_url }, id, (result) => {
    db.sqlExport(res, result)
  });
}



// 获取发现列表
exports.getFindList = (req, res) => {
  const { page=1, pageSize=1000, type } = req.body;
  const tj = type ? `WHERE type=${type}` : ''
  db.queryPage('sys_find', page, pageSize, tj, (result) => {
    db.sqlExport(res, result)
  })
};

// 添加发现
exports.addFind = (req, res) => {
  const { title, url, image_url, content, type } = req.body;
  // 2. 并行查询评论和评论
  db.queryAdd('sys_find', { title, url, image_url, content, type }, (result) => {
    db.sqlExport(res, result)
  });
}

// 删除发现
exports.deleteFind = (req, res) => {
  const { id } = req.body;
  let msg = "";
  if (!id) msg = "ID不能为空";
  if (msg) {
    return res.status(400).json({
      code: 400,
      message: msg,
    });
  }
  db.queryDelete('sys_find', id, (result) => {
    db.sqlExport(res, result)
  });
}
// 修改发现
exports.updateFind = (req, res) => {
  const { id, title, url, image_url, content, type } = req.body;
  let msg = ''
  if (!id) msg = 'ID不能为空';
  if (!title) msg = '名称不能为空';
  if (!url) msg = '地址不能为空';
  if (!image_url) msg = '图标不能为空';
  if (!type) msg = '类型不能为空';
  if (msg) {
    return res.status(400).json({
      code: 400,
      message: msg
    })
  }
  db.queryUpdate('sys_find', { title, url, image_url, content, type }, id, (result) => {
    db.sqlExport(res, result)
  });
}