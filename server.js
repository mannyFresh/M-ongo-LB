var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer'); 
var passport      = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser  = require('cookie-parser');
var session       = require('express-session');

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
    players: [String]
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

//var users =
//[
//    {username: 'alice', password: 'alice', firstName: 'Alice', lastName: 'Wonderland', roles: ['admin', 'student', 'instructor']},
//    {username: 'bob', password: 'bob', firstName: 'Bob', lastName: 'Marley', roles: ['student']},
//    {username: 'charlie', password: 'charlie', firstName: 'Charlie', lastName: 'Brown', roles: ['instructor']}
//];

passport.use(new LocalStrategy(
function(username, password, done)
{
//    for(var u in users)
//    {
//        if(username == users[u].username && password == users[u].password)
//        {
//            return done(null, users[u]);
//        }
//    }
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
app.get('/rest/user/:username', function(req, res) {
    console.log(req.params.username);
    db.usermodels.find({
        username: req.params.username
    },
    function(err, user) {
        res.json(user);
    });
});

//// SMACKTALK CRUD METHODS
app.post('/rest/smacktalk/', function(req, res) {
    var newSmacktalk = req.body;
/*
    db.smacktalks.insert(newSmacktalk, 
        db.smacktalks.find(function(err, smacktalks) {
            res.json(smacktalks);
        }));
*/
    db.smacktalks.insert(newSmacktalk);
/*
    db.smacktalks.find(function(err, smacktalks) {
        console.log(smacktalks);
        res.json(smacktalks);
    });*/
    /*db.smacktalks.insert(newSmacktalk, function (err, smacktalk) {
        res.json(smacktalk);
    });*/
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
    /*
    UserModel.find(function(err, users)
    {
        res.json(users);
    });*/
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
    //console.log(req.body);

    UserModel.findById(req.params.id, function(err, user){
        user.update(req.body, function(err, count){

            res.json(req.body);
        });
    });
/*
    db.usermodels.find({ "_id": ObjectId('"' + req.params.id +'"')}, function(user, err) {
        user.update(req.body, function(count, err) {
            db.usermodels.find(function(users, err) {
                res.json(users);
            });
        });
    });
*/
});

// Adding and removing favorite baseball teams
app.put("/rest/user/:id/team/:franchID", auth, function(req, res) {
/*
    db.usermodels.update(
        { _id: ObjectId(req.params.id) }, 
        { $addToSet: { teams: req.params.franchID } },
        function (err, response) {
            console.log("hihi");
            res.json(response);
        });
*/
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
    /*db.usermodels.update(
        { _id: ObjectId(req.params.id) },
        { $pull: { teams : req.params.franchID } },
        function (err, response) {
            res.json(response);
        });*/
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
/*
    db.usermodels.update(
        { _id: ObjectId(req.params.id) }, 
        { $addToSet: { teams: req.params.franchID } },
        function (err, response) {
            console.log("hihi");
            res.json(response);
        });
*/
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
    /*db.usermodels.update(
        { _id: ObjectId(req.params.id) },
        { $pull: { teams : req.params.franchID } },
        function (err, response) {
            res.json(response);
        });*/
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
    /*
    db.TeamFranchises.findOne({franchID: franchID}, function(err, data) {
        res.json(data);
    });*/
});

// get the index of baseball players
app.get('/rest/player', function(req, res) {
/*
    db.Master.find( { finalGame: { $regex: /2014/ } }, function (err, player) {
        res.json(player);
    });
*/
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
        //console.log(data);
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

app.listen(3000);