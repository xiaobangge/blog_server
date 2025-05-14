const app = require('express')();
app.get('/', function (req, res) {
  res.render('index.html', {
    title: '欢迎使用'
  });
});

module.exports = app;
