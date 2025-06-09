const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const path = require("path");
const fs = require("fs");

/***
 * 发送邮件
 * to: 收件人邮箱
 * subject: 邮件主题
 * template: 邮件模板
 */
const sendEmail = async (to, subject, template) => {
  const transporter = nodemailer.createTransport({
    service: 'qq',
    secure: true,
    auth: {
      user: process.env.EMAIL_FORM,
      pass: process.env.EMAIL_KEY
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FORM,
    to,
    subject,
    html: template
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.log('Error sending email: %s', error);
    return false;
  }
};

/**
 * 
 * @param {*} data 
 * @param {*} temp -- 模板名称
 * @param {*} email -- 收件人邮箱
 * @param {*} title -- 邮件主题
 * @param {*} info -- 邮件内容
 * @param {*} callback -- 回调函数
 * `../emailTemp/${temp}.hbs` -- 模板路径 例如：../emailTemp/register.hbs
 */
const sendEmailFun = (data) => {
  const { temp, email, title, info, callback } = data;
  const source = fs.readFileSync(path.join(__dirname, `../emailTemp/${temp}.hbs`), 'utf-8').toString();
  const template = handlebars.compile(source);
  const htmlToSend = template(info); // 替换模板中的变量
  sendEmail(email, title, htmlToSend).then(() => {
    console.log('发送成功')
    callback?.(true)
  }).catch(() => {
    console.log('发送失败')
    callback?.(false)
  })
}
module.exports = {
    sendEmailFun
};