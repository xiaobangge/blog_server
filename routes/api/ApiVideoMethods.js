
const musicApi = require("../../utils/Video")

// 获取友联列表
exports.getVideoTypeList = (req, res) => {
  const { type } = req.params;
  musicApi.getVideoData(type).then(data => {
    res.json({
      code: 200,
      data: data
    });
  }).catch(err => {
    console.log(err);
    res.json({
      code: 500,
      message: "获取失败"
    });
  });
};

exports.getVideoDetail = (req, res) => {
  const { vid } = req.params;
  musicApi.getVideoDetail(vid).then(data => {
    res.json({
      code: 200,
      data: data
    });
  }).catch(err => {
    console.log(err);
    res.json({
      code: 500,
      message: "获取失败"
    });
  });
};