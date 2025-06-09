const {PureHttp} = require("./axios")
const http = new PureHttp("https://m.163.com")
const crawlerRequest = require('./crawler-request');


// 根据类型获取视频数据
function getVideoData(type) {
    return new Promise((resolve, reject) => {
        http.axiosInstance.get(`/touch/nc/api/video/recommend/${type}/1-20.do?callback=videoList`).then(request => {
            let result = JSON.parse(request.data.match(/\[.*?\]/g));
            console.log(request.data, 2222)
            console.log(result, 1111)
            const res = result.map(item => {
                return {
                  title: item.title,
                  cover: item.cover,
                  vid: item.vid,
                  ptime: item.ptime,
                  topicName: item.topicName,
                  replyid: item.replyid,
                  topicSid: item.topicSid
                };
            })
            resolve(res)
        }).catch(error => {
            reject(error)
        })
    })
}

// 根据视频id获取视频详情
function getVideoDetail(vid) {
    return new Promise((resolve, reject) => {
        const url = `https://m.163.com/v/video/${vid}.html?offset=46&ver=c`;
        crawlerRequest({ url })
          .then($ => {
            const detail = {
              title: $('title').text(),
              cover: $('.main_video').attr('poster'),
              mp4: $('.main_video').attr('data-mp4'),
              m3u8: $('.main_video').attr('data-m3u8'),
              author: $('.video_info .detail .source').text(),
              time: $('.video_info .detail .time').text()
            };
            resolve(detail);
          })
          .catch(err => {
            console.log(err, 222);
            reject(err);
          });
    })
}

module.exports = {
    getVideoData,
    getVideoDetail
}