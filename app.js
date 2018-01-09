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

var uploadFilePath = "";
var fileName = "";
var fileData ;
var analysisFilePath = "";

var whitelistData;
var tempPath = __dirname + '/public/analysis/temp.txt';
var tempWhitePath = __dirname + '/public/analysis/tempWhite.txt';
var analysisID;
var cmdStatement;
var blacklistData;

/*
  DB CONNECTION
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
    uploadFilePath = String((file.path).replace(/\\/g, "/"));
    console.log("chekc path: "+uploadFilePath);
    uploadToDatabase();
  });

  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  form.on('file', function (name, file){
    console.log(' ** Uploaded ' + fileName);
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

  const insertIntoUpload = {uploadName: fileName, uploadDate:  date};
  connection.query('INSERT INTO upload SET ?', insertIntoUpload, (err, res) => {
    if(err) throw err;
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
  analysisFilePath = String((__dirname + '/public/analysis/results' + analysisID +'.txt').replace(/\\/g, "/"));
    uploadFilePath = String((uploadFilePath).replace(/\//g, "\\"));
    console.log(" ** filename "+analysisFilePath);

  chipsecBlacklist();
}

//parsing blacklist results
function chipsecBlacklist(){
  blacklistData = "******************** Analysing modules ********************";
  cmdStatement = 'python chipsec/chipsec_main.py -i -m tools.uefi.blacklist -a ' + uploadFilePath;

  console.log(" ** check stattemtn 1: "+cmdStatement);

  var pyProcess = cmd.get(cmdStatement,
  //to save blacklist output to file
    function(data, err, stderr) {
      console.log(" ** enter blacklist");
        if (err) {
          blacklistData += err;
        }

        fs.writeFile(analysisFilePath, blacklistData, (err) => {
          if (err) throw err;
          console.log(' ** Black data written to analysis file!');
        });

        chipsecWhitelist();        

    }
  );
}

//parsing whitelist results
function chipsecWhitelist(){
  var allData;
  var foreignKey = analysisID;
  whitelistData = "******************** Retrieving module information ********************\r\n\r\n";
  cmdStatement = 'python chipsec/chipsec_main.py -i -m tools.uefi.whitelist -a generate,efilist.json,' + uploadFilePath +','+foreignKey;
  
  console.log(" ** check stattemtn 2: "+cmdStatement);

  var pyProcess2 = cmd.get(cmdStatement,
      //to save whitelist cmd output to file
      function(data, err, stderr) {
        console.log(" ** enter whitelist");

        fs.appendFile(analysisFilePath, whitelistData, (err) => {
          if (err) throw err;
          console.log(' ** white header written to analysis file!');

          //read tempWhite
          fs.readFile(tempWhitePath, function(err,data){
            if (err) throw err;
            //data will contain file content
            whitelistData = data;
            console.log(" **  data retrieved");

            // append to analysisX
            fs.appendFile(analysisFilePath, whitelistData, (err) => {
              if (err) throw err;
              console.log(' ** All data written to analysis file!');

              // read analysisX
              fs.readFile(analysisFilePath, function(err,data){
                if (err) throw err;
                //data will contain file content
                allData = data;

                //write to temp
                fs.writeFile(tempPath, allData, (err) =>{
                  if (err) throw err;
                  console.log(' ** All data written to temp file!');
                });

                const insertIntoTest2 ={
                  'test2Report': allData
                };
                connection.query('INSERT INTO test2 SET ?', insertIntoTest2, (err, res) => {
                  if(err) throw err;
                  console.log(' ** Last test2 insert ID:', res.insertId);
                });

                const insertIntoAnalysis ={
                  'analysisReport': allData, 'analysisUploadID': foreignKey
                };
                connection.query('INSERT INTO analysis SET ?', insertIntoAnalysis, (err, res) => {
                  if(err) throw err;
                  console.log(' ** Last analysis insert ID:', res.insertId);
                });
              
              });

            });

          });
        });
    }
  );
} 

/*
  DOWNLOAD PROCESS
*/
app.post('/download',function (req, res){
  console.log(" ** Downloading file...");
  res.download(analysisFilePath);
});

/*
  DB DATA RETRIEVAL
*/
app.post('/print',function (req, res){
  console.log(" ** Getting from DB...");
  
  connection.query('SELECT COUNT(moduleName) AS moduleCount FROM module WHERE moduleUploadID=3', (err,rows,result)=>{
    if (err) throw err;
    
    console.log("rows:", rows);
    console.log("print:", rows[0].moduleCount);
    //data+= rows[0].moduleCount +"\r\n";
  })

  connection.query('SELECT moduleName, moduleGUID, moduleMD5, moduleSHA1, moduleSHA256 FROM module WHERE moduleUploadID = 3 ORDER BY moduleName' , (err, rows, result)=> {
    if (err) throw err;

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(rows));

  });

}); 

app.post('/print2', function (req, res){

  // get MD5/name/etc of selected module
  retrievedModuleName = "ACPIRAM";

  console.log('SELECT moduleUploadID FROM module WHERE moduleName =\''+retrievedModuleName +'\'');

  connection.query('SELECT moduleUploadID FROM module WHERE moduleName =\'' +retrievedModuleName +'\'', (err, rows, result)=> {
    console.log(" ++ enter");
    if (err) throw err;

    sql="SELECT uploadName, uploadDate FROM upload WHERE uploadID =";

    console.log(" ++ length:"+rows.length);

    console.log(" ++ check json:" +JSON.stringify(rows));

    console.log(" ++ name:"+rows[2].moduleUploadID);

    console.log(" ++ typw:"+typeof(rows[2].moduleUploadID));

    doDBCall();

    function doDBCall(){
      if (rows.length > 1){
        console.log(" ++ enter2");
        for (i=0; i<rows.length; i++){
          console.log(" ++ enter3");
          if (i==0){
            sql += rows[i].moduleUploadID;
          }
          else if (i== (rows.length-1)){
            console.log("++ check i : "+i);
            sql += ' or uploadID=' +rows[i].moduleUploadID +' ORDER BY uploadID';
          }
          else{
            sql += ' or uploadID=' +rows[i].moduleUploadID; 
          }
        }
      }
      else {
        sql += rows[0].moduleUploadID +' ORDER BY uploadID';
      }

      console.log(" ++ check sttment: "+sql);
      
      doDBCall2();
    }

    function doDBCall2(){
      console.log("do2");

      connection.query(sql , (err, rows, result)=> {
        console.log("sql statement2: "+sql);
        if (err) throw err;
        
        console.log(" ++ check json2:" +JSON.stringify(rows));
        
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(rows));
    
      });
    }
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

//http://shiya.io/simple-file-upload-with-express-js-and-formidable-in-node-js/
//https://coligo.io/building-ajax-file-uploader-with-node/ 