function startServer(){
	//process.env.EDGE_NATIVE = "./native/win32/ia32/4.1.1/edge_nativeclr";
	
	const express = require('express');
	const socketIO = require('socket.io');
	const path = require('path');
	const fs = require('fs');

	const PORT = process.env.PORT || 3000;
	const INDEX = path.join(__dirname, 'index.html');

	const server = express();

	server.get('/', function(req, res){
        res.sendFile(__dirname + '/index.html');
    });
    
    server.get('/index.html', function(req, res){
        res.sendFile(__dirname + '/index.html');
    });

    server.use('/index_files', express.static('index_files'));
    server.use('/assets', express.static('assets'));
	
	var sockets = {};
	var names;
	if (fs.existsSync('./data.json')) {
		names = require('./data.json');
	} else{
		names = require('./names.json');
		for (var property in names) {
			if (names.hasOwnProperty(property)) {
				var tnum = names[property];
				names[property] = {
					"tnum" : tnum,
					"reg" : false
				};
			}
		}
	}
	

	const io = socketIO(server.listen(PORT, () => console.log(`Listening on ${ PORT }`)));

	var update = function(){
		fs.writeFile('./data.json', JSON.stringify(names) , 'utf-8');
		for (var socketID in sockets) {
			if (sockets.hasOwnProperty(socketID)) {
				sockets[socketID].emit('names', names);
			}
		}
	};
	
	io.on('connection', function(socket){
		console.log(socket.id + " connected");
		sockets[socket.id] = socket;
		socket.emit('names', names);
		
		socket.on('disconnect', function() {
			console.log(socket.id + " disconnected");
			delete sockets[socket.id];
		});
		
		socket.on('send', function(name){
			if(!(name[0] in names)){
				return;
			}
			names[name[0]].reg = name[1];
			update();
		});
	
	});
	
}
startServer();