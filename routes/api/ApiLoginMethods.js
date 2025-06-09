const db = require("../../db/sql");
const randomVerifyCode = require('../../utils/randomCode');
const {sendEmailFun} = require('../../utils/nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


// 邮箱验证信息
let mailVerifyCode = {};

// 发送邮箱验证码
exports.sendMailCode = async function (req, res) {
    const { type, email } = req.body;
    if (!email) {
        res.send({ success: false, code: 400, msg: "参数不能为空" });
        return;
    }
    const temps = [ {
        name: '注册验证', temp: "register"
    }, {
        name: '重置密码', temp: "forgetPassword"
    }]
    // 生成 6 位随机验证码
    const verifyCode = randomVerifyCode.randomCode(6);
    // 发送邮箱
    sendEmailFun({
        temp: temps[type].temp,
        email: req.body.email,
        title: temps[type].name,
        info: {
            code: verifyCode
        },
        callback: (err) => {
            if (!err) {
                res.send({ success: false, code: 400, msg: "验证码发送失败" });
            } else {
                // 保存验证码信息，用于后续验证
                mailVerifyCode[req.body.email] = verifyCode;
                res.send({ success: true, code: 200, msg: "验证码已发送" });
            }
        }
    })
}
// 登录
exports.login = async function (req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        res.send({ success: false, code: 400, msg: "用户名和密码不能为空" });
        return;
    }
    // 定义 SQL 语句
	const sql = `SELECT * FROM sys_user WHERE username = '${username}'`
	// 执行 SQL 语句，根据用户名查询用户的信息
	db.queryAction(sql,'', (resu) => {
        const result = resu?.code ? resu.data : resu;
		// 执行 SQL 语句失败
		if (!result) return res.send({ success: false, code: 500, msg: "用户名错误" });
		// 用户不存在
		if (result.length === 0) return res.send({ success: false, code: 400, msg: "用户名不存在" });
        // 验证密码
		const comRes = bcrypt.compareSync(password, result[0].password)
        if (!comRes) return res.send({ success: false, code: 400, msg: "用户名或密码错误" });

        // 在服务器端生成token字符串
        const user = {
            ...result[0], // 解构用户信息
            password: '' // 密码不返回给客户端
        }
        // 对用户的信息进行加密，生成 token 字符串 
		const tokenStr = jwt.sign(user, process.env.JWD_KEY, {
			expiresIn: process.env.JWD_TIME //tonken 有效期
		})
        res.send({ success: true, code: 200, msg: "登录成功", data: {token: tokenStr, user} });
	})
}
// 注册
exports.register = async function (req, res) {
    const { email, password, verifyCode, username } = req.body;
    let msg = ""
    if (!username) msg = "用户名不能为空"
    if (!email) msg = "邮箱不能为空"
    if (!password) msg = "密码不能为空"
    if (!verifyCode) msg = "验证码不能为空"
    if (msg) {
        res.send({ success: false, code: 400, msg });
        return;
    }
    // 定义 SQL 语句
	const sql = `SELECT * FROM sys_user WHERE username = '${username}' OR email = '${email}'`
    if (mailVerifyCode[email] === verifyCode) {
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
            // 创建用户
            db.queryAdd('sys_user', { username, email, password: bcrypt.hashSync(password) }, (result) => {
                db.sqlExport(res, result)
            });
        })
    } else {
        res.send({ success: false, code: 400, msg: "验证码错误" });
    }
}
// 忘记密码
exports.forgetPassword = async function (req, res) {
    const { email, verifyCode, newPassword } = req.body;
    if (mailVerifyCode[email] === verifyCode) {
        // 定义 SQL 语句
        const sql = `SELECT * FROM sys_user WHERE email = '${email}'`
        const password = bcrypt.hashSync(newPassword)
        db.queryAction(sql,'', (resu) => {
            const result = resu?.code ? resu.data : resu;
            if (!result?.length) {
                return res.send({ success: false, code: 400, msg: "邮箱未注册!" });
            }
            const sql1 = `UPDATE sys_user SET password = ? WHERE email = ?`;
            db.query(sql1,[password, email], (err, result) => {
                if (err) {
                  res.status(500).json({
                    message: "服务器错误",
                  });
                } else {
                  res.status(200).json({
                    message: "修改成功",
                    data: result,
                  });
                }
            })
        })

    } else {
        res.send({ success: false, code: 400, msg: "验证码错误" });
    }
}

