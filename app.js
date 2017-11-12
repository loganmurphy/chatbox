
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var authConfig = require('./config/auth');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;


var logger = require('morgan');
var session = require('express-session');
var db = require('./models');
var authorizationURL = "https://accounts.google.com/o/oauth2/auth";
var clientID = authConfig.web.client_id;
const body_parser = require('body-parser');


function extractProfile (profile) {
  let imageUrl = '';
  if (profile.photos && profile.photos.length) {
    imageUrl = profile.photos//[0].value;
  }
  return {
    id: profile.id,
    displayName: profile.displayName,
    image: imageUrl
  };
}

passport.serializeUser(function(user, done) {
  // done(null, user.id);
  done(null, user);
});
// see above
passport.deserializeUser(function(obj, done) {
  // Users.findById(obj, done);
  done(null, obj);
});

passport.use(new GoogleStrategy({
    clientID: clientID,
    clientSecret: authConfig.web.client_secret,
    // callbackURL: "http://localhost:5000/auth/google/callback"
    // callbackURL: "https://todolist.logancodes.com/auth/google/callback"
    callbackURL: "https://git.heroku.com/chattboxx.git/auth/google/callback"

  },

  function(accessToken, refreshToken, profile, cb){
    var user = extractProfile(profile);
    // store profile in db, or fetch it if a record exists
    db.users.findOrCreate({where: {name: profile.name.givenName, userId: profile.id, service: 'Google'}, attributes: {name: profile.name.givenName, userId: profile.id, service: 'Google'}})
      .then(function(results){
        return cb(null, user)
      })
  }));

  var clientSecret = 'e9eed09b08ccbd0cd7122759e2d4ecde';
  passport.use(new FacebookStrategy({
    clientID: 1622507121145224, //FACEBOOK_APP_ID,
    clientSecret: clientSecret,//FACEBOOK_APP_SECRET,
    // callbackURL: "http://logancodes.auth0.com/login/callback"
    // callbackURL: "http://localhost:5000/auth/facebook/callback"
    callbackURL: "https://git.heroku.com/chattboxx.git/auth/facebook/callback"

  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile);
    var user = extractProfile(profile);
    // console.log(user);

    db.users.findOrCreate(
      {where: {name:profile.displayName, userId: profile.id, service: 'Facebook'}, attributes: {name: profile.displayName, userId: profile.id, service: 'Facebook'}})
      .then(function(results){
        return cb(null, user)
      })
  }));

// passport.use(new FaceBookStrategy
// For oauth with Facebook

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: false,
  cookie: {maxAge: 3600000},
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/public', express.static('public'));
app.use('/node_modules', express.static('node_modules'));
app.use('/socket-io',
  express.static('node_modules/socket.io-client/dist'));
app.use(body_parser.urlencoded({extended: false}));
// app.use(function (request, response, next) {
//   if (request.session.user) {
//     next();
//   } else if (request.path == '/') {
//     next();
//   } else {
//     response.redirect('/');
//   }
// });

app.set('view engine', 'hbs');



app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['public_profile', 'email']}));

app.get('/auth', passport.authenticate('google', { scope: ['openid email profile'] }));

// Use passport.authenticate() to authenticate. If authentication fails, the user will be
// redirected back to thelogin page.  Otherwise, user is redirected to their chatroom
app.get('/auth/facebook/callback',
  passport.authenticate('facebook',
  { successRedirect: '/chatroom', failureRedirect: '/login' }));

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    // Authenticated successfully
    res.redirect('/chatroom');
  });

app.get('/', function(req, res){
  res.render('login.hbs');
});

var handles = new Map();

app.get('/chatroom', function(req, res){
  var context = {title: 'Chatbox'};
  res.render('index.hbs', context);
});

io.on('connection', function(socket){
  // let handle = req.query.handle;
  // handles.push(handle);
  // handles.forEach((handle)=>{
  //   io.emit('handle', handle)
  // })
  // var handle = {};
  console.log('Connected!');


// send video

  socket.on('video message', function(vid_src){
  io.emit('video message', vid_src);
  console.log('emitted');

  })



  socket.on('chat message', function(msg){
    let handle = handles.get(socket.id)
    console.log('message: ' + msg, handle);
    io.emit('chat message', handle, msg);
  })

  socket.on('handle', function(handleobj){
    handles.set(handleobj.id, handleobj.handle);
    // console.log(handles)
    // console.log('handle: ' + handle);
    // handles.push(handle);
    let handleStrings = []
    handles.forEach((value, key)=>{handleStrings.push(value)})
    // console.log(handleStrings)
    io.emit('handles', {handles: handleStrings});
  })
  socket.on('draw', function (coords) {
    console.log('Coords', coords);
    io.emit('do-draw', coords);
  });

  socket.on('disconnect', function () {

    // remove handle from handles
    let bye = handles.get(socket.id);
    if (bye) {

    }
    io.emit('chat message', `${bye} has logged off`, '');

    console.log(handles.delete(socket.id));
    let handleStrings = []
    handles.forEach((value, key)=>{handleStrings.push(value)})
    console.log(handleStrings)
    io.emit('handles', {handles: handleStrings});

  })

});
db.sequelize.sync().then(function() {
  var PORT = process.env.PORT || 3000;
  app.listen(PORT, function () {
    console.log('Now up on PORT 3000');
  });
});
