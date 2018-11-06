const express = require("express");
const app = express();

var mongoose = require("mongoose");
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/word-wrap-api"
);
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

// 1) Definir le model User

const UserModel = mongoose.model("User", {
  email: String,
  password: String,
  token: String,
  salt: String,
  hash: String,
  text: String
});

// 2) Créé l'instanciation + sauvegarder

app.post("/api/sign_up", function(req, res) {
  let password = req.body.password;
  let salt = uid2(16);
  let hash = SHA256(password + salt).toString(encBase64);
  let newUser = new UserModel({
    email: req.body.email,
    token: uid2(16),
    salt: salt,
    hash: hash
  });

  newUser.save(function(err, UserCreated) {
    if (err) {
      res.json({
        error: "something is wrong"
      });
    } else if (UserCreated) {
      console.log(UserCreated);
      res.json({ token: UserCreated.token });
    }
  });
});
let textWrapped = [];
app.post("/api/word-wrap", function(req, res) {
  text = req.body.text.split("");
  for (i = 0; i < text.length; i++) {
    if (i % 80) {
      textWrapped.push("\n");
    } else {
      textWrapped.push(text[i]);
    }
    textWrapped = textWrapped.join("");
    res.json({ wrapped: textWrapped });
  }
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started");
});
