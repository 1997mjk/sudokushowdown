
	var socket = io();


	socket.emit('join', 'lobby');
	//socket.emit('create', room);

	function createRoom(){
		var randomRoomName = parseInt(Math.random()*1000000)) +"";
		alert(randomRoomName);
		socket.emit('createRoom', randomRoomName);
				
	}


