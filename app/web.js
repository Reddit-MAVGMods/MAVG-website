var port = +process.env.PORT || 80,
    http = require("http"),
    express = require("express"),
    bodyParser = require("body-parser"),
    ejs = require("ejs"),
    
    portarg = process.argv.indexOf("--port"),
    app = express(),
    server = http.createServer(app);

if(portarg !== -1) {
    port = process.argv[portarg + 1];
}

function initialize(rootdir) {
    //Set up server
    app.set("view engine", "ejs");
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.set("views", rootdir + "/views");
    app.use(express.static(rootdir + "/public"));
    server.listen(port);
    console.log("Server ready on port " + port + ".");

    //Routes
    app.get("/", function(req, res){
        res.render("index");
    });
}

module.exports = initialize;