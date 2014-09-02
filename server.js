//Environment setup
var port = +process.env.PORT || 8080,
    portarg = process.argv.indexOf("-port");
    express = require("express"),
    bodyParser = require("body-parser"),
    ejs = require("ejs"),
    app = express();

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
    res.render("index");
});