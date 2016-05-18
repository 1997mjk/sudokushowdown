var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var logger = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var passportLocal = require('passport-local');
var flash = require('connect-flash');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);
var cool = require('cool-ascii-faces');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var uuid = require('node-uuid');
var Room = require('./room.js');

//MONGO CONNECTION
var mongodbUri = 'mongodb://heroku_wzd0fsz6:16k5pojt8r5ek7usa5qu672jhs@ds025439.mlab.com:25439/heroku_wzd0fsz6';
mongoose.connect(mongodbUri);
var db = mongoose.connection;
var userSchema = mongoose.Schema({
	firstName: String,
	lastName: String,
	email: {type: String, unique: true},
	username: {type: String, unique: true},
	password: String,
	win: String,
	loss: String,
	draw: String,
	MMR: String
});
userSchema.methods.validPassword = function( pwd ) {
    // EXAMPLE CODE!
    return ( this.password === pwd );
};
var User = mongoose.model('Users', userSchema);


//===============================================
//================CONFIGURATION==================
//===============================================


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(expressSession({ 
	secret: process.env.SESSION_SECRET || 'supernova',
	resave: true,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'Public'))); //adds routes to find specific dirs


passport.use(new passportLocal.Strategy(function(username, password, done){ //'local' by default if not specified before new passportLocal
	User.findOne({ username: username }, function(err, user){
		if(err){
			// res.render('login', {error: 'Invalid username'});
			return done(err);
		}
		if(!user){
			return done(null, false, {message: 'Incorrect username.'});
		}
		if (!user.validPassword(password)) { //NOTE FOR MONDAY: FIX THIS VALID PASSWORD SHIT THE ONLY ERROR!!!
        	return done(null, false, { message: 'Incorrect password.' });
      	}

      	return done(null, user);
	});
}));

passport.serializeUser(function(user, done){
	done(null, user.id);
});

passport.deserializeUser(function(id, done){
	User.findById(id, function(err, user) {
        done(err, user);
    });
});

//===============================================
//================ROUTES=========================
// ===============================================
var routes1 = require('./routes/login');
var routes2 = require('./routes/board');
var routes3 = require('./routes/logout');
var routes4 = require('./routes/home');
// var routes5 = require('./routes/signup');
app.use(routes1);
app.use(routes2);
app.use(routes3);
app.use(routes4);
// app.use(routes5);

//bonus emoji!!!
app.get('/cool', function(req, res) {
  res.send(cool());
});

app.get('/signup', function(req, res){
	res.render('signup', { 
		title: 'Sign Up'
	});
});

app.post('/signup', function(req,res){
	console.log('succesfully logged');
	var user = new User({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		username: req.body.username,
		email: req.body.email,
		password: req.body.password,
		win: '0',
		loss: '0',
		draw: '0',
		MMR: '1000'
	});

	user.save(function(err){
		console.log('saving');
		if(err){
			var error = 'I Blame Gabor';
			if(err.code === 11000){
				error = 'that email is already taken, try another.';
			}
			res.render('signup', {error: error});
			console.log('Email Error');
		}
		else{
			console.log('redirecting');
			res.redirect('/login');
		}

	});
	console.log('gg');
});

//===============================================
//===================SOCKET======================
//===============================================
var people = {}; 
var rooms = {};
var clients = [];

var colorChoices = ['#FF0000', '#FF7F00', '#0000FF', '#4B0082', '#008000'];
//red, orange, blue, purple, dark green

