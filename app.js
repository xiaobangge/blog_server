let createError = require("http-errors");
let express = require("express");
let path = require("path");
let cookieParser = require("cookie-parser");
let logger = require("morgan");
const cors = require("cors");
const jwt = require('jsonwebtoken');
require('dotenv').config();
let indexRouter = require("./routes/index");
//token解析中间件 一定要在路由之前配置解析 Token 的中间件
const expressJWT = require("express-jwt");
let app = express();
require("./utils/swaggerUI")(app);
app.use(cors());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use("/file", express.static(path.join(__dirname, "public")));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// 白名单
const whiteList = ['/user/register', '/user/login', '/user/forgetPassword', '/user/sendMailCode']
// 中间件函数来解析token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const NeedToken = req.headers['needtoken']
  if (!NeedToken || whiteList.includes(req.url)) next();
  else {
    console.log(req.url)
    const token = authHeader && authHeader.split(' ')[1]; // 从 "Bearer token" 中提取token
    if (token == null) return res.status(200).json({ code: 401, message: "没有token" }); // 没有token，返回401
    jwt.verify(token, process.env.JWD_KEY, (err, user) => {
      if (err) return res.status(200).json({ code: 401, message: "token无效" }); // token无效，返回403
      req.user = user; // 将用户信息附加到请求对象上
      next(); // 继续执行后续的路由处理函数
    });
  }
}
app.use("/api/", authenticateToken, indexRouter);
// for (const route of indexRouter) {
//   app.use(route.path, require(route.component));
// }

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(500).send({
    code: 500,
    message: err.message,
  });
});

module.exports = app;
