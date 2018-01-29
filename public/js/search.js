var searchStr ='';

$('#searchBtn').click(function(){

    $('#searchResultsDiv').hide('slow');
    $("#searchTable tr").remove();
    $('#numOfResults').text('');

    searchStr = $('#searchText').val();
    console.log("check string: "+searchStr +"=");    

    if (searchStr == ""){
        console.log("string not defined");
        return;
    }
    else if( !searchStr.trim().length ) {
        console.log("only whitespace");
        return;
    }
    else {
        $('#preloadSearch').show('slow');
        getSearch();
    }
});

$('#searchText').keypress(function(e){
    if(e.which == 13){//Enter key pressed
        $('#searchBtn').click();//Trigger search button click event
    }
});

function getSearch(){
    var sendData = JSON.stringify({searchStr: searchStr});
    
    $.ajax({
        url: '/search',
        type: 'POST', 
        dataType: 'json',
        contentType: "application/json; charset=UTF-8",
        data: sendData ,
        success: function(data)
        {
            console.log("success");

            var rows = data;
    
            var newJson;
            var columnCounter=0;
            var resultCounter = 0;

            console.log(rows);

            if(rows.length==0){
                var searchData='';

                searchData += '<tr><td colspan="2" style="padding:5px"></td></tr>';
                console.log(searchData);
                $('#searchTable').append(searchData);
            }
            else{
                //all entries
                for (var i=0; i<rows.length; i++){
                    columnCounter =0;
                    newJson = rows[i];
                    resultCounter++;
                    
                    //single entry
                    for (var column in newJson) {
                        var searchData='';
                        columnCounter++;

                        var colHeader = column;
                        var colData = newJson[column];
                        

                        //check if name is <no_name>
                        if (colData.includes("<") || colData.includes(">")) {
                            colData = colData.replace(/\</g, "&lt;");
                            colData = colData.replace(/\>/g, "&gt;");
                        }

                        if (colHeader =="Upload Date"){
                            colData = String(new Date(colData));
                        }

                        //check if includes the search string
                        if (colData.toLowerCase().includes(searchStr.toLowerCase())){
                            if(colHeader =="Analysis Name"){
                                searchData += '<tr data-toggle="collapse" data-target=".search' +resultCounter +'" class="accordion-toggle clickable searchHeader"><td class="scol1">';
                                searchData += colHeader;
                                searchData += '</td><td class="scol2"><b><a style="text-decoration:none" onClick="downloadFile(\''+colData+'\')">';
                                searchData += colData;
                                searchData += '</a></b></td></tr>';
                                $('#searchTable').append(searchData);
                            }
                            else if (colHeader =="Analysis Report"){
                                searchData += '<tr><td class="scol1 hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" >';
                                searchData += colHeader;
                                searchData += '</div></td><td class="scol2 hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" ><b>';
                                searchData += 'Exists in the report';
                                searchData += '</div></b></td></tr>';
                                $('#searchTable').append(searchData);
                            }
                            else if (colHeader == "Upload Date"){
                                searchData += '<tr><td class="scol1 hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" >';
                                searchData += colHeader;
                                searchData += '</div></td><td class="dateCol hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" ><b>';
                                searchData += colData;
                                searchData += '</b></div></td></tr>';
                                $('#searchTable').append(searchData);
                            }
                            else{
                                searchData += '<tr><td class="scol1 hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" >';
                                searchData += colHeader;
                                searchData += '</div></td><td class="scol2 hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" ><b>';
                                searchData += colData;
                                searchData += '</div></b></td></tr>';
                                $('#searchTable').append(searchData);
                            }
                        }
                        //does not have search string
                        else{
                            if(colHeader =="Analysis Name"){
                                searchData += '<tr data-toggle="collapse" data-target=".search' +resultCounter +'" class="accordion-toggle clickable searchHeader"><td class="scol1">';
                                searchData += colHeader;
                                searchData += '</td><td class="scol2"><a style="text-decoration:none" onClick="downloadFile(\''+colData+'\')">';
                                searchData += colData;
                                searchData += '</a></td></tr>';
                                $('#searchTable').append(searchData);
                            }
                            else if (colHeader == "Upload Date"){
                                searchData += '<tr><td class="scol1 hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" >';
                                searchData += colHeader;
                                searchData += '</div></td><td class="dateCol hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" >';
                                searchData += colData;
                                searchData += '</div></td></tr>';
                                $('#searchTable').append(searchData);
                            }
                            else if (colHeader =="Analysis Report"){
                                searchData += '<tr><td class="scol1 hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" >';
                                searchData += colHeader;
                                searchData += '</div></td><td class="scol2 hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" >';
                                searchData += 'Exists in the report';
                                searchData += '</div></td></tr>';
                                $('#searchTable').append(searchData);
                            }
                            else{
                                searchData += '<tr><td class="scol1 hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" >';
                                searchData += colHeader;
                                searchData += '</div></td><td class="scol2 hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" >';
                                searchData += colData;
                                searchData += '</div></td></tr>';
                                $('#searchTable').append(searchData);
                            }
                            
                        }
                        
                    }
                    var searchAppend ='';
                    searchAppend += '<tr class="endRow"><td style="padding:15px;" colspan="2"></td></tr>';
                    $('#searchTable').append(searchAppend);
                }
            }


            function createVariables(){
                var accounts = [];
              
                for (var i = 0; i <= 20; ++i) {
                    accounts[i] = "whatever";
                }
              
                return accounts;
              }

            var pageContentSelector = new Array;

            var startTR = 0;
            for (var i =0; i < resultCounter; i++){
                var numVar = 5;
                if (i % numVar === 0){

                    var pageContent = $(".searchHeader:eq("+i+")").nextUntil( ".endRow:eq("+(i+(numVar))+")" ).addBack().css("color","red");

                    var totalTR = pageContent.length;

                    var lastTR = startTR + totalTR;

                    startTR = lastTR + 1;
                        var startSelection = i;
                        //var testSelection = $(".searchHeader:eq("+i+")").nextUntil( ".searchHeader:eq("+(i+(numVar-1))+")" );
                        var testSelection = $(".searchHeader:eq("+i+")").nextUntil( ".endRow:eq("+(i+(numVar))+")" ).addBack().css("color","red");
                        var endSelection = testSelection.length; 

                        console.log("end:"+testSelection.length);
                        console.log("start:"+(startSelection));
                        console.log("$(.searchHeader:eq("+i+")).nextUntil( .endRow:eq("+(i+(numVar))+") ).addBack().css(\"color\",\"red\")");
                }
            }

            //$('#searchTable').find('.tr').hide().slice(startSelection,testSelection.length ).show();
            //console.log("$('#searchTable').find('.tr').hide().slice("+startSelection+","+testSelection.length+").show();");
            //slice() extracts up to but not including endIndex. str.slice(1, 4) extracts the second character through the fourth character (characters indexed 1, 2, and 3).
            var currentPage = 0;
                var numPerPage = 50;
                console.log(currentPage * numPerPage, (currentPage + 1) * numPerPage);
                
                $('#searchTable').find('.tr').hide().slice(currentPage * numPerPage, (currentPage + 1) * numPerPage).show();

                console.log("$('#searchTable').find('.tr').hide().slice("+(currentPage * numPerPage)+","+ ((currentPage + 1) * numPerPage)+".show();");
            
            //$(".searchHeader:eq(0)").nextUntil( ".endRow:eq(0)" ).css( "color", "red" );

            /* $('#searchTable').each(function() {
                var currentPage = 0;
                var numPerPage = 50;
                var $table = $(this);
                var rowCounter =0;

                console.log($table.find('.endRow').length); //64

                $table.on('repaginate', function() {
                    $table.find('.tr').hide().slice(currentPage * numPerPage, (currentPage + 1) * numPerPage).show();
                    //$table.find('.tr').hide().slice(currentPage * numPerPage, (currentPage + 1) * numPerPage).show();
                    //.slice(0*50, 1*50).show
                    //.slice(0, 50).show
                });

                $table.trigger('repaginate');
                var numRows = resultCounter;
                var numPages = Math.ceil(numRows / numPerPage);
                var $pager = $('<div class="pager"></div>');
                for (var page = 0; page < numPages; page++) {
                    $('<span class="page-number"></span>').text(page + 1).on('click', {
                        newPage: page}, function(event) {
                            currentPage = event.data['newPage'];

                            $table.trigger('repaginate');
                            $(this).addClass('active').siblings().removeClass('active');
                        }).appendTo($pager).addClass('clickable');
                }
                $pager.insertBefore($table).find('span.page-number:first').addClass('active');
            }); */

            $('#numOfResults').append("Found "+resultCounter +" matches");
            toggleView();
        } 
    });
}

function toggleView(){
    $('#preloadSearch').hide('slow');
    $('#searchResultsDiv').show('slow');
}

//https://stackoverflow.com/questions/17524290/how-to-check-for-string-having-only-spaces-in-javascript