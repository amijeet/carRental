const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// set up the express app
const app = express();

// connect to mongodb
mongoose.connect("mongodb+srv://amijeet:%40Letskillit69@cluster0.sl10q.mongodb.net/cardb?retryWrites=true&w=majority");
// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://amijeet:@Letskillit69@cluster0.sl10q.mongodb.net/cardb?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });
mongoose.Promise = global.Promise;

// set up the body parser
app.use(bodyParser.json());

// to use routes
app.use("/api", require("./routes/api"));

// error handling
app.use(function (err, req, res, next) {
    res.status(422).send({ error: err.message });
});

app.listen(process.env.PORT || 4002, function () {
    console.log("now listening to port 4001");
});
// to restart the mongodb servers -> brew services restart mongodb-community@5.0
// to start the node server, since we have already added nodemon app.js in package.json file -> nmp start
