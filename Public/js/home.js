$(document).ready(function () {
	var socket = io();
	
	socket.emit('join', 'lobby');

	
	//socket.emit('create', room);

	// $button.delegate('#create', 'click', function(){
	// 	alert('hi');
	// 	var randomRoomName = parseInt(Math.random()*1000000) +"";
	// 	socket.emit('createRoom', randomRoomName);	
	// });
    $("#createRoom").click( function(){
       	var randomRoomName = parseInt(Math.random()*1000000) +"";
       	var name = documenet.getElementById('username');
       	alert('random room created: ' + name);
		socket.emit('createRoom', randomRoomName);
		window.location.href='/board';
    });


});

