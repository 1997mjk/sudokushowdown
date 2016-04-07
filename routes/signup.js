var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var router = express.Router();

router.get('/signup', function(req, res){
	res.render('signup', { 
		title: 'Sign Up'
	});
});

router.post('/signup', function(req,res){
	var user = new User({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		password: req.body.password,
	});
	user.save(function(err){
		if(err){
			var error = 'I Blame Gabor';
			if(err.code === 11000){
				error = 'that email is already taken, try another.';
			}
			res.render('signup', {error: error});
		}
		else{
			res.redirect('/login');
		}

	})

});

module.exports = router;

