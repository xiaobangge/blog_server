
const multer = require('multer');
// 设置存储配置
const storageFun = (path) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `public/${path}/`) // 指定上传文件的目录
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.').pop()) // 为上传文件定义文件名
    }
  });
   
  return multer({ storage: storage });
}

module.exports = storageFun;