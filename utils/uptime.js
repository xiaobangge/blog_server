
const db = require("../db/sql");
const address = require('address');
const geoip = require('geoip-lite');
// 记录第一次启动时间
function getUptime() {
  const sql = "SELECT uptime FROM sys_config";
  db.query(sql, (err, result) => {
    if (err) return
    if (result.length === 0) {
        const startTime = new Date();
        const sql1 = "INSERT INTO sys_config (uptime) VALUES (?)";
        db.query(sql1, [startTime], (err, result) => {
            console.log(result);
        });
    }
  });
  console.log(address.ip())
  const ip = '113.66.181.12';
  const geo = geoip.lookup(ip);
  console.log(geo);
}

module.exports = getUptime;