var socket = io();

var randomRoom = (int)(Math.random()*1000000);
socket.emit('join', 'lobby');
//socket.emit('create', room);

