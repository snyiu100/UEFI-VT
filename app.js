var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var fs = require('fs');
var formidable = require('formidable');
var mysql = require('mysql');
var cmd = require('node-cmd');
var PythonShell = require('python-shell');

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
  DB START
*/
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'p@ssw0rd',
  database : 'uefivt',
  port     : 3306
});

connection.connect(function(err) {
  if (err) {
    console.error(' ** error connecting to database: ' + err.stack +' **');
    return;
  }

  console.log(' ** database connected as id ' + connection.threadId +' **');
});

/*
  FILE UPLOAD
*/
var filePath = "";
var fileName = "";
var fileData ;
var fileProgress;

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
    uploadToDatabase();
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
      fileData = data;
    }); 
  });

  form.on('progress', function (bytesReceived, bytesExpected) {
    var progress = {
        type: 'progress',
        bytesReceived: bytesReceived,
        bytesExpected: bytesExpected
    };
    console.log(progress);
    fileProgress = progress;
    //Logging the progress on console.
    //Depending on your application you can either send the progress to client
    //for some visual feedback or perform some other operation.
  });

  form.on('end', function() {
    res.end('success');
    console.log(" ** form end");
  });
});

/*
  UPLOAD PROCESS
*/
var analysisID;
function uploadToDatabase(){
  var date = new Date();
  console.log(fileProgress);

  const update = {uploadName: fileName, uploadDate:  date};
  connection.query('INSERT INTO upload SET ?', update, (err, res) => {
    if(err) throw err;
    console.log('Last upload insert ID:', res.insertId);
  });

  const updateTest ={testContent: fileData};
  connection.query('INSERT INTO test SET ?', updateTest, (err, res) => {
    if(err) throw err;
    console.log('Last test insert ID:', res.insertId);
    analysisID = res.insertId;
    console.log(" ** analysisID: "+analysisID);
    runChipsec();
  });
  
}

/*
  PYTHON PROCESS
*/
function runChipsec(){
  var newFilePath = "";
  console.log(" ** entered chipsec");
  newFilePath = String((__dirname + '/public/analysis/results' + analysisID +'.txt').replace(/\\/g, "/"));
  console.log("** filename "+newFilePath);

  var pyProcess = cmd.get('python chipsec/chipsec_main.py -i -m tools.uefi.blacklist -a C:/Users/User/Downloads/samples/sample3.ROM',
  function(data, err, stderr) {
    if (!err) {
      console.log("data from python script " + data)
      fs.writeFile(newFilePath, data, function(err) {
        if(err) {
            return console.log(err);
        }
        
        console.log("The file was saved!");
      }); 
    }
    else {
      console.log("python script cmd error: " + err)
      fs.writeFile(newFilePath, err, function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("The file was saved!");        
      }); 
    }
    const updateTest ={test2Report: err};
    connection.query('INSERT INTO test2 SET ?', updateTest, (err, res) => {
      if(err) throw err;
      console.log('Last test2 insert ID:', res.insertId);
    });
  }
  );
}

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