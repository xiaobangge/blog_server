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
    const result = (resu.data || []).map(item => ({...item, date: moment(item.date).format('MM月DD日') }))
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('访店列表');
    worksheet.columns = [
      { header: '日期', key: 'date', width: 9.4},
      { header: '客户名称', key: 'customer', width: 43.03},
      { header: '客户细分品类', key: 'type', width: 22.52},
      { header: '关键人名字/职务', key: 'keyman_position', width: 17.77},
      { header: '联系方式', key: 'phone', width: 24.02},
      { header: '加盟/直营', key: 'jmType', width: 20.75},
      { header: '店铺数量', key: 'number', width: 19.75},
      { header: '客单价', key: 'pirce', width: 19.75},
      { header: '所在省市/区/街道', key: 'address', width: 19.75},
      { header: '登记人', key: 'username', width: 15.52},
      { header: '客户跟进情况', key: 'intention', width: 85.76},
      { header: '', key: 'remark', width: 35.42},
    ];
    worksheet.getRow(1).height = 39;

    // 表头样式（居中+加粗）
    worksheet.getRow(1).eachCell(cell => {
      cell.alignment = { 
        vertical: 'middle', 
        horizontal: 'center' 
      };
      cell.font = { bold: true, size: 12 };
    });
    // worksheet.columns.forEach((column) => {
    //   const maxLength = Math.max(...result.map(item => item[column.key]?.length || 0));
    //   worksheet.getColumn(column.key).width = maxLength < 10 ? 10 : maxLength + 2; // 增加边距
    // })
    result.forEach((item) => {
      worksheet.addRow({...item, keyman_position: item.keyman + item.position });
    });

    // 数据样式（居左）
    const middles = ['date', 'keyman_position', 'phone', 'jmType', 'number', 'pirce', 'username'];
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
      res.end();
    });
  });
}