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
var crypto = require('crypto');

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
var fileData;
var analysisFilePath = "";

var allData;
var whitelistHeader;
var tempPath = __dirname + '/public/analysis/temp.txt';
var analysisID;
var cmdStatement;
var blacklistData;
var chipsecComplete;
var uploadComplete;
var moduleData;
var checksumVal;
var date;

function checksum (str, algorithm, encoding) {
  return crypto
      .createHash(algorithm || 'md5')
      .update(str, 'utf8')
      .digest(encoding || 'hex')
}

/*
  ===== DB CONNECTION =====
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
  ===== FILE UPLOAD =====
*/
app.post('/upload', function (req, res){
  var form = new formidable.IncomingForm();
  form.parse(req);

  form.on('fileBegin', function (name, file){
    fileName = file.name;
    file.path = __dirname + '/public/uploads/' + fileName;
    uploadFilePath = String((file.path).replace(/\\/g, "/"));
    console.log(" ** Uploading file");
  });

  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  form.on('file', function (name, file){
    insertUploadToDB();
    console.log(' ** Uploaded ' + fileName);
  });

  form.on('end', function() {

    chipsecComplete = false;
    tryChipsec();

    function tryChipsec(){
      if (chipsecComplete == true){
        console.log(" ** status complete");

        var sql = 'SELECT uploadChecksum, moduleName, moduleGUID, moduleMD5, moduleSHA1, moduleSHA256, moduleUploadID FROM module inner join upload on moduleuploadid=uploadid WHERE moduleUploadID = '+analysisID+' ORDER BY moduleName';

        connection.query(sql , (err, rows, result)=> {
          if (err) throw err;
          console.log(" ** finish db retrieval");
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify(rows));
        });
      }
      else{
        console.log(" ** status incomplete");
        this.setTimeout(function() {
          tryChipsec();
      }, 5000);

      }
    }
  });
});

/*
  ===== UPLOAD PROCESS =====
*/
function insertUploadToDB(){
  date = new Date();

  fs.readFile(uploadFilePath, function (err, data) {
    checksumVal = checksum(data);
    console.log(" ** Getting checksum");

    if (err) console.log("encounter error");

    const insertIntoUpload = {uploadName: fileName, uploadDate:  date, uploadChecksum: checksumVal};
      connection.query('INSERT INTO upload SET ?', insertIntoUpload, (err, res) => {
      if(err) throw err;
      analysisID = res.insertId;
      runChipsec();
    });
  });
  
}

/*
  ===== PYTHON PROCESS =====
*/
//initiate chipsec process
function runChipsec(){
  console.log(" ** Started chipsec");
  analysisFilePath = String((__dirname + '/public/analysis/analysis' + analysisID +'.txt').replace(/\\/g, "/"));
  uploadFilePath = String((uploadFilePath).replace(/\//g, "\\"));
  console.log(" ** filename "+analysisFilePath);

  chipsecWhitelist();
}

//parsing whitelist results
function chipsecWhitelist(){
  var allData;

  whitelistHeader = "Uploaded File: "+fileName;
  whitelistHeader += "\r\nUpload Checksum: "+checksumVal;
  whitelistHeader += "\r\nDate Uploaded: " +date;
  whitelistHeader += "\r\n\r\n******************** Retrieving module information ********************\r\n\r\n";
  
  cmdStatement = 'python chipsec/chipsec_main.py -i -m tools.uefi.whitelist -a generate,efilist.json,' + uploadFilePath +','+analysisID;

  fs.writeFile(tempPath, whitelistHeader, (err) => {
    if (err) throw err;

    var pyProcess2 = cmd.get(cmdStatement,
      //to save whitelist cmd output to file
      function(data, err, stderr) {
        
        //read tempWhite
        fs.readFile(tempPath, function(err,data){
          if (err) throw err;
          //data will contain file content
          allData = data;
          console.log(" ** data retrieved");

          // append to analysisX
          fs.writeFile(analysisFilePath, allData, (err) => {
            if (err) throw err;
            console.log(' ** All data written to analysis file!');
          });
              
          const insertIntoAnalysis ={
            'analysisName': "analysis"+analysisID, 'analysisReport': allData, 'analysisUploadID': analysisID
          };
          connection.query('INSERT INTO analysis SET ?', insertIntoAnalysis, (err, res) => {
            if(err) throw err;
            chipsecComplete = true;
          });
        });
      }
    );
  });
} 

/*
  ===== DOWNLOAD PROCESS =====
*/
//download upload analysis file
app.post('/download',function (req, res){
  console.log(" ** Downloading file...");
  res.download(analysisFilePath);
});

//download linked analysis file in modal
app.post('/downloadFile',function (req, res){
  var retrievedDownloadName = req.body.str;
  var downloadPath = String((__dirname + '/public/analysis/' + retrievedDownloadName +'.txt').replace(/\\/g, "/"));
  console.log(" ** Downloading file...");
  res.download(downloadPath);
});

/*
  ===== DB DATA RETRIEVAL =====
*/ 

// DB retrieval for linked uploads modal
app.post('/show', function (req, res){

  var retrievedModuleName = req.body.modStr;
  console.log(" ~~~get name: "+retrievedModuleName);

  connection.query('SELECT moduleUploadID FROM module WHERE moduleName =\'' +retrievedModuleName +'\'', (err, rows, result)=> {
    console.log(" ++ enter");
    if (err) throw err;

    sql="SELECT uploadName, analysisName, uploadDate FROM upload INNER JOIN analysis on uploadid=analysisuploadid WHERE uploadID =";

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
        
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(rows));
    
      });
    }
  });

  
});

