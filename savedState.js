var express = require('express');
var path = require('path');

//var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var passport = require('passport');
var passportLocal = require('passport-local');

var app = express();
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);

//USER DATA
var usernames = {};
var numUsers = 0;
var colors = ['#AFAFAF', '#BCBCBC', '#FABAAA', "#AAAAAA", "#BBBBBB", '#CCCCCC']

//CONFIGURE APPS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//USE MIDDLEWARE
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(expressSession({ 
	secret: process.env.SESSION_SECRET || 'secret',
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'Public'))); //adds routes to find specific dirs

passport.use(new passportLocal.Strategy(function(username, password, done){
	//You will do something much more sophisticated
	if(username === password){
		done(null, {
			id: username,
			name: username
		});
	} 
	else{
		done(null, null);
	}

}));

passport.serializeUser(function(user, done){
	done(null, user.id);
});

passport.deserializeUser(function(id, done){
	//Query the databae or cache here!
	done(null, {id: id, name: id}); //demo specific
});

//DEFINE ROUTES 
var routes1 = require('./routes/login');
var routes2 = require('./routes/board');
var routes3 = require('./routes/logout');
app.use(routes1);
app.use(routes2);
app.use(routes3);


//var rooms = ['room1', 'room2', 'room3'];

io.on('connection', function(socket){
	console.log('user connected!')
	numUsers++;
	socket.on('target', function(list){
		var index = list[0];
		var numberSubmmitted = list[1];

		var solution = "435269781682571493197834562826195347374682915951743628519326874248957136763418259";
        if(solution[index]==numberSubmmitted){
        	console.log('correct answer received');
        	socket.broadcast.emit('correct', [index, numberSubmmitted]);
        	socket.emit('correct', [index, numberSubmmitted]);
        }
        else if(numberSubmmitted != ''){
        	coloration = colors[4];
        	socket.broadcast.emit('incorrect', [index, numberSubmmitted], '#FF8888');
        	socket.emit('incorrect', [index, numberSubmmitted], '#FF8888');
        }
        else{
        	socket.broadcast.emit('empty', [index, numberSubmmitted]);
        	socket.emit('empty', [index, numberSubmmitted]);
        }
	});

	socket.on('add user', function(username){
		//store the username in socket session 
		socket.username = username;
		++numUsers;
		//PASSPORT PACKAGE!!!
		// socket.emit('login', {
		// 	numUsers: numUsers
		// });

		//echo globally (all clients) that a person has connected
		socket.broadcast.emit('user joined', {
			username: socket.username,
			numUsers: numUsers
		});
	});

	socket.on('disconnect', function(){
		numUsers--;
		// if(addedUser){
		// 	--numUsers;
		// 	socket.broadcast.emit('user left', {
		// 		username: socket.username,
		// 		numUsers: numUsers
		// 	});
		// }
	});
});

//start the server
var port = process.env.PORT || 8000;
http.listen(port, function(){
	console.log('Server Created on port' + port);
});

