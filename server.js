function startServer(){
	//process.env.EDGE_NATIVE = "./native/win32/ia32/4.1.1/edge_nativeclr";
	var self = this;
	var express = require('express');
	var app = express();
	var http = require('http').Server(app);
	var io = require('socket.io')(http);
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
	
	app.get('/', function(req, res){
		res.sendFile(__dirname + '/index.html');
	});
	
	app.get('/index.html', function(req, res){
		res.sendFile(__dirname + '/index.html');
	});

	app.use('/index_files', express.static('index_files'));
	app.use('/assets', express.static('assets'));
	
	//404
	app.use(function(req, res, next) {
		res.status(404).send('404: Sorry cant find that!');
	});
		
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
	
	//http.listen(port, 511, function(){
	http.listen(3000, "localhost", function(){
		console.log('listening on ' + 3000);
	});
}
startServer();