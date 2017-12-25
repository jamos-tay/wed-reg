function startServer(){
	//process.env.EDGE_NATIVE = "./native/win32/ia32/4.1.1/edge_nativeclr";
	var names = require('./names.json');
	var sockets = [];
	for (var property in names) {
		if (names.hasOwnProperty(property)) {
			var tnum = names[property];
			names[property] = {
				"tnum" : tnum,
				"reg" : false
			};
		}
	}
	
	const express = require('express');
	const socketIO = require('socket.io');
	const path = require('path');

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

	


	const io = socketIO(server.listen(PORT, () => console.log(`Listening on ${ PORT }`)));
	
	console.log(names);

	var disseminate = function(){
		for(var i = 0; i < sockets.length; i++){
			sockets[i].emit('names', names);
		}
	};
	
	io.on('connection', function(socket){
		console.log("connected" + socket);
		sockets.push(socket);
		socket.emit('names', names);
			
		socket.on('send', function(name){
			console.log(name);
			if(!(name in names)){
				return;
			}
			names[name].reg = true;
			disseminate();
		});
	
	});
	
}
startServer();