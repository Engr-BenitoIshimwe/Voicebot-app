'use strict';
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

var mongoose = require('mongoose');
var mongoDB = "mongodb://IP:Port/db";
mongoose.connect(mongoDB, {useNewUrlParser: true});
var db = mongoose.connection;
var db = mongoose.connection;
var Schema = mongoose.Schema;
var myCollection = new Schema({name: String,PO: String},{collections: 'myCollection'});
var myCollectionModel = mongoose.model('myCollection', myCollection, 'myCollection');

// db.products.insert( { item: "card", qty: 15 } )

process.env.DEBUG = 'dialogflow:debug';
 
// exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {

app.post('/', express.json(), (req, res)=>{
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  
  function getData(keycode){
   return myCollectionModel.find({keycode : keycode}).exec()
     .then( doc => {
       return Promise.resolve(doc[0].status);
     });
  }

  function addData(...args) {
   const keycode = agent.parameters.keycode;
   const firstname = agent.parameters.firstname;
   const lastname = agent.parameters.lastname;
   const email = agent.parameters.email;
   const phonenumber = agent.parameters.phonenumber;
   const category = agent.parameters.category;
   const description = agent.parameters.description;

   return myCollectionModel.insert({
    keycode: keycode,
    firstname: firstname,
    lastname: lastname,
    email: email,
    phonenumber: phonenumber,
    category: category,
    description: description,
   })
   // .exec()
   //   .then( doc => {
   //     return Promise.resolve(doc[0].PO);
   //   });
  }

 function pending(agent){
   var name = agent.parameters.person;
   return getData(name)
     .then( PO_number => {
      agent.add(name + ", approval pending for following PO");
       agent.add( PO_number );
     })
     .catch( error => {
       agent.add("There no pending PO for approval, " + name + ".");
     });
 }
    
  let intentMap = new Map();
  intentMap.set('pending-PO',pending);
  agent.handleRequest(intentMap);
});

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  var myobj = { name: "Company Inc", address: "Highway 37" };
  dbo.collection("customers").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
  });
});

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  var myobj = [
    { _id: 154, name: 'Chocolate Heaven'},
    { _id: 155, name: 'Tasty Lemon'},
    { _id: 156, name: 'Vanilla Dream'}
  ];
  dbo.collection("products").insertMany(myobj, function(err, res) {
    if (err) throw err;
    console.log(res);
    db.close();
  });
});