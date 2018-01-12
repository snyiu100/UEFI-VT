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
    
                console.log(data);
                for (i=0; i<rows.length; i++){
                    console.log(rows[i].moduleName, rows[i].moduleGUID);
                }
            } 
        });
    }
});

$('#searchText').keypress(function(e){
    if(e.which == 13){//Enter key pressed
        $('#searchBtn').click();//Trigger search button click event
    }
});