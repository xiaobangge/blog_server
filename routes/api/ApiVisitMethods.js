const db = require("../../db/sql");
const ExcelJS = require('exceljs');
const moment = require('moment');


// 获取访店列表
exports.getVisitList = (req, res) => {
  const { date, create_by } = req.body;
  const sql = `SELECT * FROM sys_visit WHERE DATE(date) = '${date}' AND create_by = '${create_by}'`;
  db.queryAction(sql, '获取访店列表成功', (result) => {
    db.sqlExport(res, result)
  });
};

// 获取访店详情
exports.getVisitInfo = (req, res) => {
  const { id } = req.body;
  const sql = `SELECT * FROM sys_visit WHERE id = ${id}`;
  db.queryAction(sql, '获取访店详情成功', (result) => {
    db.sqlExport(res, result)
  });
};

// 添加访店
exports.addFVisit = (req, res) => {
  const body = req.body;
  // 2. 并行查询评论和评论
  db.queryAdd('sys_visit', body, (result) => {
    db.sqlExport(res, result)
  });
}

// 删除访店
exports.deleteVisit = (req, res) => {
  const { id } = req.body;
  let msg = "";
  if (!id) msg = "ID不能为空";
  if (msg) {
    return res.status(400).json({
      code: 400,
      message: msg,
    });
  }
  db.queryDelete('sys_visit', id, (result) => {
    db.sqlExport(res, result)
  });
}
// 修改访店
exports.updateVisit = (req, res) => {
  let body = {};
  const whiteList = ['id', 'create_at', 'updated_at'];
  for (let key in req.body) {
    if (whiteList.includes(key)) continue;
    body[key] = req.body[key];
  }
  db.queryUpdate('sys_visit', body, req.body.id, (result) => {
    db.sqlExport(res, result)
  });
}

// 导出表数据
exports.exportVisit = (req, res) => {
  const keys = Object.keys(req.body);
  let body = {};
  if (!keys.includes('date')) {
    body = JSON.parse(keys[0]);
  } else {
    body = req.body;
  }
  const { date, create_by } = body;
  console.log(body, date)
  const sql = `SELECT * FROM sys_visit WHERE DATE(date) = '${date}' AND create_by = '${create_by}'`;
  db.queryAction(sql, '获取访店列表成功', (resu) => {
    const result = (resu.data || []).map(item => ({...item, date: moment(item.date).format('YYYYMMDD') }))
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('访店列表');
    worksheet.columns = [
      { header: '日期', key: 'date', width: 9.4},
      { header: '客户名称', key: 'customer', width: 23.03},
      { header: '品牌', key: 'default_key', width: 23.03},
      { header: '客户等级(A\B\C\D)', key: 'customerTier', width: 23.03},
      { header: '客户类型1级', key: 'type1', width: 13.03},
      { header: '客户类型2级', key: 'type2', width: 13.03},
      { header: '客户类型3级', key: 'type3', width: 13.03},
      { header: '细分标签', key: 'type', width: 22.52},
      { header: '单店\连锁', key: 'default_key', width: 23.03},
      { header: '店铺数', key: 'number', width: 19.75},
      { header: '直营\加盟', key: 'jmType', width: 23.03},
      { header: '客单价', key: 'pirce', width: 19.75},
      { header: '招牌菜品', key: 'default_key', width: 23.03},
      { header: '上级客户（即属于哪个一级销商）', key: 'default_key', width: 23.03},
      { header: '客户来源', key: 'default_key', width: 23.03},
      { header: '合作情况', key: 'default_key', width: 23.03},
      { header: '分层规模', key: 'default_key', width: 23.03},
      { header: '管理模式', key: 'default_key', width: 23.03},
      { header: '渠道类型', key: 'default_key', width: 23.03},
      { header: '商圈', key: 'business_district', width: 23.03},
      { header: '所在省市/区/街道', key: 'address', width: 19.75},
      { header: '大区', key: 'default_key', width: 23.03},
      { header: '区域', key: 'default_key', width: 23.03},
      { header: '登记人', key: 'username', width: 15.52},
      { header: '客户编码/ID', key: 'default_key', width: 23.03},
      { header: '备注', key: 'default_key', width: 23.03},
      { header: '关键人', key: 'keyman', width: 17.77},
      { header: '职务', key: 'position', width: 17.77},
      { header: '联系方式', key: 'phone', width: 24.02},
      { header: '客户跟进情况', key: 'intention', width: 25.76},
      { header: '生意好的门店/黑马/连锁', key: 'tag_customer', width: 25.76},
      { header: '姬松茸菌汤推荐（送样/测试/活动/提案）', key: 'mushroom_soup', width: 25.76},
    ];
    // { header: '加盟/直营', key: 'jmType', width: 20.75},
    // { header: '', key: 'remark', width: 35.42},
    
    // 表头样式（居中+加粗）
    worksheet.getRow(1).eachCell(cell => {
      cell.alignment = { 
        vertical: 'middle', 
        horizontal: 'center' 
      };
      cell.font = { bold: true, size: 12 };
    });
    result.forEach((item) => {
      worksheet.addRow({...item });
    });

    // 数据样式（居左）
    const middles = ['date', 'phone', 'jmType', 'number', 'pirce', 'username'];
    for(let i = 2; i <= worksheet.rowCount; i++) {
      worksheet.getRow(i).eachCell(cell => {
        cell.alignment = { 
          vertical: 'middle',
          horizontal: middles.includes(cell._column.key)? 'center' : 'left' 
        };
        cell.font = { size: 12 };
      });
      worksheet.getRow(i).height = 22;
    }
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment;filename=${encodeURIComponent('扫街陌拜客户情况记录.xlsx')}`);
    return workbook.xlsx.write(res).then(() => {
      console.log(worksheet.columns)
      res.end();
    });
  });
}