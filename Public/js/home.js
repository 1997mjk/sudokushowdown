$(document).ready(function () {
	var socket = io ();
	socket.emit('join', 'lobby');
	//socket.emit('create', room);
	function createRoom(){
		alert('hi');
		var randomRoomName = parseInt(Math.random()*1000000) +"";
		socket.emit('createRoom', randomRoomName);		
	}


});

