$('#searchBtn').click(function(){
  
    console.log("value is:" +document.getElementById('searchText').value +"end");
    var searchStr = $('#searchText').val();

    if (searchStr == ""){
        console.log("string not defined");
        return;
    }

    else {
        console.log("searach2" +searchStr);
        
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

                for (var i=0; i<rows.length; i++){
                    columnCounter =0;
                    newJson = rows[i];
                    console.log(newJson);

                    for (var column in newJson) {
                        console.log("columnName is: "+column);
                        console.log("info is: "+newJson[column]);
                        columnCounter++;
                    }
                    resultCounter++;
                }

                console.log("num of results: "+resultCounter);
                console.log("num of columns: "+columnCounter);

                
            } 
        });
    }
});

$('#searchText').keypress(function(e){
    if(e.which == 13){//Enter key pressed
        $('#searchBtn').click();//Trigger search button click event
    }
});