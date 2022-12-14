const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv/config');

//Middlewares
app.use(cors());
app.use(bodyParser.json());

// Import Routes
const reportsRoute = require('./routes/reports');

app.use('/reports', reportsRoute);

// ROUTES
app.get('/', (req, res) => {
  res.send(`<h1>Whistleblower</h1>`);

  function mongoHandler(agent){
    var MongoClient = require('mongodb').MongoClient;
    var url = process.env.DB_CONNECTION;
  
    MongoClient.connect(url,{useUnifiedTopology: true},function(err, db) {
      if (err) throw err;
      var dbo = db.db("Whistleblower");
      var query = { keycode: "1111111111111111"};
      // var query = { firstname: "Benito" }; whatever you want to bring out
      dbo.collection("reports").find(query).toArray(function(err, result) {
        if (err) throw err;
        var x =result[0].FirstName;
        // var x = result[0]; // this will bring out everything
        // var x =result[0].status;
        console.log(x);
        agent.add("Hello"+x);
        db.close();
      });
  });
      agent.add(`Mongo connected`);// this single line code works but when i try to define x here     it's not working
  }
  
      
    let intentMap = new Map();
  
    intentMap.set('getMongo', mongoHandler);
    agent.handleRequest(intentMap);
});

//connect to db
// mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true }, () =>
//   console.log(`connected to DB!`)
// );

app.listen(8090, ()=>console.log("Server is live at port 8090 💵 💵 💵 "));