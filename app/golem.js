var token = require("./token"),
    db = require("./db").load(),
    fs = require("fs"),
    marked = require("marked"),
    bcrypt = require("bcrypt-nodejs");

//Helper functions
function checkPassword(user, password) {
    return bcrypt.compareSync(password, user.password);
}

function hashPassword(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

function login(username, password, cb) {
    db.User.findOne({
        id: username.toLowerCase()
    }, function(err, user) {
        var tk;

        if(user && checkPassword(user, password)) {
            tk = token.create(username);
            
            cb({
                success: true,
                token: tk[0]
            });
        } else {
            cb({
                success: false,
                error: "Username or password incorrect."
            });
        }
    });
}

function initialize(app) {
    var readme = {};

    fs.readFile("./app/golem.md", function(err, data) {
        readme.raw = data.toString();
        readme.html = marked(readme.raw);
    });

    //Routes
    app.get("/golem", function(req, res) {
        res.render("golem", {
            readme: readme.html
        });
    });

    app.get("/golem/register", function(req, res) {
        var username = req.query.username,
            password = req.query.password,
            email = req.query.email;

        if(!username || !password) {
            res.json({
                success: false,
                error: "Invalid or missing parameters."
            });

            return false;
        }

        db.User.findOne({
            username: username
        }, function(err, user) {
            if(user) {
                res.json({
                    success: false,
                    error: "Username already taken."
                });
            } else {
                var user = new db.User();

                user.id = username.toLowerCase();
                user.username = username;
                user.password = hashPassword(password);

                user.save(function(err) {
                    if(err) {
                        res.json({
                            success: false,
                            error: err
                        });

                        throw err;
                    }

                    console.log("User " + user.username + " created.");
                    
                    if(req.query.login) {
                        login(username, password, function(login_res) {
                            res.json(login_res);
                        });
                    } else {
                        res.json({
                            success: true
                        });
                    }
                });
            }
        });
    });

    app.get("/golem/login", function(req, res) {
        var username = req.query.username,
            password = req.query.password;

        if(!username || !password) {
            res.json({
                success: false,
                error: "Invalid or missing parameters."
            });

            return false;
        }

        login(username, password, function(login_res) {
            res.json(login_res);
        });
    });
}

module.exports = initialize;