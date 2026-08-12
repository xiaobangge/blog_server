const musicApi = require("../../utils/Music")
const fetch = require("node-fetch");
const { Blob } = require('buffer');

// 获取友联列表
exports.getMusicTypeList = (req, res) => {
  const { type } = req.params;
  musicApi.getMusicData(type).then(data => {
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

// 获取歌单列表
exports.getMusicList = (req, res) => {
  const {id} = req.params;
  console.log(id, 'id,id')
  musicApi.getPlaylistList(id).then(data => {
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

exports.getMusicInfo = async (req, res) => {
  const {url} = req.body
  try {
    const response = await fetch(url);
    const buffer = await response.buffer();
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length
    });
    res.send(buffer);
  } catch (err) {
    res.status(500).send('转换失败');
  }
}