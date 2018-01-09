var fileName = "";
var $fileResults = $('#fileResults');
var $resultsDiv = $('#resultsDiv');
var $dbDiv = $('#dbDiv');
var $printBtn = $('#printBtn');

var $preload = $('#preload'); // loading symbol

//Display toggle function
$('.upload-btn').on('click', function (){
    $('#upload-input').click();
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
    $fileResults.text('');    
    $resultsDiv.hide('slow');
});

//Upload file function
$('#upload-input').on('change', function(){

  var files = $(this).get(0).files;

  if (files.length > 0){
    // create a FormData object which will be sent as the data payload in the
    // AJAX request
    var formData = new FormData();

    // loop through all the selected files and add them to the formData object
    var file = files[0];
    fileName = file.name;
    // add the files to formData object for the data payload
    formData.append('uploads[]', file, file.name);
    
    /* for multiple files
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          fileName = file.name;

          // add the files to formData object for the data payload
          formData.append('uploads[]', file, file.name);
          console.log(" ** 2 **");
        }
    */

    $.ajax({
      url: '/upload',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(data){
        //print to web console 
        console.log('upload successful! ' + data);
      },
      xhr: function() {
        // create an XMLHttpRequest
        var xhr = new XMLHttpRequest();
        
        // listen to the 'progress' event
        xhr.upload.addEventListener('progress', function(evt) {
          
          if (evt.lengthComputable) {
            // calculate the percentage of upload completed
            var percentComplete = evt.loaded / evt.total;
            percentComplete = parseInt(percentComplete * 100);
            
            // update the Bootstrap progress bar with the new percentage
            $('.progress-bar').text(percentComplete + '%');
            $('.progress-bar').width(percentComplete + '%');
            
            // once the upload reaches 100%, set the progress bar text to done
            if (percentComplete === 100) {
              $('.progress-bar').html('Success!');
              printResults();
            }
    
          }
        }, false);
        return xhr;
      }
    });
  }
});

function checkClick(dataStr){
  console.log("++ DS: "+dataStr);
}

//Accordion table function
function sendJSON(){
  
  console.log("test");

  $.ajax({                                      
    url: '/print',
    type: 'POST',   
    success: function(data)
    {

      var printRow='';
      var counter=0;

      var rows = data;

      for (i=0; i<rows.length; i++){
        console.log(rows[i].moduleName, rows[i].moduleGUID);
        printRow+=rows[i].moduleName+ rows[i].moduleGUID +"\r\n\r\n";
        counter++;

        if (rows[i].moduleName.includes("<") || rows[i].moduleName.includes(">")) {
          rows[i].moduleName = rows[i].moduleName.replace(/\</g, "&lt;");
          rows[i].moduleName = rows[i].moduleName.replace(/\>/g, "&gt;");
        }

        var output = '';

        output += '<tr data-toggle="collapse" data-target=".mod' +counter +'" class="accordion-toggle clickable modName">';
          output += '<td class="col1">Name</td>';
          output += '<td class="col2">' + rows[i].moduleName + '</td>';
        output += '</tr>';

        output += '<tr>';
          output += '<td class="hiddenRow col1">';
            output += '<div class="accordion-body collapse mod' +counter +'"> GUID</div>';
          output += '</td>';

          output += '<td class="hiddenRow col2">';
            output += '<div class="accordion-body collapse mod' +counter +'">' +rows[i].moduleGUID +'</div>';
          output += '</td>';
        output += '</tr>';

        output += '<tr>';
          output += '<td class="hiddenRow col1">';
            output += '<div class="accordion-body collapse mod' +counter +'"> MD5</div>';
          output += '</td>';

          output += '<td class="hiddenRow col2">';
            output += '<div class="accordion-body collapse mod' +counter +'">' +rows[i].moduleMD5 +'</div>';
          output += '</td>';
        output += '</tr>';

        output += '<tr>';
          output += '<td class="hiddenRow col1">';
            output += '<div class="accordion-body collapse mod' +counter +'"> SHA1</div>';
          output += '</td>';

          output += '<td class="hiddenRow col2">';
            output += '<div class="accordion-body collapse mod' +counter +'">' +rows[i].moduleSHA1 +'</div>';
          output += '</td>';
        output += '</tr>';

        output += '<tr>';
          output += '<td class="hiddenRow col1">';
            output += '<div class="accordion-body collapse mod' +counter +'"> SHA256</div>';
          output += '</td>';

          output += '<td class="hiddenRow col2">';
            output += '<div class="accordion-body collapse mod' +counter +'">' +rows[i].moduleSHA256 +'</div>';
          output += '</td>';
        output += '</tr>';

        output += '<tr>';
          output += '<td colspan="2" class="hiddenRow">'
            output += '<div class="accordion-body collapse mod' +counter +'"> Exists in <a href="#" style="text-decoration:none; font-weight: bold;" data-toggle="modal" onClick="sendPrint3(\''+rows[i].moduleName+'\')" data-target="#myModal">xxx</a> other uploads:</div>';
          output += '</td>';
        output += '</tr>';
        output += '<input type="text" id="demo" name="'+rows[i].moduleName+'">';
        
          

        $('#demoTable').append(output)

        console.log("checkoutput:\n"+output);
      }
      $('#demoTableDiv h3').append("Total Modules: "+counter);
    } 
  });
  $('#demoTableDiv').show('slow');
}

