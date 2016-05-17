var socket = io();

var room = (int)(Math.random()*1000000);
socket.emit('join', 'temp');
//socket.emit('create', room);