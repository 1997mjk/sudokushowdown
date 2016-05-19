$(document).ready(function () {
	var socket = io();

    $("#createRoom").click( function(){
    	socket.emit('updateRooms', $(playerNumber).val());
    	window.location.href='/board';

    });

    socket.on('roomList', function(playerNumber){
    	console.log('updating rooms');
    	var roomDiv = "<li><div class='panel panel-primary'><div class='panel-heading'><div class='row'><div class='col-xs-4'><i class='fa fa-users fa-5x'></i></div><div class='col-xs-4 text-center'><div class='huge'>"+ $(boardDimension).val() +"</div></div><div class='col-xs-4 text-right'><div class='huge'>1/"+ playerNumber +"</div><div id='creator'>Room: 9126304</div></div></div></div><a href='/board'><div class='panel-footer'><span class='pull-left' id='joinRoom'>Join Game!</span><span class='pull-right'><i class='fa fa-arrow-circle-right'></i></span><div class='clearfix'></div></div></a></div></li>";
    	$(roomDiv).hide().appendTo("#activeRoomsTimeline").fadeIn(1000);
	});
});