// Printing temp.txt function
function printResults(){
  var fileUrl = "/analysis/temp.txt";
  var fileContent ="";
  
  $.ajax({
    url: fileUrl,
    type: 'POST',
    async: false,
    xhr: function(){
      
      //https://stackoverflow.com/questions/3567369/reading-server-side-file-with-javascript
      fetch(fileUrl)
      .then(function(response) {
        if (response.status !== 200) {
          $preload.show('slow');
          setTimeout(printResults, 5000);
          throw response.status;
        }
        return response.text();
      })
      .then(function(file_content) {
        fileContent = file_content;
        
        $fileResults.css({
          "white-space" : "pre-wrap"
        }); 
        $fileResults.text(fileContent);
        
        $preload.hide();
        $resultsDiv.show('slow');
        
      })
      .catch(function(status) {
        //console.log('Error ' + status);
      });
    }
  });
}

// initial table function
$('#printBtn').on('click', function (){
  console.log("client");
  $.ajax({                                      
    url: '/print',
    type: 'POST',   
    success: function(data)
    {
      var printRow='';
      var counter='';

      var rows = data;
      
      /* for (i=0; i<rows.length; i++){
        var row = rows[i];
        console.log(rows[i].moduleName, rows[i].moduleGUID);
        printRow+=rows[i].moduleName+ rows[i].moduleGUID +"\r\n\r\n";
        counter++;
      } */

      for (i=0; i<rows.length; i++){
        console.log(rows[i].moduleName, rows[i].moduleGUID);
        printRow+=rows[i].moduleName+ rows[i].moduleGUID +"\r\n\r\n";

        if (rows[i].moduleName.includes("<") || rows[i].moduleName.includes(">")) {
          rows[i].moduleName = rows[i].moduleName.replace(/\</g, "&lt;");
          rows[i].moduleName = rows[i].moduleName.replace(/\>/g, "&gt;");
        }

        var output = '';
        output += '<tr>';
        output += '<td><a href="#" style="text-decoration:none">' + rows[i].moduleName + '</a></td>';
        output += '<td>' + rows[i].moduleGUID + '</td>';
        output += '<td>' + rows[i].moduleMD5 + '</td>';
        output += '<td>' + rows[i].moduleSHA1 + '</td>';
        output += '<td>' + rows[i].moduleSHA256 + '</td>';
        output += '</tr>';

        $('#dbTable tbody').append(output)
        
        counter++;
      }

      $('#dbTotalDiv').append("Total Modules: "+counter);

      /* $(result).each(function(index, item) {
        var output = '';
        output += '<tr>';
        output += '<td>' + item.file_no + '</td>';
        output += '<td>' + item.file_name + '</td>';
        output += '<td>' + item.file_content + '</td>';
        output += '<td>' + item.file_model + '</td>';
        output += '</tr>';
        $('#output').append(output);

        $('#dbTable tbody').append(
          '<tr><td><a href="#">' + rows[i].moduleName +
          '</a></td><td>' + rows[i].moduleGUID +
          '</td><td>' + rows[i].moduleMD5 +
          '</td><td>' + rows[i].moduleSHA1 +
          '</td><td>' + rows[i].moduleSHA256 +
          '</td></tr>'
        );

      } */


      /* $dbDiv.css({
        "white-space" : "pre-wrap"
      }); 
      $dbDiv.text(counter+printRow); */

    } 
    
  });
  $dbDiv.show('slow');      
  
});

//dynamic modulename modal fn => anchorclick
function sendPrint3(modNameStr){
  
  console.log("test3");

  var sendData = JSON.stringify({modStr: modNameStr});
  $('.modal-title').text('');    

  $.ajax({                                      
    url: '/print3',
    type: 'POST', 
    dataType: 'json',
    contentType: "application/json; charset=UTF-8",
    data: sendData ,
    success: function(data)
    {
      console.log("checking string: "+modNameStr);
      var rows = data;

      $('.modal-title').append(modNameStr +" also exists in:");      

      for (i=0; i<rows.length; i++){
        console.log(rows[i].uploadName, rows[i].uploadDate);
        var print ='';

        print += '<tr>';
          print += '<td class="ucol1">';
          print += rows[i].uploadName;
          print += '</td>';
          print += '<td class="ucol2" style="word-wrap: break-word;">';
          print += new Date(rows[i].uploadDate);
          print += '</td>';
        print += '</tr>';

        $('#uploadTable tbody').append(print);

      }
    } 
  });
  $('#printUploadDiv').show('slow');
}

// https://stackoverflow.com/questions/40258816/js-nodejs-read-table-from-db-with-ajax-and-display-in-table
//https://coligo.io/building-ajax-file-uploader-with-node/