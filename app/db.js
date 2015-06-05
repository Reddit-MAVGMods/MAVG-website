var mongoose = require("mongoose")

    db = {
        url: "ds043262.mongolab.com:43262/mavg-golem",
        user: "golem-server",
        pass: process.env.GOLEM_DB_PASSWORD
    };

function initialize() {
    console.log(process.env.GOLEM_DB_PASSWORD);
    db.db = mongoose.connect("mongodb://" + db.user + ":" + db.pass + "@" + db.url);
    console.log("Connected to MongoDB as " + db.user + ".");

    db.UserSchema = new mongoose.Schema({
        id: String,
        username: String,
        password: String,
        email: Array
    });

    mongoose.model("User", db.UserSchema);
    db.User = mongoose.model("User");

    console.log("Database initialized.");
}

module.exports = {
    init: initialize,
    load: function() { return db; }
};