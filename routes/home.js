var express = require('express');
var router = express.Router();

router.get('/', ensureAuthenticated, function(req, res){
	res.render('home', { //guestBoard.ejs
		title: 'Home Page',
		isAuthenticated: req.isAuthenticated(),
		user: req.user
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