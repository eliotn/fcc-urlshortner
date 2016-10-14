var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId; 
var url = require('url')
mongo.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/learnyoumongo", {native_parser:true}, function(err, db) {
  
  if (err) {
    console.error(err.toString());
    return;
  }
  db.collection('counters').insert( { "_id": "urlcounter", "seq":"0"}, null,
  function(err, results) {
    if (err) {db.close(); return;}//already here
    db.close();
    return;
  });
  //db.collection('urls').createIndex({_id: "hashed"});
});



app.use(express.static(__dirname + '/public'));
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
      return;
    }
    //add a blank entry first, then fetch the id and use
    //that to show where to access everything
    
    //hash 
    var id = -1;
    db.collection('counters').update(
    { _id: "urlcounter" },
    { $inc: { seq: 1 } }, function(err, result) {
      if (err) { res.send({"error":err.toString()}); }
      db.collection('counters').find({"_id":"urlcounter"}).toArray(function(err, result) {
        if (err) { res.send({"error":err.toString()}); }
        id = result[0].seq;
        console.log(id);
        if (id === -1) {res.send({"error":"could not generate the url: -1"});return;}
        var urlobj = {
          "createdAt": new Date(),
          "originalurl":extractedurl,
          "_id": id.toString()
        };
        db.collection('urls').insert(urlobj, function(err) {
          if (err) {
            res.send({"error":err.toString()});
            return;
          }
          else {
            console.log(urlobj);
            console.log(urlobj._id);
            db.close();
            res.send({
              "shortenedurl": req.headers.host + "/v/" + urlobj._id,
              "originalurl": urlobj.originalurl
            });
          }
          
        })
      });
    });
    
    
    
  });
});

app.get('/v/:UNIQUEID', function (req, res) {
  mongo.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/learnyoumongo", {native_parser:true}, function(err, db) {
    if (err) {
      console.error(err.toString());
      return;
    }
    //"_id":req.params.UNIQUEID
    db.collection("urls").find({"_id":req.params.UNIQUEID.toString()}).toArray(function(err, results) {
      if (err || !results.length) {
        if (err) {
          console.error("Error: " + err.toString());
        }
        else {
          console.log("Length" + results.length);
        }
        var errstring = "Could not access the entered in url";
        res.send(errstring);
        db.close();
      }
      else {
        console.log(results)
        console.log(results[0].originalurl);
        res.redirect(301, results[0].originalurl);
        db.close();
      }
    }); 
  });  
});


app.listen(process.env.PORT, function () {
  console.log('Example app listening on port ' + process.env.PORT + '!');
});
