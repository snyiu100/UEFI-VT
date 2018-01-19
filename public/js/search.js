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
                for (var i=0; i<rows.length; i++){
                    columnCounter =0;
                    newJson = rows[i];

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

                        if (colHeader =="uploaddate"){
                            colData = String(new Date(colData));
                        }

                        //check if includes the search string
                        if (colData.toLowerCase().includes(searchStr.toLowerCase())){
                            if (colHeader =="analysisreport"){
                                searchData += '<tr><td>';
                                searchData += colHeader;
                                searchData += '</td><td><b>';
                                searchData += 'Exists in the report';
                                searchData += '</b></td></tr>';
                                $('#searchTable').append(searchData);
                            }
                            else{
                                searchData += '<tr><td>';
                                searchData += colHeader;
                                searchData += '</td><td><b>';
                                searchData += colData;
                                searchData += '</b></td></tr>';
                                $('#searchTable').append(searchData);
                            }
                        }
                        //does not have search string
                        else{
                            searchData += '<tr><td>';
                            searchData += colHeader;
                            searchData += '</td><td>';
                            searchData += colData;
                            searchData += '</td></tr>';
                            $('#searchTable').append(searchData);
                        }
                    }
                    resultCounter++;
                    var searchAppend ='';
                    searchAppend += '<tr><td style="padding:15px;"></td><td style="padding:15px;"></td></tr>';
                    $('#searchTable').append(searchAppend);
                }
            }
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