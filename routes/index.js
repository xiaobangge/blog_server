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
const ApiLogin = require("./api/ApiLoginMethods");
const ApiMenu = require("./api/ApiMenuMethods");
const ApiMusic = require("./api/ApiMusicMethods");
const ApiFind = require("./api/ApiFindMethods");
const ApiVideo = require("./api/ApiVideoMethods");

// 获取用户信息
router.post('/user/info', ApiUser.getUserInfo);
router.post('/user/visitor', ApiUser.intoVisitor);

// 发送邮箱验证码
router.post('/user/sendMailCode', ApiLogin.sendMailCode);

// 登录
router.post('/user/login', ApiLogin.login);

// 注册
router.post('/user/register', ApiLogin.register);

// 忘记密码
router.post('/user/forgetPassword', ApiLogin.forgetPassword);

// 获取用户列表
router.post('/user/list', ApiUser.getUserList);

// 新增用户
router.post('/user/create', ApiUser.addUser);

// 编辑用户
router.post('/user/update', ApiUser.updateUser);

// 删除用户
router.post('/user/delete', ApiUser.deleteUser);
// 重置密码
router.post('/user/reset_password', ApiUser.resetPassword);

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
router.post('/article/update', ApiArticle.editArticle);
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
// 编辑动态
router.post('/moments/update', ApiDynamics.editDynamics);
// 删除动态
router.post('/moments/delete', ApiDynamics.deleteDynamics);
// 动态详情
router.get('/moments/detail/:id', ApiDynamics.getDynamicsDetail);

// 评论列表
router.post('/comment/list', ApiMomentsMethods.getMoments);
// 评论添加
router.post('/comment/add', ApiMomentsMethods.addMoments);
// 评论删除
router.post('/comment/delete/:id', ApiMomentsMethods.deleteMoments);

// 树洞列表
router.post('/treehole/list', ApiTreeHole.getTreeList);
// 新增树洞
router.post('/treehole/add', ApiTreeHole.addTreeHole);

// 友情链接列表
router.post('/link/list', ApiLink.getLinkList);
// 添加链接
router.post('/link/add', ApiLink.addLink);
// 编辑链接
router.post('/link/update', ApiLink.updateLink);
// 删除链接
router.post('/link/delete', ApiLink.deleteLink);

// 发现类型列表
router.post('/find/type', ApiFind.getFindTypeList);
// 添加发现列表
router.post('/find/type/add', ApiFind.addFindType);
// 编辑发现列表
router.post('/find/type/update', ApiFind.updateFindType);
// 删除发现列表
router.post('/find/type/delete', ApiFind.deleteFindType);
// 发现列表
router.post('/find/list', ApiFind.getFindList);
// 添加发现
router.post('/find/add', ApiFind.addFind);
// 编辑发现
router.post('/find/update', ApiFind.updateFind);
// 删除发现
router.post('/find/delete', ApiFind.deleteFind);

// 项目列表
router.post('/project/list', ApiProject.getProjectList);
// 新增项目
router.post('/project/add', ApiProject.addProject);
// 更新项目
router.post('/project/update', ApiProject.updateProject);
// 删除项目
router.post('/project/delete', ApiProject.deleteProject);

// 菜单列表
router.post('/menu/list', ApiMenu.getMenuList);
// 菜单创建
router.post('/menu/create', ApiMenu.createMenu);
// 菜单编辑
router.post('/menu/update', ApiMenu.updateMenu);
// 菜单删除
router.post('/menu/delete', ApiMenu.deleteMenu);

router.post('/video/list/:type', ApiVideo.getVideoTypeList)
router.post('/video/get/:vid', ApiVideo.getVideoDetail)

router.post('/music/type/:type', ApiMusic.getMusicTypeList)
router.get('/music/list/:id', ApiMusic.getMusicList)
router.post('/music/get', ApiMusic.getMusicInfo)
module.exports = router;
