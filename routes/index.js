var express = require('express');
var router = express.Router();
var titleText;

/* GET home page. */
router.get('/', function(req, res, next) {
  titleText = 'Home - UEFI-VT';
  res.render('index', { title: titleText });
  console.log(" ** Redirecting: " +titleText +" ** ");
});

router.get('/index', function(req, res, next) {
  titleText = 'Home - UEFI-VT';
  res.render('index', { title: titleText });
  console.log(" ** Redirecting: " +titleText +" ** ");
});

module.exports = router;