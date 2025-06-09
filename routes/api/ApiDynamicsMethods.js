const db = require("../../db/sql");
const moment = require("moment");

const filterList = (data, list, data1) => {
  const arr = data.map(item => {
    const target = list.filter(item1 => (item1.target_id && item1.target_id === item.id) || (!item1.target_id && item1.pid === item.id))
    item.pName = data1.find(item1 => (item1.target_id && item1.target_id === item.id) || (!item1.target_id && item1.pid === item.id))?.nickname || ''
    if (!item.pName) {
      item.pName = list.find(item1 => (item1.target_id && item1.target_id === item.id) || (!item1.target_id && item1.pid === item.id))?.nickname || ''
    }
    if (!item.pid) item.pName = ''
    if (target.length > 0){
      item.children = filterList(target, list, data1)
    }
    return item
  })
  return arr
}
// 获取动态列表
exports.getDynamics = async (req, res) => {
  const { currentPage=1, pageSize=20, start_time, end_time, content } = req.body;

  let where = "";
  if (start_time && end_time) {
    where = `WHERE create_at BETWEEN '${start_time}' AND '${end_time}'`;
  }
  if (content) {
    where += ` AND content LIKE '%${content}%'`;
  }
  const sql = `
    SELECT 
        a.*, 
        COUNT(c.id) AS comment_count
    FROM 
        sys_dynamics a
    LEFT JOIN 
        sys_comment c ON c.uid = a.id AND c.type = 'comment'
    GROUP BY 
        a.id
  `
  db.queryPage("sys_dynamics", currentPage, pageSize, where, (result) => {
        const list = result.data?.list || []
        const idList = list.map(item => item.id)
        const tj1 = `WHERE uid in (${idList.join(',')})`
        db.queryPage('sys_comment',1, 10000, tj1, (result1) => {
          const list1 = result1?.data?.list || []
          console.log(list1)
          const data = filterList(list, list1, list)
          res.status(result.code).json({
            ...result,
            data: {
              ...result.data,
              list: data
            }
          })
      })
    // res.status(200).json(result);
  }, sql);
};

// 新增动态
exports.addDynamics = (req, res) => {
  const { content } = req.body;
  // 2. 并行查询评论和评论
  db.queryAdd('sys_dynamics', { content }, (result) => {
    db.sqlExport(res, result)
  });
};
// 编辑动态
exports.editDynamics = (req, res) => {
  const { id, content } = req.body;
  db.queryUpdate('sys_dynamics', { content }, id, (result) => {
    db.sqlExport(res, result)
  });
};

// 删除动态
exports.deleteDynamics = (req, res) => {
  const { id } = req.body;
  db.queryDelete('sys_dynamics', id, (result) => {
    db.sqlExport(res, result)
  });
};

// 动态详情
exports.getDynamicsDetail = (req, res) => {
  const { id } = req.params;
  db.queryFind('sys_dynamics', id, (result) => {
    res.status(200).json(result);
  });
};