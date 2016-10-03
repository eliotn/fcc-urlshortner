var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId; 
var url = require('url')
var largeprime = 492876289;
app.get('/new/*', function (req, res) {
  res.set({'Content-Type': 'application/json'});
  var extractedurl = req.path.slice(5);
  //TODO: Maybe this coud be better
  if (!url.parse(extractedurl).protocol) {
    res.send({"error":"The url does not contain a valid protocol!"});
    return;
  }
  mongo.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/learnyoumongo", {native_parser:true}, function(err, db) {
    if (err) {
      console.error(err.toString());
      res.send("I could not generate a new url!");
      db.close();
      return;
    }
    //add a blank entry first, then fetch the id and use
    //that to show where to access everything
    
    var urlobj = {
        "originalurl":extractedurl
    };
    db.collection('urls').insert(urlobj, function(err) {
      if (err) {
        res.send({"error":err.toString()});
        return;
      }
      else {
        console.log(urlobj._id);
        res.send({
          "shortenedurl": req.headers.host + "/v/" + urlobj._id,
          "originalurl": urlobj.originalurl
        });
      }
      db.close();
    })
    
    
  });
});

app.get('/v/:UNIQUEID', function (req, res) {
  console.log(req.params.UNIQUEID);
  mongo.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/learnyoumongo", {native_parser:true}, function(err, db) {
    if (err) {
      console.error(err.toString());
      return;
    }
    try {
      var query = {
        "_id" : {
          "$in" : [ ObjectId(req.params.UNIQUEID) ]
        }
      };
    }
    catch (err) {
      res.send("Could not access the entered url, bad format")
      db.close()
    }
    db.collection("urls").find(query).toArray(function(err, results) {
      if (err || !results.length) {
        if (err) {
          console.error(err.toString());
        }
        else {
          console.log(results.length);
        }
        var errstring = "Could not access the entered in url";
        res.send(errstring);
        db.close();
      }
      else {
        res.redirect(301, results[0].originalurl);
        db.close();
      }
    }); 
  });  
});


app.listen(process.env.PORT, function () {
  console.log('Example app listening on port ' + process.env.PORT + '!');
});
