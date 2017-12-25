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

	const server = express()
	  .use((req, res) => res.sendFile(INDEX) )
	  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

	const io = socketIO(server);
	
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