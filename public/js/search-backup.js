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
                    console.log("enter for");
                    columnCounter =0;
                    newJson = rows[i];

                    for (var column in newJson) {
                        var searchData='';
                        console.log("columnName is: "+column);
                        console.log("info is: "+newJson[column]);
                        columnCounter++;

                        var colHeader = column;
                        var colData = newJson[column];

                        if (colData.includes("<") || colData.includes(">")) {
                            colData = colData.replace(/\</g, "&lt;");
                            colData = colData.replace(/\>/g, "&gt;");
                        }

                        if (colData.toLowerCase().includes(searchStr.toLowerCase())){
                            searchData += '<tr><td>';
                            searchData += colHeader;
                            searchData += '</td><td><b>';
                            searchData += colData;
                            searchData += '</b></td></tr>';
                            console.log(searchData);
                            $('#searchTable').append(searchData);
                        }
                        else{
                            searchData += '<tr><td>';
                            searchData += colHeader;
                            searchData += '</td><td>';
                            searchData += colData;
                            searchData += '</td></tr>';
                            console.log(searchData);
                            $('#searchTable').append(searchData);
                        }
                    }
                    console.log("num of columns: "+columnCounter);
                    resultCounter++;
                    var searchAppend ='';
                    searchAppend += '<tr><td style="padding:15px;"></td><td style="padding:15px;"></td></tr>';
                    $('#searchTable').append(searchAppend);
                }
            }
            console.log("num of results: "+resultCounter);
            $('#numOfResults').append("Found "+resultCounter +" matches");
        } 
    });
    toggleView();
}

function toggleView(){
    $('#preloadSearch').hide('slow');
    $('#searchResultsDiv').show('slow');

    /* $('#preloadSearch').hide('slow', function(){
        $('#searchResultsDiv').show('slow');
    }); */
}

//https://stackoverflow.com/questions/17524290/how-to-check-for-string-having-only-spaces-in-javascript