var express = require('express');
var router = express.Router();
const ApiImgUpload = require("./api/ApiImageUpload");
const upload = require("../utils/multer");

const ApiArticle = require("./api/ApiArticleMethods");
const ApiMomentsMethods = require("./api/ApiMomentsMethods");
const ApiDynamics = require("./api/ApiDynamicsMethods");
const ApiUser = require("./api/ApiUserMethods");
const ApiTreeHole = require("./api/ApiTreeHoleMethods");
const ApiLink = require("./api/ApiLinkMethods");
const ApiProject = require("./api/ApiProjectMethods");

// 获取用户信息
router.post('/user/info', ApiUser.getUserInfo);

// 获取访客统计信息
router.get('/visitor/count', ApiUser.getVisitorCount);
// 获取访客地理位置
router.get('/visitor/address', ApiUser.getVisitorAddress);
// 获取统计信息
router.get('/statistics', ApiUser.getStatistics);
// 获取头像挂件
router.get('/avatar', ApiUser.getAvatar)
// 获取表情包
router.get('/expression', ApiUser.getExpression)
/* GET home page. */
router.get('/', function(req, res, next) {
  const uptimeInSeconds = process.uptime();
    const uptimeInDays = uptimeInSeconds;
    res.send(`Server is up for ${uptimeInDays.toFixed(2)} days.`)
});

/* GET home page. */
router.get('/add', function(req, res, next) {
  res.render('add', { title: 'Express' });
});

// 图片上传
const imgUpload = upload('images')
router.post('/upload/image',imgUpload.single('file'),  ApiImgUpload.uploadImage);
// 视频上传
const videoUpload = upload('video')
router.post('/upload/video',videoUpload.single('file'),  ApiImgUpload.uploadVideo);

// 文章分类列表
router.get('/article/type/list', ApiArticle.getArticleTypeList);
// 文章列表
router.post('/article/list', ApiArticle.getArticleList);
// 文章详情
router.get('/article/detail/:id', ApiArticle.getArticleDetail);
// 新增文章
router.post('/article/add', ApiArticle.addArticle);
// 编辑文章
router.post('/article/edit', ApiArticle.editArticle);
// 删除文章
router.post('/article/delete', ApiArticle.deleteArticle);
// 按年份获取文章数量
router.get('/article/year', ApiArticle.getArticleCountByYear);
// 根据年份获取文章列表
router.get('/article/list/:year', ApiArticle.getArticleListByYear);

// 新增动态
router.post('/moments/add', ApiDynamics.addDynamics);

// 动态列表
router.post('/moments/list', ApiDynamics.getDynamics);

// 评论列表
router.post('/comment/list', ApiMomentsMethods.getMoments);
// 评论添加
router.post('/comment/add', ApiMomentsMethods.addMoments);

// 树洞列表
router.post('/treehole/list', ApiTreeHole.getTreeList);
// 新增树洞
router.post('/treehole/add', ApiTreeHole.addTreeHole);

// 友情链接列表
router.post('/link/list', ApiLink.getLinkList);
// 添加链接
router.post('/link/add', ApiLink.addLink);

// 项目列表
router.post('/project/list', ApiProject.getProjectList);
// 新增项目
router.post('/project/add', ApiProject.addProject);


module.exports = router;
