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




/*
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

//http://shiya.io/simple-file-upload-with-express-js-and-formidable-in-node-js/
app.post('/', function (req, res){
  var form = new formidable.IncomingForm();
  console.log("step2");
  form.parse(req);
  console.log("step2a " +String(req));
  
  form.on('fileBegin', function (name, file){
      file.path = __dirname + '/uploads/' + file.name;
      console.log("step3 " +__dirname + '/uploads/' + file.name);  
  });

  form.on('file', function (name, file){
      console.log('Uploaded ' + file.name);
      console.log("step4");
  });

  //res.sendFile(__dirname + '/views/index.hbs');
  //console.log("step5 "+__dirname + '/views/index.hbs');  

  res.redirect(req.get('referer'));
});

/*
//https://coligo.io/building-ajax-file-uploader-with-node/ 
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/upload', function(req, res){
  
    // create an incoming form object
    var form = new formidable.IncomingForm();
  
    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;
  
    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '/uploads');
  
    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function(field, file) {
      fs.rename(file.path, path.join(form.uploadDir, file.name));
    });
  
    // log any errors that occur
    form.on('error', function(err) {
      console.log('An error has occured: \n' + err);
    });
  
    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
      res.end('success');
    });
  
    // parse the incoming request containing the form data
    form.parse(req);
  
  });

*/



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
