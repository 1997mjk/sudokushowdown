$(document).ready(function () {
	var socket = io();
	var $button = $legend.find('#create');


	socket.emit('join', 'lobby');
	//socket.emit('create', room);
	$button.delegate('#create', 'click', function(){
		alert('hi');
		var randomRoomName = parseInt(Math.random()*1000000) +"";
		socket.emit('createRoom', randomRoomName);	
	});




});

