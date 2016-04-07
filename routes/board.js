var express = require('express');
var router = express.Router();

router.get('/board', ensureAuthenticated, function(req, res){
	res.render('guestBoard', { //guestBoard.ejs
		title: 'Game Board',
		isAuthenticated: req.isAuthenticated(),
		user: req.user
	});
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		next();
	}
	else{
		res.redirect('/');
	}
};

module.exports = router;