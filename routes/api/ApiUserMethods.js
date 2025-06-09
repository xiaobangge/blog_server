const db = require("../../db/sql");
const geoip = require("geoip-lite");
const path = require("path");
const fs = require("fs");
const moment = require("moment");
const bcrypt = require('bcryptjs');
const jsTimeBy24 = (result) => {
  // 检查输入结果是否为空或不存在长度属性
  if (!result?.length) return false;
  // 将结果数组中的每个时间转换为 Date 对象并获取时间戳
  const times = result.map((item) => new Date(item.create_at).getTime());
  // 找到时间戳数组中的最大值
  const maxTime = Math.max(...times);
  // 获取当前时间的时间戳
  const newTime = new Date().getTime();
  // 计算当前时间与最大时间的时间差（以毫秒为单位）
  const diffTime = newTime - maxTime;
  // 判断时间差是否小于一天（24小时 * 3600秒 * 1000毫秒）
  const diffDays = diffTime / (24 * 3600 * 1000) < 1;
  // 返回布尔值，表示时间差是否小于一天
  return diffDays;
};

exports.intoVisitor = async (req, res) => {
  // console.log(req.body)
  const { ip, location, browser } = req.body;
  const sql1 = `SELECT * FROM sys_visitor WHERE ip = '${ip}'`;
  const ipInfo = geoip.lookup(ip);
  db.query(sql1, (err, result) => {
    const maxTime = jsTimeBy24(result);
    if (!maxTime) {
      const data = {
        ip,
        address: location,
        system: browser,
        latitude: ipInfo?.ll[0] || "",
        longitude: ipInfo?.ll[1] || "",
      };
      db.queryAdd("sys_visitor", data, () => {});
    }
  });
}
// 获取用户信息
exports.getUserInfo = async (req, res) => {
  const sql = "SELECT * FROM sys_user WHERE username='Sean'";
  db.query(sql, (err, result) => {
    console.log(err)
    if (err) {
      res.status(500).json({
        code: 500,
        message: "服务器错误",
      });
    } else {
      const data = result?.length > 0 ? {...result[0], password: ''} : null;
      res.status(200).json({
        code: 200,
        message: "获取用户信息成功",
        data: data
      });
    }
  });
};

// 获取statistics信息
exports.getStatistics = async (req, res) => {
  const sql = `
  SELECT COUNT(*) as total FROM sys_article
  UNION ALL
  SELECT COUNT(*) as total1 FROM sys_visitor`;

  try {
    db.query(sql, (err, result) => {
      console.log(result);
      if (err) {
        res.status(500).json({
          code: 500,
          message: "服务器错误",
        });
      } else {
        res.status(200).json({
          code: 200,
          message: "获取统计信息成功",
          data: {
            articleCount: result[0].total,
            visitorCount: result[1].total,
          },
        });
      }
    });
  } catch (err) {
    throw err; // 抛出错误
  }
};

exports.getAvatar = (req, res) => {
  const imagesDir = path.join(__dirname, "../../public/avatar"); // 图片文件夹路径
  console.log("图片文件夹:", imagesDir);
  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      console.error("读取图片目录失败:", err);
      return res.status(500).send("服务器内部错误");
    }
    const imagesList = files.map((file) => `/file/avatar/${file}`); // 假设图片通过http服务提供
    res.status(200).json({
      code: 200,
      message: "获取头像成功",
      data: imagesList,
    });
  });
};
exports.getExpression = (req, res) => {
  const imagesDir = path.join(__dirname, "../../public/expression"); // 图片文件夹路径
  console.log("图片文件夹:", imagesDir);
  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      console.error("读取图片目录失败:", err);
      return res.status(500).send("服务器内部错误");
    }
    const imagesList = files.map((file) => `/file/expression/${file}`); // 假设图片通过http服务提供
    const pngFiles = imagesList.filter((file) => file.includes("hl"));
    const gifFiles = imagesList.filter((file) => file.includes("tl"));
    res.status(200).json({
      code: 200,
      message: "获取表情成功",
      data: {
        hl: pngFiles,
        tl: gifFiles,
      },
    });
  });
};

// 统计今日访客数量、昨日访客数量、本月访客数量、总访客数量
exports.getVisitorCount = async (req, res) => {
  const today = moment().format("YYYY-MM-DD");
  const yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");
  const thisMonth = moment().format("YYYY-MM");
  const sql = `
  SELECT COUNT(*) as todayCount FROM sys_visitor WHERE create_at LIKE '${today}%'
  UNION ALL
  SELECT COUNT(*) as yesterdayCount FROM sys_visitor WHERE create_at LIKE '${yesterday}%'
  UNION ALL
  SELECT COUNT(*) as thisMonthCount FROM sys_visitor WHERE create_at LIKE '${thisMonth}%'
  UNION ALL
  SELECT COUNT(*) as totalCount FROM sys_visitor`;

  try {
    db.query(sql, (err, result) => {
      console.log(err)
      if (err) {
        res.status(500).json({
          code: 500,
          message: "服务器错误",
        });
      } else {
        res.status(200).json({
          code: 200,
          message: "获取访客统计信息成功",
          data: {
            todayCount: result[0].todayCount,
            yesterdayCount: result[1].todayCount,
            thisMonthCount: result[2].todayCount,
            totalCount: result[3].todayCount,
          },
        });
      }
    });
  } catch (err) {
    throw err; // 抛出错误
  }
};

