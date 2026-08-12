
const {PureHttp} = require("./axios")
const http = new PureHttp("http://m.kugou.com")
// 获取音乐新歌榜
const musicTypeList = [
    {type: 'new', url: '/'},
    {type: 'hot', url: '/rank/list'},
    {type: 'playlist', url: '/plist/index'},
    {type: 'singer', url: '/singer/class'}
]

// 根据类型获取数据
function getMusicData(type) {
    const url = musicTypeList.find(item => item.type === type).url
      // return res.send(http)
  console.log('this is', type, url);
    return new Promise((resolve, reject) => {
        http.axiosInstance.get(url + '?json=true').then(request => {
            resolve(request.data)
        }).catch(error => {
            reject(error)
        })
    })
}

// 获取歌单列表
function getPlaylistList(id) {
    const url = `/rank/info?rankid=${id}&page=1&json=true`
    return new Promise((resolve, reject) => {
        http.axiosInstance.get(url + '?json=true').then(request => {
            resolve(request.data)
        }).catch(error => {
            reject(error)
        })
    })
}

module.exports = {
    getMusicData,
    getPlaylistList
}