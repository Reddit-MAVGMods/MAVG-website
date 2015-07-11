var port = +process.env.PORT || 80,
    http = require("http"),
    express = require("express"),
    bodyParser = require("body-parser"),
    ejs = require("ejs"),
    request = require("request"),
    
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
    app.get("/", function(req, res) {
        res.render("index");
    });

    app.get("/api/sticky", function(req, res) {
        request({
            method: "GET",
            url: "https://www.reddit.com/r/MakeAVideoGame.json"
        }, function(err, req_res, data) {
            var fail, first_post;

            if(err) {
                fail = "Error communicating with reddit.";
            }

            try {
                data = JSON.parse(data);

                first_post = data.data.children[0].data;

                if(!first_post.stickied) {
                    fail = "No sticky exists.";
                }
            } catch(e) {
                fail = "Error communicating with reddit.";
            }

            if(fail) {
                res.status(500).type("txt").send(fail);
            } else {
                res.redirect(first_post.url);
            }
        });
    });

    //Golem
    require("./golem")(app);
}

module.exports = initialize;