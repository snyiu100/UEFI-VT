var fileName = "";
var $fileResults = $('#fileResults');
var $resultsDiv = $('#resultsDiv');

var $preload = $('#preload'); // loading symbol


$('.upload-btn').on('click', function (){
    $('#upload-input').click();
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
    $fileResults.text('');    
    $resultsDiv.hide('slow');
  });

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


function printResults(){
  var fileUrl = "/analysis/temp.txt";
  var fileContent ="";
  
  
  $.ajax({
    url: fileUrl,
    type: 'POST',
    async: false,
    xhr: function(){
      
      //https://stackoverflow.com/questions/3567369/reading-server-side-file-with-javascript
      fetch(fileUrl).then(function(response) {
        if (response.status !== 200) {
          $preload.show('slow');
          setTimeout(printResults, 7500);
          throw response.status;
        }
        return response.text();
      }).then(function(file_content) {
        fileContent = file_content;
        
        $fileResults.css({
          "white-space" : "pre-wrap"
        }); 
        $fileResults.text(fileContent);
        
        $preload.hide();
        $resultsDiv.show('slow');
        
      }).catch(function(status) {
        //console.log('Error ' + status);
      });
    }
  });
}


//https://coligo.io/building-ajax-file-uploader-with-node/