var searchStr ='';
var filterAll = true;
var filterUploadName = false;
var filterUploadChecksum = false;
var filterAnalysisName = false;
var filterAnalysisReport = false;
var filterModuleName = false;
var filterModuleGUID = false;
var filterModuleMD5 = false;
var filterModuleSHA1 = false;
var filterModuleSHA256 = false;

var filterLabel = document.getElementById('filterLabel');

console.log("filterAll:"+filterAll+"\r\nfilterUploadName:"+filterUploadName+"\r\nfilterUploadChecksum:"+filterUploadChecksum
                +"\r\nfilterAnalysisName:"+filterAnalysisName+"\r\nfilterAnalysisReport:"+filterAnalysisReport
                +"\r\nfilterModuleName:"+filterModuleName+"\r\nfilterModuleGUID:"+filterModuleGUID
                +"\r\nfilterModuleMD5:"+filterModuleMD5+"\r\nfilterModuleSHA1:"+filterModuleSHA1+"\r\nfilterModuleSHA256:"+filterModuleSHA256);

$('#checkAll').on('click', function(){
    filterAll = true;
    filterUploadName = false;
    filterUploadChecksum = false;
    filterAnalysisName = false;
    filterAnalysisReport = false;
    filterModuleName = false;
    filterModuleGUID = false;
    filterModuleMD5 = false;
    filterModuleSHA1 = false;
    filterModuleSHA256 = false;
    $('#checkUploadName').prop('checked', false);
    $('#checkUploadChecksum').prop('checked', false);
    $('#checkAnalysisName').prop('checked', false);
    $('#checkAnalysisReport').prop('checked', false);
    $('#checkModuleName').prop('checked', false);
    $('#checkModuleGUID').prop('checked', false);
    $('#checkModuleMD5').prop('checked', false);
    $('#checkModuleSHA1').prop('checked', false);
    $('#checkModuleSHA256').prop('checked', false);
});

$('.filterCheck').on('click', function(){
    if ($('#checkUploadName').is(':checked')){
        filterUploadName = true;
        filterAll = false;
        $('#checkAll').prop('checked', false);
    }
    if ($('#checkUploadChecksum').is(':checked')){
        filterAll = false;
        filterUploadChecksum = true;
        $('#checkAll').prop('checked', false);
    }
    if ($('#checkAnalysisName').is(':checked')){
        filterAll = false;
        filterAnalysisName = true;
        $('#checkAll').prop('checked', false);
    }
    if ($('#checkAnalysisReport').is(':checked')){
        filterAll = false;
        filterAnalysisReport = true;
        $('#checkAll').prop('checked', false);
    }
    if ($('#checkModuleName').is(':checked')){
        filterAll = false;
        filterModuleName = true;
        $('#checkAll').prop('checked', false);
    }
    if ($('#checkModuleGUID').is(':checked')){
        filterAll = false;
        filterModuleGUID = true;
        $('#checkAll').prop('checked', false);
    }
    if ($('#checkModuleMD5').is(':checked')){
        filterAll = false;
        filterModuleMD5 = true;
        $('#checkAll').prop('checked', false);
    }
    if ($('#checkModuleSHA1').is(':checked')){
        filterAll = false;
        filterModuleSHA1 = true;
        $('#checkAll').prop('checked', false);
    }
    if ($('#checkModuleSHA256').is(':checked')){
        filterAll = false;
        filterModuleSHA256 = true;
        $('#checkAll').prop('checked', false);
    }

    if (!$('#checkUploadName').is(':checked')){
        filterUploadName = false;
    }
    if (!$('#checkUploadChecksum').is(':checked')){
        filterUploadChecksum = false;
    }
    if (!$('#checkAnalysisName').is(':checked')){
        filterAnalysisName = false;
    }
    if (!$('#checkAnalysisReport').is(':checked')){
        filterAnalysisReport = false;
    }
    if (!$('#checkModuleName').is(':checked')){
        filterModuleName = false;
    }
    if (!$('#checkModuleGUID').is(':checked')){
        filterModuleGUID = false;
    }
    if (!$('#checkModuleMD5').is(':checked')){
        filterModuleMD5 = false;
    }
    if (!$('#checkModuleSHA1').is(':checked')){
        filterModuleSHA1 = false;
    }
    if (!$('#checkModuleSHA256').is(':checked')){
        filterModuleSHA256 = false;
    }

    console.log("filterAll:"+filterAll+"\r\nfilterUploadName:"+filterUploadName+"\r\nfilterUploadChecksum:"+filterUploadChecksum
                +"\r\nfilterAnalysisName:"+filterAnalysisName+"\r\nfilterAnalysisReport:"+filterAnalysisReport
                +"\r\nfilterModuleName:"+filterModuleName+"\r\nfilterModuleGUID:"+filterModuleGUID
                +"\r\nfilterModuleMD5:"+filterModuleMD5+"\r\nfilterModuleSHA1:"+filterModuleSHA1+"\r\nfilterModuleSHA256:"+filterModuleSHA256);
});

