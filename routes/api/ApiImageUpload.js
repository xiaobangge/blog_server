
const db = require("../../db/sql");
const path = require("path");
const fs = require("fs");
// 图片上传路由
exports.uploadImage = (req, res) => {
  console.log(req.file); // 打印上传的文件信息
  res.send({
    code: 200,
    msg: "上传成功",
    data: {
      url: req.file.filename,
    },
  });
};
// 视频上传
exports.uploadVideo = (req, res) => {
  console.log(req.file); // 打印上传的文件信息
  res.send({
    code: 200,
    msg: "上传成功",
    data: {
      url: req.file.filename,
    },
  });
};