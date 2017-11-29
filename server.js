var http = require('http');
var url = require('url');

var server = http.createServer(function(req, res){
    var page = url.parse(req.url).pathname;
    console.log(page);
    res.writeHead(200, {"Content-Type": "text/html"});    
    
    if (page =='/'){
        res.write('You are at the main page');
    }

    else if (page== '/1'){
        res.write('you are at page 1');
    }

    else if (page== '/2'){
        res.write('you are at page 1');
    }

    else{
        res.writeHead(404);
        res.write('you are at a wrong page');
    }
    
    
 /*   
    res.write('<!DOCTYPE html>'+
    '<html>'+
    ' <head>'+
    ' <meta charset="utf-8" />'+
    ' <title>My Node.js page!</title>'+
    ' </head>'+ 
    ' <body>'+
    ' <p>Here is a paragraph of <strong>HTML</strong>!</p>'+
    ' </body>'+
    '</html>');*/

    res.end();
});

server.on('close', function() { // We listened to the close event
    console.log('Goodbye!');
})

server.listen(8080); // Starts the server

server.close(); // Stops the server. Triggers the close event

//It creates a mini web server which sends a "Hi everybody" message in every case, regardless of the page requested. This server is launched on the 8080 port on the last line.
// send back the code 200 in the heading of the response, which tells the server "It’s OK everything’s fine" (we could, for example, have replied 404 if the requested page didn’t exist

