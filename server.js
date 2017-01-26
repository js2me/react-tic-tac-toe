var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var config = require('./webpack.config');

var cors = require('cors');
var app = new (require('express'))();
var port = 3000;

var compiler = webpack(config);

// app.use(function (req, res, next) {
//   // CORS headers
//   res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // restrict it to the required domain
//   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
//   // Set custom headers for CORS
//   res.header("Access-Control-Allow-Headers", "Content-type,Accept,X-Custom-Header");
//
//   if (req.method === "OPTIONS") {
//     return res.status(200).end();
//   }
//
//   return next();
// });
// var whitelist = [
//   'http://0.0.0.0:3000',
//     'http://localhost:3000',
//     'http://606ep.ru:8080'
// ];
// var corsOptions = {
//   origin: function(origin, callback){
//     var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
//     callback(null, originIsWhitelisted);
//   },
//   credentials: true
// };
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});
app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
app.use(webpackHotMiddleware(compiler));

app.get("/", function(req, res) {
  res.sendFile(__dirname + '/index.html')
});
app.listen(port, function(error) {
  if (error) {
    console.error(error)
  } else {
    console.info("==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.", port, port)
    app.get("http://606ep.ru:8080",function(reg,res){
      console.log(req,res);
    });
  }
});
