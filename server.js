var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer'); 
var passport      = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser  = require('cookie-parser');
var session       = require('express-session');
var server = require('http').createServer(app);

// mongoose
var mongojs = require('mongojs');
var ObjectId = mongojs.ObjectId;
var db = mongojs("mybaseballdb", ["TeamFranchises", "Master", "Teams", "Fielding", "Batting", "Pitching", "usermodels", "smacktalks"]);
var mongoose = require('mongoose');

var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/mybaseballdb';

mongoose.connect(connectionString);

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    email: String,
    roles: [String],
    teams: [String],
    players: [String],
    followers: [String],
    following: [String]
});

var UserModel = mongoose.model('UserModel', UserSchema);

var SmacktalkSchema = new mongoose.Schema({
    text: String,
    author: String,
    date: Date,
});

var SmacktalkModel = mongoose.model('SmacktalkModel', SmacktalkSchema);

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data
app.use(cookieParser());
app.use(session({ secret: '<mysercret>', saveUninitialized: true, resave: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));

passport.use(new LocalStrategy(
function(username, password, done)
{
    UserModel.findOne({username: username, password: password}, function(err, user)
    {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        return done(null, user);
    })
}));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    UserModel.findById(user._id, function(err, user) {
        done(err, user);
      });
});

app.post("/login", passport.authenticate('local'), function(req, res){
    var user = req.user;
    console.log(user);
    res.json(user);
});

app.get('/loggedin', function(req, res)
{
    res.send(req.isAuthenticated() ? req.user : '0');
});
    
app.post('/logout', function(req, res)
{
    req.logOut();
    res.send(200);
});     

app.post('/register', function(req, res)
{
    var newUser = req.body;
    newUser.roles = ['student'];
    UserModel.findOne({username: newUser.username}, function(err, user)
    {
        if(err) { return next(err); }
        if(user)
        {
            res.json(null);
            return;
        }
        var newUser = new UserModel(req.body);
        newUser.save(function(err, user)
        {
            req.login(user, function(err)
            {
                if(err) { return next(err); }
                res.json(user);
            });
        });
    });
});

/// RETRIEVE USER PROFILE
app.get('/rest/user/:username', function (req, res) {
    console.log(req.params.username);
    db.usermodels.find({
        username: req.params.username
    },
    function(err, user) {
        res.json(user);
    });
});

//// FOLLOW USER PROFILE
app.put('/rest/user/:currentusername/:username', function (req, res) {
    var currentUserObject;
    // currentusername FOLLOWED username
    db.runCommand({ 
        findAndModify: "usermodels",
        query: { username: req.params.currentusername },
        update: { $addToSet: { following: req.params.username } }, 
        new: true
    }, function (err, res) {
        currentUserObject = res.value;
    });

    // username has FOLLOWER currentusername
    db.runCommand({
        findAndModify: "usermodels",
        query: { username: req.params.username },
        update: { $addToSet: { followers: req.params.currentusername } },
        new: true
    }, function (err, response) {
        console.log(currentUserObject);
        returnObject = {
            currentUserObject: currentUserObject,
            userProfile: response.value
        }
        res.json(returnObject);
    });
});

app.delete('/rest/user/:currentusername/:username', function (req, res) {
    var currentUserObject;
    // currentusername UNFOLLOWED username
    db.runCommand({ 
        findAndModify: "usermodels",
        query: { username: req.params.currentusername },
        update: { $pull: { following: req.params.username } },
        new: true
    }, function (err, res) {
        currentUserObject = res.value;
    });

    // username does NOT HAVE FOLLOWER currentusername
    db.runCommand({
        findAndModify: "usermodels",
        query: { username: req.params.username },
        update: { $pull: { followers: req.params.currentusername } },
        new: true
    }, function (err, response) {

        console.log(currentUserObject);
        returnObject = {
            currentUserObject: currentUserObject,
            userProfile: response.value
        }
        res.json(returnObject);
    });
});

//// SMACKTALK CRUD METHODS
app.post('/rest/smacktalk/', function (req, res) {
    var newSmacktalk = req.body;

    db.smacktalks.insert(newSmacktalk);

});
app.get('/rest/smacktalk', function(req, res) {
    
    db.smacktalks.find().sort({ date: -1 }, function (err, smacktalks) {
        res.json(smacktalks);
    });
});

var auth = function(req, res, next)
{
    if (!req.isAuthenticated())
        res.send(401);
    else
        next();
};

app.get("/rest/user", auth, function(req, res)
{
    db.usermodels.find(function(err, users) {
        res.json(users);
    });
});

app.delete("/rest/user/:id", auth, function(req, res){
    UserModel.findById(req.params.id, function(err, user){
        user.remove(function(err, count){
            UserModel.find(function(err, users){
                res.json(users);
            });
        });
    });
});

