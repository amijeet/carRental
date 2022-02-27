const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// set up the express app
const app = express();

// connect to mongodb
mongoose.connect("mongodb://localhost/cardb");
mongoose.Promise = global.Promise;

// set up the body parser
app.use(bodyParser.json());

// to use routes
app.use("/api", require("./routes/api"));

// error handling
app.use(function (err, req, res, next) {
    res.status(422).send({ error: err.message });
});

app.listen( process.env.PORT || 4000, function () {
    console.log("now listening to port 4000");
});
// to restart the mongodb servers -> brew services restart mongodb-community@5.0
// to start the node server, since we have already added nodemon app.js in package.json file -> nmp start
