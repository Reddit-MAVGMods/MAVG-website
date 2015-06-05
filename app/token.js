var crypto = require("crypto"),
    token = {
        algorithm: "aes-256-ctr",
        secret: process.env.NODE_SESSION_SECRET
    };

token.create = function(username) {
    var cipher = crypto.createCipher(token.algorithm, token.secret),
        now = new Date().getTime(),
        exp = now + (1000 * 60 * 60 * 2),
        contents = username + "-" + exp,
        tk = cipher.update(contents, "utf8", "base64");

    tk += cipher.final("base64");
    tk = tk.replace(/=+$/, "");
    
    return [tk, exp];
};
 
token.verify = function(tk, username) {
    var decipher = crypto.createDecipher(token.algorithm, token.secret),
        contents = decipher.update(tk, "base64", "utf8"),
        now = new Date().getTime(),
        exp;

    contents += decipher.final("utf8");
    contents = contents.split("-");
    exp = parseInt(contents[1], 10);

    if(now > exp || (username && contents[0] !== username)) {
        return false;
    }

    return contents[0];
};

module.exports = token;