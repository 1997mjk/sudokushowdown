$(document).ready(function () {
	var socket = io();
	
	
	//alert('username: ' + user + " and win is: " + win);
	function loadUser(){
		var name = documenet.getElementById('username');
		alert(name);
		console.log('joining lobby');
		socket.emit('join', 'lobby');
	}
	
	//socket.emit('create', room);

	// $button.delegate('#create', 'click', function(){
	// 	alert('hi');
	// 	var randomRoomName = parseInt(Math.random()*1000000) +"";
	// 	socket.emit('createRoom', randomRoomName);	
	// });
    $("#createRoom").click( function(){
       	var randomRoomName = parseInt(Math.random()*1000000) +"";
       	alert('random room created');
		socket.emit('createRoom', randomRoomName);
		window.location.href='/board';
    });

	loadUser();

});

