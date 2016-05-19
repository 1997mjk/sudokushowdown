$(document).ready(function () {
	var socket = io();
	
	// socket.emit('join', 'lobby');
	
	//socket.emit('create', room);

	// $button.delegate('#create', 'click', function(){
	// 	alert('hi');
	// 	var randomRoomName = parseInt(Math.random()*1000000) +"";
	// 	socket.emit('createRoom', randomRoomName);	
	// });
    $("#createRoom").click( function(){
    	
    	window.location.href='/board';
    });

    $("#joinGame").click( function(){
    	//socket.emit('roomJoin'); //add +1 to shit and giggles
    	window.location.href ='/board';
    });

    socket.on('roomList', function(name){
    	console.log('updating rooms');
    	var roomDiv = "<li><div class='panel panel-primary'><div class='panel-heading'><div class='row'><div class='col-xs-4'><i class='fa fa-users fa-5x'></i></div><div class='col-xs-4 text-center'><div class='huge'>"+ $(boardDimension).val() +"</div></div><div class='col-xs-4 text-right'><div class='huge'>1/"+ $(playerNumber).val() +"</div><div id='creator'>Room: "+name+"</div></div></div></div><a href='#''><div class='panel-footer'><span class='pull-left' id='joinGame'>Join Game!</span><span class='pull-right'><i class='fa fa-arrow-circle-right'></i></span><div class='clearfix'></div></div></a></div></li>";
    	// var roomDiv = "<div>MumeiLover404</div>";
    	$(roomDiv).hide().appendTo("#activeRoomsTimeline").fadeIn(1000);
	});
});

