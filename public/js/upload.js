var filename = "";
var $resultsDiv = $('#resultsDiv');
var $printBtn = $('#printBtn');

var $preload = $('#preloadUpload'); //loading symbol

var analysisFP = '';
var fileUrl = '';

//Display toggle function
$('.upload-btn').on('click', function(){
    $('#upload-input').click();
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
    $("#resultsTable tr").remove();  
    $("#fileResultsDiv h4").text('');  
    $("#analysisTitle").text('Analysis Report');  
    $("#checksumTitle").text('Checksum: ');  
    $resultsDiv.hide('slow');
    $('#errorDiv').hide('slow');
    $preload.hide('slow');
    $('.pager').remove();
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

                try {
                    var analysisID =rows[0].moduleUploadID;
                }
                catch(err) {
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

                    output += '<tr data-toggle="collapse" data-target=".mod' +counter +'" class="accordion-toggle clickable modName uploadHeader">';
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
            
                    output += '<tr class="endRow"><td style="padding:15px;" colspan="2"></td></tr>';
                    $('#resultsTable').append(output);
                }

                var pageContent = [];
                var startRow = [];
                var totalRows = [];
                var lastRow = [];
                var pageContentCounter=0;
                startRow[0] = -1;
                lastRow[0] = -1;
                var numVar = 10; //number of results per page

                for (var i =0; i < counter; i++){
                    if (i % numVar === 0){
                        pageContentCounter++; // paging counter
        
                        startRow[pageContentCounter] = lastRow[pageContentCounter-1] + 1; //get first row num of page content
        
                        pageContent[pageContentCounter] = $(".uploadHeader:eq("+i+")").nextUntil( ".endRow:eq("+(i+numVar-1)+")" ).addBack(); //object: select 1st AnalysisName to last endRow
        
                        totalRows[pageContentCounter] = pageContent[pageContentCounter].length; //get total number of rows of content
        
                        lastRow[pageContentCounter] = startRow[pageContentCounter] + totalRows[pageContentCounter]; //get num of last row content
                        console.log(pageContentCounter+"sheck: startNum"+startRow[pageContentCounter]+",totalLen"+totalRows[pageContentCounter]+",lastNum"+lastRow[pageContentCounter]);
                    }
                }

                $('#resultsTable').each(function() {
                    var currentPage = 1;
                    var $table = $(this);
                            
                    $table.on('repaginate', function() {
                        $table.find('tr').hide().slice(startRow[currentPage], lastRow[currentPage]).show();
                    });
        
                    $table.trigger('repaginate');
                    var numPages = pageContentCounter;
                    var $pager = $('<div class="pager"></div>');
                    for (var page = 1; page <= numPages; page++) {
                        $('<span class="page-number"></span>').text(page).on('click', {newPage: page}, 
                        function(event) {
                            currentPage = event.data['newPage'];
                            $table.trigger('repaginate');
                            $(this).addClass('active').siblings().removeClass('active');
                        }).appendTo($pager).addClass('clickable');
                    }
                    $pager.insertBefore($table).find('span.page-number:first').addClass('active');
                });

                $('#analysisTitle').append(" - Analysis"+analysisID);
                $('#checksumTitle').append("\r\n"+rows[0].uploadChecksum);
                $('#fileResultsDiv h4').append("Total Modules: "+counter);
                $("#upload-input").val('');  
                
                $('.upload-btn').prop('disabled', false);
                
                $preload.hide('slow');
                $('#resultsDiv').show('slow');
            },
            xhr: function() {
                var xhr = new XMLHttpRequest();
                
                // listen to the 'progress' event
                xhr.upload.addEventListener('progress', function(evt) {
                    if (evt.lengthComputable) {
                        // calculate the percentage of upload completed
                        var percentComplete = evt.loaded / evt.total;
                        percentComplete = parseInt(percentComplete * 100);
                        
                        // update progress bar with the new percentage
                        $('.progress-bar').text(percentComplete + '%');
                        $('.progress-bar').width(percentComplete + '%');
                        
                        if (percentComplete === 100) {
                            $('.progress-bar').html('Success!');
                        }
                    }
                }, false);
                return xhr;
            },
            error: function(data){
                console.log("failed upload");
                $('#errorTitle').text("Analysis failed. Please try again.");
                $preload.hide('slow');
                $("#upload-input").val('');  
                $('#errorDiv').show('slow');
                $('.upload-btn').prop('disabled', false);
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
        success: function(data) {
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
    console.log("appended "+analysisName);
    clickFn();
}

function clickFn(){
    $( "#testValue" ).trigger( "click" );
    $('#testDLForm').remove();
}

// https://stackoverflow.com/questions/40258816/js-nodejs-read-table-from-db-with-ajax-and-display-in-table
//https://coligo.io/building-ajax-file-uploader-with-node/
//https://stackoverflow.com/questions/3567369/reading-server-side-file-with-javascript