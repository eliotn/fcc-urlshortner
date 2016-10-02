var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient
var maxnumber = 0;
app.get('/new/*', function (req, res) {
  mongo.connect("mongodb://localhost:27017/learnyoumongo", function(err, db) {
    if (err) {
      console.error(err.toString());
      return;
    }
    res.set({'Content-Type': 'application/json'});
    res.send({
      "shortenedurl": req.headers.host + "/1",
      "originalurl":req.headers.host + req.path
    });
  });
});

app.get('/v/:UNIQUEID', function (req, res) {
  res.send(req.params.UNIQUEID);
});


app.listen(process.env.PORT, function () {
  console.log('Example app listening on port ' + process.env.PORT + '!');
});