io.on('connection', function(socket){
	socket.on('createRoom', function(name){
		if(people[socket.id].room === null){
			var id = uuid.v4();
			console.log('uuid generated: ' + id);
			var room = new Room(name, id, socket.id, 0);
			rooms[id] = room;
			// io.sockets.emit('roomList', {rooms: rooms}); //update the list of rooms on the frontend

		    socket.room = name; //name the room
		    socket.join(socket.room); //auto-join the creator to the room
		    room.addPerson(socket.id); //also add the person to the room object
		    people[socket.id].room = id; //update the room key with the ID of the created room
		    people[sokcet.id].colorChoice = colorChoices[0]; 

		}else{
			console.log('you have already created a room');
			// socket.sockets.emit("update", "You have already created a room.");
		}
	});

	socket.on('joinRoom', function(id){
		var room = rooms[id];
		if(socket.id === room.owner){
			// socket.emit('update', "you are already the owner");
		}
		else{
			room.people.contains(socket.id, function(found){
				if(found){
					// socket.emit('update', "you have already joined");
					console.log('you have already joined');
				}
				else{
					if (people[socket.id].inroom !== null) { //make sure that one person joins one room at a time
              			// socket.emit("update", "You are already in a room ("+rooms[people[socket.id].inroom].name+"), please leave it first to join another room.");
   					}
   					else{
   						room.addPerson(socket.id);
   						people[socket.id].inroom = id;
   						room.number = (room.number + 1); //update number of people in room
   						people[socket.id].colorChoice = colorChoices[room.number];
   						socket.room = room.name;
   						socket.join(socket.room);
   						var user = people[socket.id];
   						// io.sockets.in(socket.room).emit('update', user.name + " has connected to " + room.name + " room.");
			        	// socket.emit('update', "Welcome to " + room.name + ".");
			        	// socket.emit("sendRoomID", {id: id});
      
   					}
				}
			});
		}
	});

	socket.on('leaveRoom', function(id){
		var room = rooms[id];
		if(socket.id===room.owner){
			var i = 0;
			while(i < clients.length){
				if(clients[i].id == room.people[i]){
					people[clients[i].id].inroom = null;
					clients[i].leave(room.name);
				}
				++i;
			}
			delete rooms[id];
			people[room.owner].owns = null;
			// io.sockets.emit('roomList', {rooms:rooms});
			// io.sockets.in(socket.room).emit('update', "owner left");
		} else{
			room.people.contains(socket.id, function(found){
				if (found) { //make sure that the client is in fact part of this room
		          var personIndex = room.people.indexOf(socket.id);
		          room.people.splice(personIndex, 1);
		          room.number = (room.number - 1);
		          // io.sockets.emit("update", people[socket.id].name + " has left the room.");
		          socket.leave(room.name);
		        }
			});
		}
	});

	socket.on('join',  function(name){
		console.log('server joined');
		console.log('server joined');
		console.log('server joined');
		people[socket.id] = {"name" : name, "room" : null, "colorChoice" : null, "owns" : null, "inroom" : null}
		// socket.emit('update', 'you have connected to the server');
		// io.sockets.emit('update', people[client.id].name + " is online.")
	 //    io.sockets.emit('update-people', people);
	    // socket.emit('roomList', {rooms: rooms});
	    clients.push(socket); //populate the clients array with the client object

	});

	socket.on('target', function(list){
		var index = list[0];
		var numberSubmitted = list[1];

		var solution = "435269781682571493197834562826195347374682915951743628519326874248957136763418259";
        if(solution[index]==numberSubmitted){ //correct answer
        	console.log('correct answer received from: ' + socket.id + "at " + socket.room);
        	socket.broadcast.to(socket.room).emit('correct', [index, numberSubmitted]);
        	socket.to(socket.room).emit('correct', [index, numberSubmitted]);
        	// socket.broadcast.emit('correct', [index, numberSubmitted]);
        	// socket.emit('correct', [index, numberSubmitted]);
        	// io.sockets.in(socket.room).emit('correct', [index, numberSubmitted]);

        	
        }
        else if(numberSubmitted != ''){ //did not enter anythign
        	var coloration = people[socket.id].colorChoice;
        	// socket.broadcast.emit('incorrect', [index, numberSubmitted], coloration);
        	// socket.emit('incorrect', [index, numberSubmitted], coloration);
        	io.sockets.in(socket.room).emit('incorrect', [index, numberSubmitted], coloration);
        }
        else{ //wrong number submitted
        	// socket.broadcast.emit('empty', [index, numberSubmitted]);
        	// socket.emit('empty', [index, numberSubmitted]);
        	io.sockets.in(socket.room).emit('empty', [index, numberSubmitted]);
        }
	});

	
	socket.on('disconnect', function(){
		if(people[socket.id]){
			if(people[socket.id].inroom === null){
				// io.sockets.emit('update', 'someone left');
				delete people[socket.id];
				// io.sockets.emit('update-people', people);
			}else{
				if(people[socket.id].owns != null){
					var room = rooms[people[socket.id].owns];
					if(socket.id === room.owner){
						var i = 0;
						while(i < clients.length){
							if(clients[i].id == room.people[i]){
								people[clients[i].id].inroom = null;
								clients[i].leave(room.name);
							}
							++i;
						}
						delete rooms[people[socket.id].owns];
					}
				}
				delete people[socket.id];
				// io.sockets.emit('update-people', people);
				io.sockets.emit('roomList', {rooms: rooms});

			}
		}
	});
});

Array.prototype.contains = function(k, callback) {  
    var self = this;
    return (function check(i) {
        if (i >= self.length) {
            return callback(false);
        }
        if (self[i] === k) {
            return callback(true);
        }
        return process.nextTick(check.bind(null, i+1));
    }(0));
};

//===============================================
//================START SERVER===================
//===============================================
var port = process.env.PORT || 3000;
http.listen(port, function(){
	console.log('Server Created on port' + port);
});

