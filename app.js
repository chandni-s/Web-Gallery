var crypto = require('crypto');
var path = require('path');
var express = require('express');
var app = express();
var util = require('util');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


var multer = require('multer');
var upload = multer({ dest: path.join(__dirname, 'frontend/uploads')});

var cookieParser = require('cookie-parser');
app.use(cookieParser());

var Datastore = require('nedb');
var users = new Datastore({ filename: path.join(__dirname, 'db', 'user.db'), autoload: true, timestampData: true});
var images = new Datastore({ filename: path.join(__dirname,'db', 'images.db'), autoload: true, timestampData: true});
var comments = new Datastore({ filename: path.join(__dirname, 'db', 'comments.db'), autoload: true, timestampData: true});


// Username model
var User = function(user) {
  var salt = crypto.randomBytes(16).toString('base64');
  var hash = crypto.createHmac('sha512', salt);
  hash.update(user.password);
  this.username = user.username;
  this.salt = salt;
  this.saltedHash = hash.digest('base64');
};

// Image model
var Image = function (img) {
    this.username = img.username;
    this.title = img.title;
    this.author = img.author;
    this.url = img.url;
};

// Comment model
var Comment = function (cmt) {
    this.username = cmt.username;
    this.imageid = cmt.imageid;
    this.authorName = cmt.authorName;
    this.date = Date();
    this.comment = cmt.comment;
};

// Authentication
var checkPassword = function(user, password) {
  var hash = crypto.createHmac('sha512', user.salt);
  hash.update(password);
  var value = hash.digest('base64');
  return (user.saltedHash === value);
};

var session = require('express-session');
app.use(session({
  secret: 'chandni',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true, sameSite: true}
}));



// sanitization and validation
var expressValidator = require('express-validator');
app.use(expressValidator());

app.use(function(req, res, next){
    Object.keys(req.body).forEach(function(arg){
        switch(arg){
            case 'username':
                req.checkBody(arg, 'invalid username').isAlpha();
                break;
            case 'password':
                break;
            case 'title':
              req.sanitizeBody(arg).escape();
              break;
            case 'author':
              req.checkBody(arg, 'invalid username').isAlpha();
              break;
            case 'url':
              req.checkBody(arg, 'invalid url').isURL();
              break;
            case 'authorName':
              req.checkBody(arg, 'invalid comment author name').isAlpha();
              break;
            case 'comment':
              req.sanitizeBody(arg).escape();
              break;
            // default:
            //     req.checkBody(arg, 'unknown argument').fail();
        }
    });
    req.getValidationResult().then(function(result) {
        if (!result.isEmpty()) return res.status(400).send('Validation errors: ' + util.inspect(result.array()));
        else next();
    });
});

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    return next();
});



// signin

app.post('/signin/', function(req, res, next) {

  //req.checkParams('username', 'Invalid urlparam').isAlpha();

  if (!(req.body.username && req.body.password)) return res.status(400).send("Please enter username and password");
  users.findOne({username: req.body.username}, function(err, user) {
    if (err) return res.status(500).end(err);
    if (!user || !checkPassword(user, req.body.password)) return res.status(401).end("Unauthorized user");
    req.session.user = user;
    res.cookie('username', user.username, {secure: true, sameSite: true, httpOnly: true});
    return res.json(user);
  });
});

// signout
app.get('/signout/', function(req, res, next) {
  req.session.destroy(function(err) {
    if (err) return res.status(500).end(err);
    return res.end();
  });
});

// serving frontend
app.use(express.static(path.join(__dirname, 'frontend')));


// CREATE

// user (signup)
app.put('/signup/', function(req, res, next) {
  var data = new User(req.body);
  users.findOne({username: req.body.username}, function(err, user) {
    if (err) return res.status(500).end(err);
    if (user) return res.status(409).end("Username " + req.body.username + " already exists");
    users.insert(data, function(err, user) {
      if (err) return res.status(500).end(err);
      return res.json(user);
    });
  });
});

