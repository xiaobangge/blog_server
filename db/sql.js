const mysql = require('mysql2');
const moment = require('moment');
const pool = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 10, // 控制最大连接数
  waitForConnections: true, // 启用排队机制
  idleTimeoutMillis: 60000, // 空闲连接回收时间
  multipleStatements: true // 支持批量语句
});

// 心跳包逻辑
setInterval(async () => {
  try {
      const [rows] = await pool.execute('SELECT 1');
      console.log('心跳包发送成功:', rows);
  } catch (err) {
      console.error('心跳包发送失败:', err.message);
  }
}, 30000); // 每30秒发送一次心跳包
pool.connect((err) => {
  if (err) {
    console.error('error connecting: ', err);
    return;
  }
  console.log('connected as id ' + pool.threadId);
});


/**
 * 
 * @param {*} sql  --> sql语句
 * @param {*} successText  --> 成功提示信息
 * @param {*} callback  --> 回调函数
 */
let queryAction = async (sql, successText, callback) => {
  try {
    pool.query(sql, (err, result) => {
      if (err) {
        console.error('query error:', err);
        callback({
          code: 400,
          message: err.message,
          data: result
        });
      } else if (successText) {
          callback({
            code: 200,
            message: successText,
            data: result
          });
        } else {
          callback(result);
        }
    });
  }catch (err) {
    console.error('query error:', err.message);
    callback(null);
  }
};

/**
 * 
 * @param {*} sql  --> sql语句
 * @param {*} page  --> 页码
 * @param {*} pageSize  --> 页大小
 * @param {*} tj  --> 筛选条件
 * @param {*} callback  --> 回调函数
 */
let queryPage = async (table, page, pageSize, tj, callback, sql_yj) => {
  try {
    
    let start = (page - 1) * pageSize;
    let totalSql = `SELECT COUNT(*) as total FROM ${table} ${tj}`;
    await queryAction(totalSql, null, async (result) => {
      console.log(result)
      if (result?.code == 400) {
        callback(result);
        return;
      }
      let total = result ? result[0].total : 0;
      let pageSql = (sql_yj ?? `SELECT * FROM ${table} ${tj}`)+`  ORDER BY create_at DESC LIMIT ${start}, ${pageSize}`;
      queryAction(pageSql, '', (res) => {
        if (res.code) {
          console.log(res)
          callback(res);
          return;
        }
        const resArr = res.map(item => {
          item.create_at = moment(item.create_at).format('YYYY-MM-DD HH:mm:ss');
          return item;
        });
        let data = {
          list: resArr,
          total: total,
          page: page,
          pageSize: pageSize
        };
        callback({
          code: 200,
          message: '查询成功',
          data: data
        });
      });
    });
  } catch (err) {
    console.log(err)
    callback(null);
  }
};

let queryAdd = async (tableName, data, callback) => {
  try {
    let sql = `INSERT INTO ${tableName} (${Object.keys(data).join(',')}) VALUES (${Object.values(data).map(() => '?').join(',')})`;
    pool.query(sql, Object.values(data), (err, result) => {
      if (err) {
        callback({
          code: 400,
          message: err.message,
          data: result
        });
      } else {
        callback({
          code: 200,
          message: '创建成功',
          data: result
        });
      }
    });
  } catch (err) {
    callback(null);
  }
};

// 封装数据更新方法
let queryUpdate = async (tableName, data, id, callback) => {
  try {
    let sql = `UPDATE ${tableName} SET ${Object.keys(data).map(key => `${key} = ?`).join(',')} WHERE id = ?`;
    pool.query(sql, [...Object.values(data), id], (err, result) => {
      if (err) {
        callback({
          code: 400,
          message: err.message,
          data: result
        });
      } else {
        callback({
          code: 200,
          message: '更新成功',
          data: result
        });
      }
    });
  } catch (err) {
    callback(null);
  }
};
// 封装数据删除方法
let queryDelete = async (tableName, id, callback) => {
  try {
    let where = ''
    if (Array.isArray(id)) {
      where = `WHERE id IN (${id.map(() => '?').join(',')})`
    } else {
      where = `WHERE id = ?`
    }
    let sql = `DELETE FROM ${tableName} ${where}`;
    const idArr = Array.isArray(id)? id : [id]
    pool.query(sql, idArr, (err, result) => {
      if (err) {
        callback({
          code: 400,
          message: err.message,
          data: result
        });
      } else {
        callback({
          code: 200,
          message: '删除成功',
          data: result
        });
      }
    });
  } catch (err) {
    callback(null);
  }
};

// 封装数据查询方法
let queryFind = async (tableName, id, callback) => {
  try {
    let where = ''
    if (Array.isArray(id)) {
      where = `WHERE id IN (${id.map(() => '?').join(',')})`
    } else {
      where = `WHERE id = ?`
    }
    let sql = `SELECT * FROM ${tableName} ${where}`;
    const idArr = Array.isArray(id)? id : [id]
    pool.query(sql, idArr, (err, result) => {
      if (err) {
        callback({
          code: 400,
          message: err.message,
          data: result
        });
      } else {
        callback({
          code: 200,
          message: '查询成功',
          data: result[0] || {}
        });
      }
    });
  } catch (err) {
    callback(null);
  }
};
// 统一的接口输出
const sqlExport = (res, result) => {
  if (!result){
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
    })
  } else res.status(result.code).json(result);
}
// 导出连接池和query方法
module.exports = pool;
module.exports.queryAction = queryAction;
module.exports.queryPage = queryPage;
module.exports.queryAdd = queryAdd;
module.exports.queryUpdate = queryUpdate;
module.exports.queryDelete = queryDelete;
module.exports.sqlExport = sqlExport;
module.exports.queryFind = queryFind;