/*
  ===== DB SEARCH =====
*/
app.post('/search', function (req, res){

  var searchStr = req.body.searchStr;


  var searchAll= req.body.searchAll;
  var searchUploadName= req.body.searchUploadName;
  var searchUploadChecksum= req.body.searchUploadChecksum;
  var searchAnalysisName= req.body.searchAnalysisName;
  var searchAnalysisReport= req.body.searchAnalysisReport;
  var searchModuleName= req.body.searchModuleName;
  var searchModuleGUID= req.body.searchModuleGUID;
  var searchModuleMD5= req.body.searchModuleMD5;
  var searchModuleSHA1= req.body.searchModuleSHA1;
  var searchModuleSHA256= req.body.searchModuleSHA256;

  console.log(" ~~~ search string: "+searchStr);
  var sql = '';

  searchStr = searchStr.toLowerCase();

  var tempJson;
  var newJsonObj = [];
  var columnCounter=0;
  var resultCounter = 0;

  if (searchStr.length==1){
    sql = 'select analysisname as \'Analysis Name\', uploadname as \'Upload Name\', uploaddate as \'Upload Date\', modulename as \'Module Name\', moduleguid as \'Module GUID\', modulemd5 as \'Module MD5\', modulesha1 as \'Module SHA1\', modulesha256 as \'Module SHA256\' ';
    sql+= 'from module inner join upload on uploadid = moduleuploadid ';
    sql+= 'inner join analysis on analysisuploadid = moduleuploadid where ';
    sql+= 'modulename like "%'+searchStr +'%"';

    connection.query(sql, (err, rows, result)=> {
      console.log(" ++ enter module");
      if (err){
        console.log(" ++ nothing in module");
      }
      else{
        console.log(" ++ stuff in module");
        for (var i=0; i<rows.length; i++){
          tempJson = rows[i];
            var item ={};
            for (var column in tempJson) {
              item [column] = tempJson[column];
            }
          newJsonObj.push(item);
        }
      }

      doReturn();
        
    });
  }
  else
    doAll();

  function doAll(){
    if(searchAll==true) {
      sql = 'select analysisname as \'Analysis Name\', uploadname as \'Upload Name\', uploaddate as \'Upload Date\', uploadchecksum as \'Upload Checksum\' ';
      sql += 'from upload inner join analysis on analysisuploadid=uploadid where ';
      sql += 'uploadname like "%'+searchStr +'%" ';
      sql += 'or uploadchecksum like "%'+searchStr +'%"';
  
      connection.query(sql, (err, rows, result)=> {
        console.log(" ++ enter upload");
        if (err) {
          console.log(" ++ nothing in upload");
        }
        else{
          console.log(" ++ stuff in upload");
          for (var i=0; i<rows.length; i++){
            tempJson = rows[i];
              var item ={};
              for (var column in tempJson) {
                item [column] = tempJson[column];
              }
            newJsonObj.push(item);
          }
        }
  
  
        sql = 'select analysisname as \'Analysis Name\', uploadname as \'Upload Name\', uploaddate as \'Upload Date\', analysisreport as \'Analysis Report\' ';
        sql+= 'from analysis inner join upload on uploadid = analysisuploadid where ';
        sql+= 'analysisname like "%'+searchStr +'%" ';
        sql+= 'or analysisreport like "%'+searchStr +'%"';
  
        connection.query(sql, (err, rows, result)=> {
          console.log(" ++ enter analysis");
          if (err){
            console.log(" ++ nothing in analysis");
          }
          else{
            console.log(" ++ stuff in upload");
            for (var i=0; i<rows.length; i++){
              tempJson = rows[i];
                var item ={};
                for (var column in tempJson) {
                  item [column] = tempJson[column];
                }
              newJsonObj.push(item);
            }
          }
          
  
          sql = 'select analysisname as \'Analysis Name\', uploadname as \'Upload Name\', uploaddate as \'Upload Date\', modulename as \'Module Name\', moduleguid as \'Module GUID\', modulemd5 as \'Module MD5\', modulesha1 as \'Module SHA1\', modulesha256 as \'Module SHA256\' ';
          sql+= 'from module inner join upload on uploadid = moduleuploadid ';
          sql+= 'inner join analysis on analysisuploadid = moduleuploadid where ';
          sql+= 'modulename like "%'+searchStr +'%" ';
          sql+= 'or moduleguid like "%'+searchStr +'%" ';
          sql+= 'or modulemd5 like "%'+searchStr +'%" ';
          sql+= 'or modulesha1 like "%'+searchStr +'%" ';
          sql+= 'or modulesha256 like "%'+searchStr +'%"';
  
          connection.query(sql, (err, rows, result)=> {
            console.log(" ++ enter module");
            if (err){
              console.log(" ++ nothing in module");
            }
            else{
              console.log(" ++ stuff in module");
              for (var i=0; i<rows.length; i++){
                tempJson = rows[i];
                  var item ={};
                  for (var column in tempJson) {
                    item [column] = tempJson[column];
                  }
                newJsonObj.push(item);
              }
            }
            
            doUploadName();
            
          });
          
        });
        
      });
    }
    else doUploadName();
  }

  function doUploadName(){
    if (searchUploadName==true){
      sql = 'select analysisname as \'Analysis Name\', uploadname as \'Upload Name\', uploaddate as \'Upload Date\', uploadchecksum as \'Upload Checksum\' ';
      sql += 'from upload inner join analysis on analysisuploadid=uploadid where ';
      sql += 'uploadname like "%'+searchStr +'%" ';

      connection.query(sql, (err, rows, result)=> {
        console.log(" ++ enter uploadname");
        if (err){
          console.log(" ++ nothing in uploadname");
        }
        else{
          console.log(" ++ stuff in uploadname");
          for (var i=0; i<rows.length; i++){
            tempJson = rows[i];
              var item ={};
              for (var column in tempJson) {
                item [column] = tempJson[column];
              }
            newJsonObj.push(item);
          }
        }
        doUploadChecksum();
      });
    }
    else doUploadChecksum();
  }

  function doUploadChecksum(){
    if (searchUploadChecksum==true){
      sql = 'select analysisname as \'Analysis Name\', uploadname as \'Upload Name\', uploaddate as \'Upload Date\', uploadchecksum as \'Upload Checksum\' ';
      sql += 'from upload inner join analysis on analysisuploadid=uploadid where ';
      sql += 'uploadchecksum like "%'+searchStr +'%" ';

      connection.query(sql, (err, rows, result)=> {
        console.log(" ++ enter uploadchecksum");
        if (err){
          console.log(" ++ nothing in uploadchecksum");
        }
        else{
          console.log(" ++ stuff in uploadchecksum");
          for (var i=0; i<rows.length; i++){
            tempJson = rows[i];
              var item ={};
              for (var column in tempJson) {
                item [column] = tempJson[column];
              }
            newJsonObj.push(item);
          }
        }
        doAnalysisName();
      });
    }
    else doAnalysisName();
  }

  function doAnalysisName(){
    if (searchAnalysisName==true){
      sql = 'select analysisname as \'Analysis Name\', uploadname as \'Upload Name\', uploaddate as \'Upload Date\', analysisreport as \'Analysis Report\' ';
      sql+= 'from analysis inner join upload on uploadid = analysisuploadid where ';
      sql+= 'analysisname like "%'+searchStr +'%"';


      connection.query(sql, (err, rows, result)=> {
        console.log(" ++ enter analysisName");
        if (err){
          console.log(" ++ nothing in analysisName");
        }
        else{
          console.log(" ++ stuff in analysisName");
          for (var i=0; i<rows.length; i++){
            tempJson = rows[i];
              var item ={};
              for (var column in tempJson) {
                item [column] = tempJson[column];
              }
            newJsonObj.push(item);
          }
        }
        doAnalysisReport();
      });
    }
    else doAnalysisReport();
  }

  function doAnalysisReport(){
    if (searchAnalysisReport==true){
      sql = 'select analysisname as \'Analysis Name\', uploadname as \'Upload Name\', uploaddate as \'Upload Date\', analysisreport as \'Analysis Report\' ';
      sql+= 'from analysis inner join upload on uploadid = analysisuploadid where ';
      sql+= 'analysisreport like "%'+searchStr +'%"';

      connection.query(sql, (err, rows, result)=> {
        console.log(" ++ enter doAnalysisReport");
        if (err){
          console.log(" ++ nothing in doAnalysisReport");
        }
        else{
          console.log(" ++ stuff in doAnalysisReport");
          for (var i=0; i<rows.length; i++){
            tempJson = rows[i];
              var item ={};
              for (var column in tempJson) {
                item [column] = tempJson[column];
              }
            newJsonObj.push(item);
          }
        }
        doModuleName();
      });
    }
    else doModuleName();
  }

  function doModuleName(){
    if (searchModuleName==true){
      sql = 'select analysisname as \'Analysis Name\', uploadname as \'Upload Name\', uploaddate as \'Upload Date\', modulename as \'Module Name\', moduleguid as \'Module GUID\', modulemd5 as \'Module MD5\', modulesha1 as \'Module SHA1\', modulesha256 as \'Module SHA256\' ';
      sql+= 'from module inner join upload on uploadid = moduleuploadid ';
      sql+= 'inner join analysis on analysisuploadid = moduleuploadid where ';
      sql+= 'modulename like "%'+searchStr +'%"';

      connection.query(sql, (err, rows, result)=> {
        console.log(" ++ enter doModuleName");
        if (err){
          console.log(" ++ nothing in doModuleName");
        }
        else{
          console.log(" ++ stuff in doModuleName");
          for (var i=0; i<rows.length; i++){
            tempJson = rows[i];
              var item ={};
              for (var column in tempJson) {
                item [column] = tempJson[column];
              }
            newJsonObj.push(item);
          }
        }
        doModuleGUID();
      });
    }
    else doModuleGUID();
  }

  function doModuleGUID(){
    if (searchModuleGUID==true){
      sql = 'select analysisname as \'Analysis Name\', uploadname as \'Upload Name\', uploaddate as \'Upload Date\', modulename as \'Module Name\', moduleguid as \'Module GUID\', modulemd5 as \'Module MD5\', modulesha1 as \'Module SHA1\', modulesha256 as \'Module SHA256\' ';
      sql+= 'from module inner join upload on uploadid = moduleuploadid ';
      sql+= 'inner join analysis on analysisuploadid = moduleuploadid where ';
      sql+= 'moduelguid like "%'+searchStr +'%"';

      connection.query(sql, (err, rows, result)=> {
        console.log(" ++ enter doModuleGUID");
        if (err){
          console.log(" ++ nothing in doModuleGUID");
        }
        else{
          console.log(" ++ stuff in doModuleGUID");
          for (var i=0; i<rows.length; i++){
            tempJson = rows[i];
              var item ={};
              for (var column in tempJson) {
                item [column] = tempJson[column];
              }
            newJsonObj.push(item);
          }
        }
        doModuleMD5();
      });
    }
    else doModuleMD5();
  }

  function doModuleMD5(){
    if (searchModuleMD5==true){
      sql = 'select analysisname as \'Analysis Name\', uploadname as \'Upload Name\', uploaddate as \'Upload Date\', modulename as \'Module Name\', moduleguid as \'Module GUID\', modulemd5 as \'Module MD5\', modulesha1 as \'Module SHA1\', modulesha256 as \'Module SHA256\' ';
      sql+= 'from module inner join upload on uploadid = moduleuploadid ';
      sql+= 'inner join analysis on analysisuploadid = moduleuploadid where ';
      sql+= 'modulemd5 like "%'+searchStr +'%"';

      connection.query(sql, (err, rows, result)=> {
        console.log(" ++ enter ModuleMD5");
        if (err){
          console.log(" ++ nothing in ModuleMD5");
        }
        else{
          console.log(" ++ stuff in ModuleMD5");
          for (var i=0; i<rows.length; i++){
            tempJson = rows[i];
              var item ={};
              for (var column in tempJson) {
                item [column] = tempJson[column];
              }
            newJsonObj.push(item);
          }
        }
        doModuleSHA1();
      });
    }
    else doModuleSHA1();
  }

  function doModuleSHA1(){
    if (searchModuleSHA1==true){
      sql = 'select analysisname as \'Analysis Name\', uploadname as \'Upload Name\', uploaddate as \'Upload Date\', modulename as \'Module Name\', moduleguid as \'Module GUID\', modulemd5 as \'Module MD5\', modulesha1 as \'Module SHA1\', modulesha256 as \'Module SHA256\' ';
      sql+= 'from module inner join upload on uploadid = moduleuploadid ';
      sql+= 'inner join analysis on analysisuploadid = moduleuploadid where ';
      sql+= 'modulesha1 like "%'+searchStr +'%"';

      connection.query(sql, (err, rows, result)=> {
        console.log(" ++ enter modulesha1");
        if (err){
          console.log(" ++ nothing in modulesha1");
        }
        else{
          console.log(" ++ stuff in modulesha1");
          for (var i=0; i<rows.length; i++){
            tempJson = rows[i];
              var item ={};
              for (var column in tempJson) {
                item [column] = tempJson[column];
              }
            newJsonObj.push(item);
          }
        }
        doModuleSHA256();
      });
    }
    else doModuleSHA256();
  }

  function doModuleSHA256(){
    if (searchModuleSHA256==true){
      sql = 'select analysisname as \'Analysis Name\', uploadname as \'Upload Name\', uploaddate as \'Upload Date\', modulename as \'Module Name\', moduleguid as \'Module GUID\', modulemd5 as \'Module MD5\', modulesha1 as \'Module SHA1\', modulesha256 as \'Module SHA256\' ';
      sql+= 'from module inner join upload on uploadid = moduleuploadid ';
      sql+= 'inner join analysis on analysisuploadid = moduleuploadid where ';
      sql+= 'modulesha256 like "%'+searchStr +'%"';

      connection.query(sql, (err, rows, result)=> {
        console.log(" ++ enter modulesha256");
        if (err){
          console.log(" ++ nothing in modulesha256");
        }
        else{
          console.log(" ++ stuff in modulesha256");
          for (var i=0; i<rows.length; i++){
            tempJson = rows[i];
              var item ={};
              for (var column in tempJson) {
                item [column] = tempJson[column];
              }
            newJsonObj.push(item);
          }
        }
        doReturn();
      });
    }
    else doReturn();
  }

  function doReturn(){
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(newJsonObj));
  }
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
//https://stackoverflow.com/questions/15009448/creating-a-json-dynamically-with-each-input-value-using-jquery
//https://blog.tompawlak.org/calculate-checksum-hash-nodejs-javascript