$('#searchBtn').click(function(){

    $('#searchResultsDiv').hide('slow');
    $("#searchTableBody tr").remove();
    $('#numOfResults').text('');
    $('#filterLabel').text('');
    $('.pager').remove();

    searchStr = $('#searchText').val();

    //check for whitespace
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
    $('#filterLabel').text('Filtering by: ');

    if (filterAll==false && filterUploadName==false && filterUploadChecksum==false && filterAnalysisName==false
        && filterAnalysisReport==false && filterModuleName==false && filterModuleGUID==false
        && filterModuleMD5==false && filterModuleSHA1==false && filterModuleSHA256==false){
            filterAll = true;
    }

    if (searchStr.length==1){
        filterAll = false;
        filterUploadName = false;
        filterUploadChecksum = false;
        filterAnalysisName = false;
        filterAnalysisReport = false;
        filterModuleName = true;
        filterModuleGUID = false;
        filterModuleMD5 = false;
        filterModuleSHA1 = false;
        filterModuleSHA256 = false;
    }

    if (filterAll==true){
        filterLabel.insertAdjacentHTML('beforeend'," - All");        
    }
    if (filterUploadName==true){
        filterLabel.insertAdjacentHTML('beforeend'," - Upload Name");        
    }
    if (filterUploadChecksum == true){
        filterLabel.insertAdjacentHTML('beforeend'," - Upload Checksum");        
    }
    if (filterAnalysisName == true){
        filterLabel.insertAdjacentHTML('beforeend'," - Analysis Name");        
    }
    if (filterAnalysisReport == true){
        filterLabel.insertAdjacentHTML('beforeend'," - Analysis Report");        
    }
    if (filterModuleName == true){
        if (searchStr.length==1){
            filterLabel.insertAdjacentHTML('beforeend'," - Module Name (When search length is 1, search defaults to Module Name only)");        
        }
        else{
            filterLabel.insertAdjacentHTML('beforeend'," - Module Name");        
        }
    }
    if (filterModuleGUID == true){
        filterLabel.insertAdjacentHTML('beforeend'," - Module GUID");        
    }
    if (filterModuleMD5 == true){
        filterLabel.insertAdjacentHTML('beforeend'," - Module MD5");        
    }
    if (filterModuleSHA1 == true){
        filterLabel.insertAdjacentHTML('beforeend'," - Module SHA1");        
    }
    if (filterModuleSHA256 == true){
        filterLabel.insertAdjacentHTML('beforeend'," - Module SHA256");        
    }

    var sendData = JSON.stringify({searchStr: searchStr,
                                   searchAll: filterAll,
                                   searchUploadName: filterUploadName,
                                   searchUploadChecksum: filterUploadChecksum,
                                   searchAnalysisName: filterAnalysisName,
                                   searchAnalysisReport: filterAnalysisReport,
                                   searchModuleName: filterModuleName,
                                   searchModuleGUID: filterModuleGUID,
                                   searchModuleMD5: filterModuleMD5,
                                   searchModuleSHA1: filterModuleSHA1,
                                   searchModuleSHA256: filterModuleSHA256});
    
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
            var searchTableBody = document.getElementById('searchTableBody');
            var searchTable = document.getElementById('searchTable');
            var numOfResults = document.getElementById('numOfResults');

            console.log(rows);

            if(rows.length==0){
                var searchData='';

                searchData += '<tr><td colspan="2" style="padding:5px"></td></tr>';
                console.log(searchData);
                //$('#searchTableBody').append(searchData);
                searchTableBody.insertAdjacentHTML('beforeend', searchData);
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

                        if (colHeader === "Upload Date"){
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
                                //$('#searchTableBody').append(searchData);
                                searchTableBody.insertAdjacentHTML('beforeend', searchData);
                            }
                            else if (colHeader =="Analysis Report"){
                                searchData += '<tr><td class="scol1 hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" >';
                                searchData += colHeader;
                                searchData += '</div></td><td class="scol2 hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" ><b>';
                                searchData += 'Exists in the report';
                                searchData += '</div></b></td></tr>';
                                //$('#searchTableBody').append(searchData);
                                searchTableBody.insertAdjacentHTML('beforeend', searchData);
                            }
                            else if (colHeader == "Upload Date"){ //Does not include Date in search
                                searchData += '<tr><td class="scol1 hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" >';
                                searchData += colHeader;
                                searchData += '</div></td><td class="dateCol hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" >';
                                searchData += colData;
                                searchData += '</div></td></tr>';
                                //$('#searchTableBody').append(searchData);
                                searchTableBody.insertAdjacentHTML('beforeend', searchData);
                            }
                            else{
                                searchData += '<tr><td class="scol1 hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" >';
                                searchData += colHeader;
                                searchData += '</div></td><td class="scol2 hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" ><b>';
                                searchData += colData;
                                searchData += '</div></b></td></tr>';
                                //$('#searchTableBody').append(searchData);
                                searchTableBody.insertAdjacentHTML('beforeend', searchData);
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
                                //$('#searchTableBody').append(searchData);
                                searchTableBody.insertAdjacentHTML('beforeend', searchData);
                            }
                            else if (colHeader == "Upload Date"){
                                searchData += '<tr><td class="scol1 hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" >';
                                searchData += colHeader;
                                searchData += '</div></td><td class="dateCol hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" >';
                                searchData += colData;
                                searchData += '</div></td></tr>';
                                //$('#searchTableBody').append(searchData);
                                searchTableBody.insertAdjacentHTML('beforeend', searchData);
                            }
                            else if (colHeader =="Analysis Report"){
                                searchData = '<tr><td class="scol1 hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" >' +colHeader +'</div></td><td class="scol2 hiddenRow"><div class="accordion-body collapse search'  +resultCounter +'" > Not in the report </div></td></tr>';
                                //$('#searchTableBody').append(searchData);
                                searchTableBody.insertAdjacentHTML('beforeend', searchData);
                            }
                            else{
                                searchData += '<tr><td class="scol1 hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" >';
                                searchData += colHeader;
                                searchData += '</div></td><td class="scol2 hiddenRow"><div class="accordion-body collapse search' +resultCounter +'" >';
                                searchData += colData;
                                searchData += '</div></td></tr>';
                                //$('#searchTableBody').append(searchData);
                                searchTableBody.insertAdjacentHTML('beforeend', searchData);
                            }
                        }
                    }
                    var searchAppend = '<tr class="endRow"><td style="padding:15px;" colspan="2"></td></tr>';
                    //$('#searchTableBody').append(searchAppend);
                    searchTableBody.insertAdjacentHTML('beforeend', searchAppend);
                }
            }

            var pageContent = [];
            var startRow = [];
            var totalRows = [];
            var lastRow = [];
            var pageContentCounter=0;
            startRow[0] = -1;
            lastRow[0] = -1;
            var numVar = 10; //number of results per page

            for (var i =0; i < resultCounter; i++){
                if (i % numVar === 0){
                    pageContentCounter++; // paging counter

                    startRow[pageContentCounter] = lastRow[pageContentCounter-1] + 1; //get first row num of page content

                    pageContent[pageContentCounter] = $(".searchHeader:eq("+i+")").nextUntil( ".endRow:eq("+(i+(numVar)-1)+")" ).addBack(); //object: select 1st AnalysisName to last endRow

                    totalRows[pageContentCounter] = pageContent[pageContentCounter].length; //get total number of rows of content

                    lastRow[pageContentCounter] = startRow[pageContentCounter] + totalRows[pageContentCounter]; //get num of last row content
                    console.log(pageContentCounter+"sheck: startNum"+startRow[pageContentCounter]+",totalLen"+totalRows[pageContentCounter]+",lastNum"+lastRow[pageContentCounter]);
                }
            }
            
            $('#searchTableBody').each(function() {
                var currentPage = 1;
                var $table = $(this);
                    
                $table.on('repaginate', function() {
                    $table.find('tr').hide().slice(startRow[currentPage], lastRow[currentPage]).show();
                });

                $table.trigger('repaginate');
                var numPages = pageContentCounter;
                var $pager = $('<div class="pager"></div>');
                for (var page = 1; page <= numPages; page++) {
                    $('<span class="page-number"></span>').text(page).on('click', {
                        newPage: page}, function(event) {
                            currentPage = event.data['newPage'];

                            $table.trigger('repaginate');
                            $(this).addClass('active').siblings().removeClass('active');
                        }).appendTo($pager).addClass('clickable');
                }
                $pager.insertBefore(searchTable).find('span.page-number:first').addClass('active');
            });

            numOfResults.insertAdjacentHTML('beforeend',"Found "+resultCounter +" matches");
            //$('#numOfResults').append("Found "+resultCounter +" matches");
            toggleView();
        }
    });
}

function toggleView(){
    $('#preloadSearch').hide('slow');
    $('#searchResultsDiv').show('slow');
}

//https://stackoverflow.com/questions/17524290/how-to-check-for-string-having-only-spaces-in-javascript
//http://jsfiddle.net/LiquidSky/djav37tg/