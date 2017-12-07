  //https://coligo.io/building-ajax-file-uploader-with-node/ 
  
$('.upload-btn').on('click', function (){
    $('#upload-input').click();
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
    console.log(" ** AA **");
  });

$('#upload-input').on('change', function(){

  var files = $(this).get(0).files;

  if (files.length > 0){
    // create a FormData object which will be sent as the data payload in the
    // AJAX request
    var formData = new FormData();
    console.log(" ** 1 **");

    // loop through all the selected files and add them to the formData object
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      
      // add the files to formData object for the data payload
      formData.append('uploads[]', file, file.name);
      console.log(" ** 2 **");
    }

    $.ajax({
      url: '/upload',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(data){
          console.log('upload successful!\n' + data);
      },
      xhr: function() {
        // create an XMLHttpRequest
        var xhr = new XMLHttpRequest();
        console.log(" ** 3 **");
        
        // listen to the 'progress' event
        xhr.upload.addEventListener('progress', function(evt) {
          console.log(" ** 4 **");
          
          if (evt.lengthComputable) {
            // calculate the percentage of upload completed
            var percentComplete = evt.loaded / evt.total;
            percentComplete = parseInt(percentComplete * 100);
            console.log(" ** 5 **");
            
            // update the Bootstrap progress bar with the new percentage
            $('.progress-bar').text(percentComplete + '%');
            $('.progress-bar').width(percentComplete + '%');
            console.log(" ** 6 **");
            
            // once the upload reaches 100%, set the progress bar text to done
            if (percentComplete === 100) {
              $('.progress-bar').html('Success!');
              console.log(" ** 7 **");
            }
            console.log(" ** 8 **");
    
          }
          console.log(" ** 9 **");
        }, false);
        console.log(" ** 10 **");
        return xhr;
      }
    });
/*
    
*/
  }
});

