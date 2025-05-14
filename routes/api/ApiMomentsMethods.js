const db = require("../../db/sql");
const filterList = (data, list, data1) => {
  const arr = data.map(item => {
    const target = list.filter(item1 => item1.target_id === item.id)
    item.pName = data1.find(item1 => item1.id === item.target_id)?.nickname || ''
    if (!item.pName) {
      item.pName = list.find(item1 => item1.id === item.target_id)?.nickname || ''
    }
    if (target.length > 0){
      item.children = filterList(target, list, data1)
    }
    return item
  })
  return arr
}
// 获取评论列表
exports.getMoments = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, type = "moment" } = req.body;
    const tj = ` WHERE type='${type}' AND pid is null`
    db.queryPage('sys_comment',page, pageSize, tj, (result) => {
      const list = result.data?.list || []
      const idList = list.map(item => item.id)
      const tj1 = `WHERE type='${type}' AND pid in (${idList.join(',')})`
      db.queryPage('sys_comment',page, 10000, tj1, (result1) => {
        const list1 = result1?.data?.list || []
        const data = filterList(list, list1, list)
        res.status(result.code).json({
          ...result,
          data: {
            ...result.data,
            list: data
          }
        })
    })
      // db.sqlExport(res, result)
    });
  } catch (err) {
    db.sqlExport(res, null)
  }
};

// 新增评论
exports.addMoments = (req, res) => {
  const { content, image, avatar, nickname, type, email, url, target_id, pid } = req.body;
  const typeList = ["comment","link","article", 'message']
  let message = ''
  if (!nickname) message = '昵称不能为空'
  else if (!email) message = '邮箱不能为空'
  else if (!content) message = '评论内容不能为空'
  else if (!type ||!typeList.includes(type)) message = '评论类型错误'
  if (message) {
    res.status(400).json({
      code: 400,
      message: message,
    });
    return;
  }
  // 2. 并行查询评论和评论
  db.queryAdd('sys_comment', { content, image, avatar, nickname, type, email, url, target_id: target_id || null, pid: pid || null }, (result) => {
    db.sqlExport(res, result)
  });
};
