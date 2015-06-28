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

function csvEscape(str) {
    str = str.toString();

    if(str.search(/[," \n]/) === -1) {
        return str;
    } else {
        return "\"" + str.replace(/"/g, "\"\"") + "\"";
    }
}

function initialize(app) {
    var readme = {};

    fs.readFile("./app/golem.md", function(err, data) {
        readme.raw = data.toString();
        readme.html = marked(readme.raw);
    });

    //Middleware
    app.use("/golem/*", function(req, res, next) {
        var format = req.body.format || req.query.format || "json";

        switch(format) {
            default:
            case "json":
            res.sendFormatted = function(data) {
                this.json(data);
            };
            break;

            case "csv":
            res.sendFormatted = function(data) {
                var lines = [[], []];

                for(var field in data) {
                    lines[0].push(csvEscape(field));
                    lines[1].push(csvEscape(data[field]));
                }

                lines = lines[0].join(",") + "\n" + lines[1].join(",");

                this.header("Content-Type", "text/csv");
                this.send(lines);
            };
            break;
        }

        next();
    });

    app.use("/golem/*", function(req, res, next) {
        var id = req.body.ref || req.query.ref;

        db.Game.findOne({
            id: id
        }, function(err, game) {
            if(game) {
                next();
            } else {
                res.sendFormatted({
                    success: false,
                    error: "Invalid reference code."
                });
            }
        });
    });

    //Routes
    app.get("/golem", function(req, res) {
        res.render("golem", {
            readme: readme.html
        });
    });

    app.post("/golem/auth/register", function(req, res) {
        var username = req.body.username,
            password = req.body.password,
            email = req.body.email;

        if(!username || !password) {
            res.sendFormatted({
                success: false,
                error: "Invalid or missing parameters."
            });

            return false;
        }

        db.User.findOne({
            username: username
        }, function(err, user) {
            if(user) {
                res.sendFormatted({
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
                        res.sendFormatted({
                            success: false,
                            error: err
                        });

                        throw err;
                    }

                    console.log("User " + user.username + " created.");
                    
                    if(req.body.login) {
                        login(username, password, function(login_res) {
                            res.sendFormatted(login_res);
                        });
                    } else {
                        res.sendFormatted({
                            success: true
                        });
                    }
                });
            }
        });
    });

    app.post("/golem/auth/login", function(req, res) {
        var username = req.body.username,
            password = req.body.password;

        if(!username || !password) {
            res.sendFormatted({
                success: false,
                error: "Invalid or missing parameters."
            });

            return false;
        }

        login(username, password, function(login_res) {
            res.sendFormatted(login_res);
        });
    });

    app.post("/golem/auth/renew_token", function(req, res) {
        var tk = req.body.token;

        if(!tk) {
            res.sendFormatted({
                success: false,
                error: "Invalid or missing parameters."
            });

            return false;
        }

        tk = token.verify(tk);

        if(tk) {
            res.sendFormatted({
                success: true,
                token: token.create(tk)[0]
            });
        } else {
            res.sendFormatted({
                success: false,
                error: "Invalid or expired token."
            });
        }
    });
}

module.exports = initialize;