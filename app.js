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
var newFilePath = "";

var whitelistData;
var analysisData;
var tempPath = __dirname + '/public/analysis/temp.txt';
var tempWhitePath = __dirname + '/public/analysis/tempWhite.txt';
var analysisID;

//http://shiya.io/simple-file-upload-with-express-js-and-formidable-in-node-js/
//https://coligo.io/building-ajax-file-uploader-with-node/ 
app.post('/upload', function (req, res){
  var form = new formidable.IncomingForm();
  form.parse(req);

  fs.unlink(tempPath,function(err){
    if (err) {console.log("do nothign")};
    console.log(' ** successfully deleted ' +tempPath);
  });
  
  form.on('fileBegin', function (name, file){
    fileName = file.name;
    file.path = __dirname + '/public/uploads/' + fileName;
    filePath = String((file.path).replace(/\\/g, "/"));
    uploadToDatabase();
  });

  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  form.on('file', function (name, file){
    console.log(' ** Uploaded ' + fileName);

    /* fs.readFile(filePath, function(err,data){
      if (err) 
        throw err;
      //data will contain file content
      fileData = data;
    });  */
  });

  form.on('end', function() {
    res.end('success');
    console.log(" ** form end");
  });
});

/*
  UPLOAD PROCESS
*/
function uploadToDatabase(){
  var date = new Date();
  console.log(fileProgress);

  const update = {uploadName: fileName, uploadDate:  date};
  connection.query('INSERT INTO upload SET ?', update, (err, res) => {
    if(err) throw err;
    console.log(' ** Last upload insert ID:', res.insertId);
  });

  const updateTest ={testContent: fileData};
  connection.query('INSERT INTO test SET ?', updateTest, (err, res) => {
    if(err) throw err;
    console.log(' ** Last test insert ID:', res.insertId);
    analysisID = res.insertId;
    console.log(" ** analysisID: "+analysisID);
    runChipsec();
  });
  
}

/*
  PYTHON PROCESS
*/
function runChipsec(){
  console.log(" ** entered chipsec");
  newFilePath = String((__dirname + '/public/analysis/results' + analysisID +'.txt').replace(/\\/g, "/"));
  console.log(" ** filename "+newFilePath);

  chipsecBlacklist();
}

var blacklistData;
//parsing blacklist results
function chipsecBlacklist(){
  blacklistData = "******************** Analysing modules ********************";
  var pyProcess = cmd.get('python chipsec/chipsec_main.py -i -m tools.uefi.blacklist -a C:/Users/User/Desktop/UEFI-VT/UEFI-VT/samples/sample4.ROM',
  //to save blacklist output to file
    function(data, err, stderr) {
      console.log(" ** enter blacklist");
        if (err) {
          blacklistData += err;
          analysisData += blacklistData;
        }

        fs.writeFile(newFilePath, blacklistData, (err) => {
          if (err) throw err;
          console.log(' ** Black data written to analysis file!');
        });

        /* fs.appendFile(newFilePath, blacklistData, (err) => {
          if (err) throw err;
          console.log('*** data appended to analysis file!');
        });

        fs.appendFile(tempPath, blacklistData, (err) => {
          if (err) throw err;
          console.log('*** data appended to temp!');
        }); */

        const updateTest ={test2Report: analysisData};
        connection.query('INSERT INTO test2 SET ?', updateTest, (err, res) => {
          if(err) throw err;
          console.log(' ** Last test2 insert ID:', res.insertId);
        });

        chipsecWhitelist();        

    }
  );

}


//parsing whitelist results
function chipsecWhitelist(){
  var allData;
  whitelistData = "******************** Retrieving module information ********************\r\n\r\n";

  fs.appendFile(newFilePath, whitelistData, (err) => {
    if (err) throw err;
    console.log(' ** white header written to analysis file!');
  });

  var pyProcess2 = cmd.get('python chipsec/chipsec_main.py -i -m tools.uefi.whitelist -a generate,efilist.json,C:/Users/User/Desktop/UEFI-VT/UEFI-VT/samples/sample4.ROM'
  ,
      //to save whitelist cmd output to file
      function() {
        console.log(" ** enter whitelist");

        fs.readFile(tempWhitePath, function(err,data){
          if (err) throw err;
          //data will contain file content
          whitelistData = data;
          console.log(" **  data retrieved");

          fs.appendFile(newFilePath, whitelistData, (err) => {
            if (err) throw err;
            console.log(' ** All data written to analysis file!');

            fs.readFile(newFilePath, function(err,data){
              if (err) throw err;
              //data will contain file content
              allData = data;

              fs.writeFile(tempPath, allData, (err) =>{
                if (err) throw err;
                console.log(' ** All data written to temp file!');
              });
            
            });

          });

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