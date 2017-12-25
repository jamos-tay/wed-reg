var game = require('./serverjs/Game.js')();

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 3000;                    //heroku port or default port 3000

app.get('/', function(req, res){                        //response handler
    res.sendFile(__dirname + '/index.html');            //default response
});
app.use('/assets', express.static('assets'));           //serve the assets folder
app.use('/js', express.static('js'));                   //serve the js folder
//404
app.use(function(req, res, next) {                      //404 response handler
    res.status(404).send('404: Sorry cant find that!'); //basic 404 response
});


io.on('connection', function(socket){                   //socket.io on connection to client

    game.addPlayer(socket);                               //someone joins on io.on('connection', ...

    setInterval(function () {                           //send out the list of connected sockets to all sockets
        if (game.usercount > 0) {
            socket.emit('userhashmap', game.userhashmap);
        }
    }, 100);                                            //every 100 ms

    socket.on('disconnect', function() {                //someone leaves on socket.on('disconnect', ...
        game.removePlayer(socket);
    });
	
	socket.on('receive', function(msg){
		game.receivePacket(socket, msg);
	});
});

http.listen(port, function(){                           //http serving
    console.log('listening on ' + port);
});