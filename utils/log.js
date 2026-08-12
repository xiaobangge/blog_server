const { create } = require("handlebars");
const db = require("../db/sql");
const moment = require("moment");

/*
 * 日志记录
 * @param {Object} data 日志数据
 * @param {String} data.type 日志类型
 *  -- 1.友联 2.文章评论 3.留言板 4.碎碎念评论、 5.文章阅读、 6.碎碎念点赞、 9、访客来访
 */
const addLog = async (data) => {
    console.log(data, "日志数据");
  switch (data.type) {
    case 5: // 文章阅读日志
      addFkLog(data, "articleId");
      break;
    case 9: // 访客来访
      addFkLog(data, "ip");
      break;
    default: //默认项目的评论回复日志
      addCommentLog(data);
      break;
  }
};
const addCommentLog = (data) => {
    const table = data.type == 4? "sys_dynamics" : data.type == 2? "sys_article" : "";
    if (!data?.bhf && data?.uid && table) {
        const sql = `SELECT * from ${table} WHERE id='${data?.uid}'`
        db.queryAction(sql, '', (result) => {
            console.log(result, '查询结果');
            var content = result[0]?.content || "";
            content = content.toString();
            var num = data.type == 2 ? 20 : 10
            if (content && data.type == 2) {
                content = result[0]?.title || "";
                content = content.substring(0, num);
                content = `《${content}》`;
            } else if (content && data.type == 4) {
                content = content.substring(0, num);
                content = `闲言碎语【${content}...】`;
            }
            var row = {
              avatarUrl: data?.avatar || null,
              articleId: data?.type == 2 ? data.uid : null,
              matter: data?.content || null,
              name: data?.nickname || null,
              sourceName: content || null,
              create_at: moment().format("YYYY-MM-DD HH:mm:ss"),
              type: data.type,
              bhfName: data?.bhf ? data?.bhf.nickname : null,
              bhfAvatar: data?.bhf ? data?.bhf.avatar : null,
            };
            addFkLog(row);
        })
    } else {
        var row = {
          avatarUrl: data?.avatar || null,
          articleId: data?.type == 2 ? data.uid : null,
          matter: data?.content || null,
          name: data?.nickname || null,
          sourceName: null,
          create_at: moment().format("YYYY-MM-DD HH:mm:ss"),
          type: data.type,
          bhfName: data?.bhf ? data?.bhf.nickname : null,
          bhfAvatar: data?.bhf ? data?.bhf.avatar : null,
        };
        addFkLog(row);
    }
}
// 访客来访日志
const addFkLog = (data, key) => {
  function next(rows) {
    if (rows?.length > 0) {
      let create_at = moment().format("YYYY-MM-DD HH:mm:ss");
      sqlAction({ create_at }, rows[0].id);
    } else {
      let create_at = moment().format("YYYY-MM-DD HH:mm:ss");
      sqlAction({ ...data, create_at });
    }
  }
  if (!data[key]) {
    next([])
    return;
  }
  const sql = `SELECT * FROM sys_log WHERE ${key} = '${data[key]}'`;
  db.query(sql, (err, rows) => {
    if (err) {
      return;
    }
    next(rows);
  });
};

// 统一的数据库操作方法
const sqlAction = (data, id) => {
  if (id) {
    db.queryUpdate("sys_log", data, id, (result) => {
      console.log(result);
    });
  } else {
    db.queryAdd("sys_log", data, (result) => {
      console.log(result);
    });
  }
};

exports.addLog = addLog;
