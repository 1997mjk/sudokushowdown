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
// var pg = require('pg');
var cool = require('cool-ascii-faces');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
//mongoose.connect('mongodb://heroku_12345678:random_password@ds029017.mLab.com:29017/heroku_12345678');
var mongodbUri = 'mongodb://heroku_wzd0fsz6:16k5pojt8r5ek7usa5qu672jhs@ds025439.mlab.com:25439/heroku_wzd0fsz6';

// mongoose.connect(process.env.MONGOLAB_URI);
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
	MMR:String
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

io.on('connection', function(socket){
	socket.on('target', function(list){
		var index = list[0];
		var numberSubmmitted = list[1];

		var solution = "435269781682571493197834562826195347374682915951743628519326874248957136763418259";
        if(solution[index]==numberSubmmitted){ //correct answer
        	console.log('correct answer received');
        	socket.broadcast.emit('correct', [index, numberSubmmitted]);
        	socket.emit('correct', [index, numberSubmmitted]);
        }
        else if(numberSubmmitted != ''){ //did not enter anythign
        	var coloration = "#FFFF88";
        	socket.broadcast.emit('incorrect', [index, numberSubmmitted], coloration);
        	socket.emit('incorrect', [index, numberSubmmitted], coloration);
        }
        else{ //wrong number submitted
        	socket.broadcast.emit('empty', [index, numberSubmmitted]);
        	socket.emit('empty', [index, numberSubmmitted]);
        }
	});

	socket.on('add user', function(username){
		//store the username in socket session 
		socket.username = username;

		//echo globally (all clients) that a person has connected
		socket.broadcast.emit('user joined', {
			username: socket.username
		});
	});

	socket.on('disconnect', function(){
		//numUsers--;
		// if(addedUser){
		// 	--numUsers;
		// 	socket.broadcast.emit('user left', {
		// 		username: socket.username,
		// 		numUsers: numUsers
		// 	});
		// }
	});
});

//===============================================
//================START SERVER===================
//===============================================
var port = process.env.PORT || 3000;
http.listen(port, function(){
	console.log('Server Created on port' + port);
});

