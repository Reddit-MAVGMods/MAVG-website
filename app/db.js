var mongoose = require("mongoose")

    db = {
        url: "ds043262.mongolab.com:43262/mavg-golem",
        user: "golem-server",
        pass: process.env.GOLEM_DB_PASSWORD
    };

function initialize() {
    db.db = mongoose.connect("mongodb://" + db.user + ":" + db.pass + "@" + db.url);
    console.log("Connected to MongoDB as " + db.user + ".");

    db.UserSchema = new mongoose.Schema({
        id: String,
        username: String,
        password: String,
        email: String
    });

    db.GameSchema = new mongoose.Schema({
        id: String,
        name: String
    });

    mongoose.model("User", db.UserSchema);
    mongoose.model("Game", db.GameSchema);
    db.User = mongoose.model("User");
    db.Game = mongoose.model("Game");

    console.log("Database initialized.");
}

module.exports = {
    init: initialize,
    load: function() { return db; }
};