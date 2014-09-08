//Environment setup
var port = +process.env.PORT || 80,
    portarg = process.argv.indexOf("-port"),
    express = require("express"),
    bodyParser = require("body-parser"),
    ejs = require("ejs"),
    app = express(),
    frontdata;

function applog(str) {
    "use strict";
    console.log(str);
}

if(portarg !== -1) {
    port = process.argv[portarg + 1];
}

//Setting stuff up
app.set("view engine", "ejs");
    applog("Using EJS as view engine.");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
    applog("Loaded bodyParser.");
app.set("views", __dirname + "/views");
    applog("Serving views on /views.");
app.use(express.static(__dirname + "/public"));
    applog("Serving resources on /public.");
app.listen(port);
    applog("Listening on port " + port + ".");

//Listeners
app.get("/", function(req, res){
    "use strict";
    var html = {
            games: ""
        },
        game;

    for(var i = 0; i < frontdata.games.length; i++) {
        game = frontdata.games[i];
        html.games += "<a class='col-md-5 game-preview' title='Game Title' data-created='" + game.created + "'>";
        html.games += "<div class='align-center'><span class='well placeholder-image game-preview-image'></span></div>";
        html.games += "<div class='game-description'>";
        html.games += "<span class='game-title'>" + game.title + "</span><br>";
        html.games += game.description;
        html.games += "</div></a>";
    }

    res.render("index", {
        games: html.games
    });
});

//TODO: Replace hardcoded data with database call(s)
frontdata = {
    games: [
        {
            created: new Date("08/24/2014"),
            title: "Navis",
            description: "A shoot-'em-up set in space. Made in Unity and C#."
        },
        {
            created: new Date("02/19/2014"),
            title: "Project Jeden",
            description: "MAVG's first game. Currently on hold."
        }
    ]
};