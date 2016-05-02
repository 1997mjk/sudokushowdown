var express = require('express');
var router = express.Router();
// var mongoose = require('mongoose');

//MONGO CONNECTION
// var mongodbUri = 'mongodb://heroku_wzd0fsz6:16k5pojt8r5ek7usa5qu672jhs@ds025439.mlab.com:25439/heroku_wzd0fsz6';

// mongoose.connect(mongodbUri);
// var db = mongoose.connection;

// var userSchema = mongoose.Schema({
// 	firstName: String,
// 	lastName: String,
// 	email: {type: String, unique: true},
// 	username: {type: String, unique: true},
// 	password: String,
// 	win: String,
// 	loss: String,
// 	draw: String,
// 	MMR: String
// });
// userSchema.methods.validPassword = function( pwd ) {
//     // EXAMPLE CODE!
//     return ( this.password === pwd );
// };
// var User = mongoose.model('Users', userSchema);

router.get('/', ensureAuthenticated, function(req, res){
	res.render('home', { //guestBoard.ejs
		title: 'Home Page',
		// username: User.username,
		// win: User.win,
		// loss: User.loss,
		// draw: User.draw,
		// MMR: User.MMR,
		isAuthenticated: req.isAuthenticated(),
		user: req.user.username,
		win: req.user.win,
		loss: req.user.loss,
		draw: req.user.draw,
		MMR: req.user.MMR
		
	});
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		next();
	}
	else{
		res.redirect('/login');
	}
};

module.exports = router;