// image
app.post('/users/', upload.single('file'), function (req, res, next) {

  if (!req.session.user) return res.status(403).end("Forbidden");
  req.body.username = req.session.user.username;

  var image = new Image(req.body);
  if (req.file) image.url = req.file;
  images.insert(image, function (err, data) {
    if (err) {
        res.status(500).end("DB insertion error");
        return next();
    }
    data.id = data._id; // for convenience
    res.json(data);
    return next();
  });
});

// comment
app.post('/users/:username/:image/comments/', function (req, res, next) {
  if (!req.session.user) return res.status(403).end("Forbidden");

  req.body.username = req.session.user.username;
  req.body.imageid = req.params.image;
  var comment = new Comment(req.body);
  comments.insert(comment, function(err, cmt) {
    if (err) {
      res.status(500).end("Database error");
      return next();
    }

    cmt.id = cmt._id; // for convenience
    res.json(cmt);
    return next();
  });
});


// READ:

// get ALL Users for paginated gallery
app.get('/users/', function(req, res, next) {
  if (!req.session.user) return res.status(403).end("Forbidden");
  users.find({}).limit(10).exec(function (err, users) {
    if (err) {
      res.status(500).end("Database error");
      return next();
    }
    res.json(users);
    return next();
  });
});

// Get ALL images by username
app.get('/users/:username/images/', function(req, res, next) {
  if (!req.session.user) return res.status(403).end("Forbidden");
  images.findOne({username: req.params.username}, function(err, data) {
    if (err) {
      res.status(404).end("Images for user " + req.params.username + " not found");
      return next();
    }
    res.json(data);
    return next();
  });
});

// get next or previous image from given current id
app.get('/users/:username/images/:imdgid', function(req, res, next) {
  if (!req.session.user) return res.status(403).end("Forbidden");
});


// READ: GET comments for an image
app.get('/users/:username/images/:image/comments/', function(req, res, next) {
  if (!req.session.user) return res.status(403).end("Forbidden");
  comments.find({ imageid: req.params.image }).limit(10).exec(function (err, cmts) {
    if (err) {
      res.status(404).end("Comments for image: " + req.params.image + " does not exist");
      return next();
    }
    res.json(cmts);
    return next();
  });
});


// DELETE image and its comments
app.delete('/users/:username/images/:image/', function(req, res, next) {
  if (!req.session.user) return res.status(403).end("Forbidden");

   images.findOne({_id: req.params.image}, function(err, image) {
    if (image.username !== req.params.username) return res.status(401).end("Unauthorized");
    comments.remove({imageid: req.params.image}, { multi:true }, function(err) {
      if (err) {
        res.status(404).end("Comments for image " + req.params.image + " does not exist");
        return next();
      }
      images.remove({_id: req.params.image}, {multi: false}, function(err) {
        if (err) {
          res.status(404).end("Image id " + req.params.image + " does not exist");
          return next();
        }
        res.end();
        return next();
      });
    });
  });
});


// Delete comment
app.delete('/users/:username/images/:image/comments/:commentid/', function(req, res, next){
  if (!req.session.user) return res.status(403).end("Forbidden");
  comments.findOne({_id: req.params.commentid}, function (err, comment) {
    if (err) return res.status(500).end("Database error");
    if (comment.username !== req.params.username) return res.status(401).end("Unauthorized");

    comments.remove({_id: req.params.commentid}, {multi: false}, function(err) {
      if (err) {
        res.status(404).end("Could not remove comment: " + req.params.commentId);
        return next();
      }
      res.end();
      return next();
    });
  });
});


app.use(function (req, res, next) {
  console.log("HTTP Response", res.statusCode);
});

var fs = require('fs');
var https = require('https');
var privateKey = fs.readFileSync('server.key');
var certificate = fs.readFileSync('server.crt');
var config = {
  key: privateKey,
  cert: certificate
};
https.createServer(config, app).listen(3000, function() {
  console.log("HTTPS on port 3000");
});