// 将数据重组
function setResult(data) {
  return data?.map((item) => {
    return {
      name: item.address,
      value: [item.longitude, item.latitude]
    }
  }) || []
}
// 查出全部访客的address、latitude、longitude
exports.getVisitorAddress = async (req, res) => {
  const sql = "SELECT address, latitude, longitude FROM sys_visitor";
  try {
    db.query(sql, (err, result) => {
      if (err) {
        res.status(500).json({
          code: 500,
          message: "服务器错误",
        });
      } else {
        res.status(200).json({
          code: 200,
          message: "获取访客地址信息成功",
          data: setResult(result),
        });
      }
    });
  } catch (err) {
    throw err; // 抛出错误
  }
};

// 获取用户列表
exports.getUserList = async (req, res) => {
  const { page, page_size, start_time, end_time, state, username } = req.body;
  try {
    let where = ''
    if (start_time && end_time) {
      where = `WHERE create_at BETWEEN '${start_time}' AND '${end_time}'`
    }
    if (state) {
      where += ` AND state = ${state}`
    }
    if (username) {
      where += ` AND username LIKE '%${username}%'`
    }
    db.queryPage('sys_user', page, page_size, where, (result) => {
      const data = {
        total: result.total,
        list: result.data.list?.map((item) => ({...item, password: ''}))
      }
      res.status(result.code).json({...result, data})
    });
  } catch (err) {
    throw err; // 抛出错误
  }
};

// 添加用户
exports.addUser = async (req, res) => {
  const { password, username, email, avatar, state } = req.body;
    let msg = ''
    if (!username) msg = '用户名不能为空';
    if (!password) msg = '密码不能为空';
    if (!email) msg = '邮箱不能为空';
    if (msg) {
      return res.status(400).json({
        code: 400,
        message: msg
      })
    }
  try {
      // 定义 SQL 语句
    const sql = `SELECT * FROM sys_user WHERE username = '${username}' OR email = '${email}'`
          // 执行 SQL 语句，根据用户名查询用户的信息
    db.queryAction(sql,'', (resu) => {
        const result = resu?.code ? resu.data : resu;
        if (result?.length) {
            if (result[0].username === username) {
                msg = "用户名已存在"
            } else {
                msg = "邮箱已存在"
            }
            return res.send({ success: false, code: 400, msg });
        }
        db.queryAdd("sys_user", { password:bcrypt.hashSync(password), username, email, avatar, state }, (result) => {
          db.sqlExport(res, result)
        });
    })
  } catch (err) {
    throw err; // 抛出错误
  }
};

// 更新用户
exports.updateUser = async (req, res) => {
  const { id, username, email, avatar, type, state } = req.body;

  let row = {}
  if (type === 'state') {
    row.state = state
  } else {
    let msg = ''
    if (!username) msg = '用户名不能为空';
    if (!email) msg = '邮箱不能为空';
    if (msg) {
      return res.status(400).json({
        code: 400,
        message: msg
      })
    }
    row = { username, email, avatar, state }
  }
  try {
    db.queryUpdate("sys_user", row, id, (result) => {
      res.status(result.code).json(result)
    });
  } catch (err) {
    throw err; // 抛出错误
  }
};

// 删除用户
exports.deleteUser = async (req, res) => {
  const { ids } = req.body;
  try {
    db.queryDelete("sys_user", ids, (result) => {
      res.status(result.code).json(result)
    });
  } catch (err) {
    throw err; // 抛出错误
  }
};

// 重置密码
exports.resetPassword = async (req, res) => {
  const { id, password, newPassword } = req.body;
  try {
    // 定义 SQL 语句
  const sql = `SELECT * FROM sys_user WHERE id = '${id}'`
        // 执行 SQL 语句，根据用户名查询用户的信息
  db.queryAction(sql,'', (resu) => {
      const result = resu?.code ? resu.data : resu;
      if (!result?.length) {
          return res.send({ success: false, code: 400, msg: '用户不存在' });
      }
          // 验证密码
      const comRes = bcrypt.compareSync(password, result[0].password)
      if (!comRes) return res.send({ success: false, code: 400, msg: "用户密码错误" });
      db.queryUpdate("sys_user", { password:bcrypt.hashSync(newPassword) }, id, (result) => {
        db.sqlExport(res, result)
      });
  })
  } catch (err) {
    throw err; // 抛出错误
  }
};