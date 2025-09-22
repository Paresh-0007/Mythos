var express = require('express');
var router = express.Router();
var authMiddleware = require('../middleware/auth');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


// Example protected route
router.get('/protected', authMiddleware, function(req, res) {
  res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;
