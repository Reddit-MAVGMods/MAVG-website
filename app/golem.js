var token = require("./token"),
    fs = require("fs"),
    marked = require("marked");

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
}

module.exports = initialize;