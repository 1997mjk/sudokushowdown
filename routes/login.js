var express = require('express');
var passport = require('passport');
var flash = require('connect-flash');
var router = express.Router();

router.get('/login', function(req, res){
	res.render('login', { //login.ejs
		title: 'Log In',
		isAuthenticated: req.isAuthenticated(),
		user: req.user
	});
});

router.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
	}
));

module.exports = router;