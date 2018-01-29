var fileName = "";
var $resultsDiv = $('#resultsDiv');
var $printBtn = $('#printBtn');

var $preload = $('#preloadUpload'); // loading symbol

var analysisFP = '';
var fileUrl ='';

//Display toggle function
$('.upload-btn').on('click', function (){
    $('#upload-input').click();
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
    $("#resultsTable tr").remove();  
    $("#fileResultsDiv h4").text('');  
    $("#analysisTitle").text('Analysis Report');  
    $resultsDiv.hide('slow');
    $('#errorDiv').hide('slow');
    $preload.hide('slow');
});

//Upload file function
$('#upload-input').on('change', function(){

  $('.upload-btn').prop('disabled', true);
  
  var files = $(this).get(0).files;

  if (files.length > 0){
    $preload.show('slow');

    // create a FormData object which will be sent as the data payload in the
    // AJAX request
    var formData = new FormData();

    // loop through all the selected files and add them to the formData object
    var file = files[0];
    fileName = file.name;
    // add the files to formData object for the data payload
    formData.append('uploads[]', file, file.name);
    
    $.ajax({
      url: '/upload',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(data){
        //print to web console 
        console.log('upload successful! ');

        var printRow='';
        var counter=0;

        console.log(data);

        var rows = data;

        try{
          var analysisID =rows[0].moduleUploadID;
        }
        catch (err){
          $('#errorTitle').text("Analysis failed. Please try again.");
          $preload.hide('slow');
          $("#upload-input").val('');  
          $('#errorDiv').show('slow');
          $('.upload-btn').prop('disabled', false);
          
          return;
        }
          
        for (i=0; i<rows.length; i++){
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
              output += '<div class="accordion-body collapse mod' +counter +'"><a style="text-decoration:none; font-weight: bold;" data-toggle="modal" onClick="showLinked(\''+rows[i].moduleName+'\')" data-target="#myModal">Click to see similar</a></div>';
            output += '</td>';
          output += '</tr>';
          output += '<input type="text" id="demo" name="'+rows[i].moduleName+'">';
          
          $('#resultsTable').append(output)

         /*  $('td', 'table').each(function(i) {
            $(this).text(i + 1);
          }); */
          
          
        }
        $('#analysisTitle').append(" - Analysis"+analysisID);
        $('#fileResultsDiv h4').append("Total Modules: "+counter);
        $("#upload-input").val('');  
        
        $('.upload-btn').prop('disabled', false);
        
        $preload.hide('slow');
        $('#resultsDiv').show('slow');
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
            }
    
          }
        }, false);
        return xhr;
      }
    });
  }
});

//dynamic modulename modal fn => anchorclick
function showLinked(modNameStr){
  
  console.log("test3");

  var sendData = JSON.stringify({modStr: modNameStr});
  $('.modal-title').text('');    

  $.ajax({                                      
    url: '/show',
    type: 'POST', 
    dataType: 'json',
    contentType: "application/json; charset=UTF-8",
    data: sendData ,
    success: function(data)
    {
      console.log("checking string: "+modNameStr);
      var rows = data;

      if (modNameStr.includes("<") || modNameStr.includes(">")) {
        modNameStr = modNameStr.replace(/\</g, "&lt;");
        modNameStr = modNameStr.replace(/\>/g, "&gt;");
      }

      $('.modal-title').append(modNameStr +" also exists in:");
      
      for (i=0; i<rows.length; i++){
        console.log(rows[i].uploadName, rows[i].analysisName, rows[i].uploadDate);
        var print ='';

        print += '<tr>';
          print += '<td class="ucol1">';
          print += rows[i].uploadName;
          print += '</td>';
          print += '<td class="ucol1"><a style="text-decoration:none" onClick="downloadFile(\''+rows[i].analysisName+'\')">';
          print += rows[i].analysisName;
          print += '</a></td>';
          print += '<td class="ucol2">';
          print += new Date(rows[i].uploadDate);
          print += '</td>';
        print += '</tr>';

        $('#uploadTable tbody').append(print);

      }
    } 
  });
  $('#printUploadDiv').show('slow');
}

function downloadFile(analysisName){
  var form = '<form action="downloadFile" method="post" id="testDLForm" hidden><input type="submit" name="str" id="testValue" value="'+analysisName+'"/></form>';
  $('body').append(form);
  console.log("appended");
  clickFn();
}
function clickFn(){
  $( "#testValue" ).trigger( "click" );
}

// https://stackoverflow.com/questions/40258816/js-nodejs-read-table-from-db-with-ajax-and-display-in-table
//https://coligo.io/building-ajax-file-uploader-with-node/
//https://stackoverflow.com/questions/3567369/reading-server-side-file-with-javascript