app.put("/rest/user/:id", auth, function(req, res){

    UserModel.findById(req.params.id, function(err, user){
        user.update(req.body, function(err, count){

            res.json(req.body);
        });
    });
});

// Adding and removing favorite baseball teams
app.put("/rest/user/:id/team/:franchID", auth, function(req, res) {

    db.runCommand(
    {
        findAndModify: "usermodels",
        query: { _id: ObjectId(req.params.id) },
        update: { $addToSet: { teams: req.params.franchID } },
        new: true
    }, function (err, response) {
            res.json(response.value);
        });
});

app.delete("/rest/user/:id/team/:franchID", auth, function(req, res) {

    db.runCommand(
    {
        findAndModify: "usermodels",
        query: { _id: ObjectId(req.params.id) },
        update: { $pull: { teams : req.params.franchID } },
        new: true
    }, function (err, response) {
            res.json(response.value);
        });
});

//// Adding and removing favorite baseball players
app.put("/rest/user/:id/player/:playerID", auth, function(req, res) {

    db.runCommand(
    {
        findAndModify: "usermodels",
        query: { _id: ObjectId(req.params.id) },
        update: { $addToSet: { players: req.params.playerID } },
        new: true
    }, function (err, response) {
            res.json(response.value);
        });
});

app.delete("/rest/user/:id/player/:playerID", auth, function(req, res) {

    db.runCommand(
    {
        findAndModify: "usermodels",
        query: { _id: ObjectId(req.params.id) },
        update: { $pull: { players : req.params.playerID } },
        new: true
    }, function (err, response) {
            res.json(response.value);
        });
});



app.post("/rest/user", auth, function(req, res){
    UserModel.findOne({username: req.body.username}, function(err, user) {
        if(user == null)
        {
            user = new UserModel(req.body);
            user.save(function(err, user){
                UserModel.find(function(err, users){
                    res.json(users);
                });
            });
        }
        else
        {
            UserModel.find(function(err, users){
                res.json(users);
            });
        }
    });
});

// BASEBALL DATA REQUESTS
// get the index of baseball teams
app.get('/rest/team', function(req, res) {
    db.TeamFranchises.find({active: 'Y'}).sort({franchName: 1}, function(err, data) {
        res.json(data);
    });
});

// get the detail of a baseball team
app.get('/rest/team/:franchID', function(req, res) {

    var teamIDBR = req.params.franchID;

    db.Teams.find({teamIDBR: teamIDBR}, function(err, data) {
        res.json(data);
    });

});

// get the index of baseball players
app.get('/rest/player', function(req, res) {

    db.Master.aggregate([ 
        { $match: { finalGame: { $regex: /2014/ } } }, 
        { $project: { 
            playerFullName: { $concat: ["$nameFirst", " ", "$nameLast"] }, 
            playerID: "$playerID",
            bats: "$bats",
            throws: "$throws" } } ], function (err, players) {
                res.json(players);
            });
});

// get the detail of a baseball player
app.get('/rest/player/:playerID', function(req, res) {

    var playerID = req.params.playerID;

    db.Fielding.find({playerID: playerID}).sort({yearID: -1}[0], function(err, data) {

        var playerObject = data[0];
        var seasonStats = {};
        var player = {
                    playerID: playerObject.playerID,
                    playerFirstName: "",
                    playerLastName: "",
                    birthYear: "", 
                    birthCountry: "", 
                    birthState: "",
                    birthCity: "", 
                    weight: "",
                    height: "", 
                    bats: "",
                    throws: "",
                    debut: "",
                    teamID: playerObject.teamID,
                    lgID: playerObject.lgID,
                    POS: playerObject.POS,
                    seasonStats: []
                }
        db.Master.find({playerID: playerID}, function(err, data) {
            player.playerFirstName = data[0].nameFirst;
            player.playerLastName = data[0].nameLast;
            player.birthYear = data[0].birthYear;
            player.birthCountry = data[0].birthCountry;
            player.birthState = data[0].birthState;
            player.birthCity = data[0].birthCity;
            player.weight = data[0].weight;
            player.height = data[0].height;
            player.bats = data[0].bats;
            player.throws = data[0].throws;
            player.debut = data[0].debut;
        });
        if (playerObject.POS == "P") {
            db.Pitching.find({playerID: playerID}, function(err, data) {
                //seasonStats = data;
                
                player.seasonStats = data;

                res.json(player);
            });
        }
        else {
            db.Batting.find({playerID: playerID}, function(err, data) {
                seasonStats = data;

                player.seasonStats = data
                res.json(player);
            });
        }   
    });
});

// listen
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

server.listen(port, ipaddress, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});