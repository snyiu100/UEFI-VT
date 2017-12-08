var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var fs = require('fs');
var formidable = require('formidable');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

/* Read/Delete File
  //https://stackoverflow.com/questions/27950066/how-to-upload-a-file-and-then-display-its-contents-in-node-js-express-app
  var tempPath = 'C:/Users/User/Desktop/UEFI-VT/UEFI-VT/public/vendor/tmp/test.txt';
  console.log(tempPath);

  fs.readFile(tempPath, function(err,data){
    if (err) throw err;
    //data will contain file content
    console.log("data is: "+data);

    //delete file
    fs.unlink(tempPath,function(err){
      if (err) throw err;
      console.log('successfully deleted ' +tempPath);
    });
  });
*/

var filePath = "";
var fileName = "";

//http://shiya.io/simple-file-upload-with-express-js-and-formidable-in-node-js/
//https://coligo.io/building-ajax-file-uploader-with-node/ 
app.post('/upload', function (req, res){
  var form = new formidable.IncomingForm();
  console.log("step2");
  form.parse(req);
  
  form.on('fileBegin', function (name, file){
    fileName = file.name;
    file.path = __dirname + '/public/uploads/' + fileName;
    filePath = String((file.path).replace(/\\/g, "/"));
    console.log("step3 " +filePath);
  });

  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  form.on('file', function (name, file){
    console.log('Uploaded ' + fileName);
    console.log("step4");

    fs.readFile(filePath, function(err,data){
      console.log("enter readFile");
      if (err) 
        throw err;
      //data will contain file content
      console.log("data is: "+data);
    }); 
  });

  form.on('end', function() {
    res.end('success');
    console.log("form end");
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
