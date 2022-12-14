'use strict';
const {WebhookClient} = require('dialogflow-fulfillment');
require('dotenv/config');

const mongoose = require('mongoose');
mongoose.connect(process.env.DB_CONNECTION, {useNewUrlParser: true});
const db = mongoose.connection;

// var db = mongoose.connection;
// var Schema = mongoose.Schema;

var myReportModel = require('./models/Report');
 
app.post('/', express.json(), (req, res)=>{
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function Registrationcategory(agent) {
    const Category = agent.parameters.category;
    const category = Category.toLowerCase();
    let missingSlots = [];
    if (!category) { missingSlots.push('Category'); }
    if (missingSlots.length === 1){
     agent.add(`Looks like you didn't provide a ${missingSlots[0]}`);
    } else {
     agent.add(`Ok, I will fill the case under the ${Category} category. Please, describe the case. [SERVER RESPONSE]`);
    }
    SaveData(category);
   }
    

  function Registrationprovidenumber(agent) {
   let newkeycode = generateKeyCode();
   agent.add(`Your case number is ` + newkeycode + `. Do you want to provide your contact details, or would you rather fill this report anonymously? [SERVER RESPONSE]`);
   SaveData(newkeycode);
  }

  function Registrationanonymous(agent) {
   agent.add(`Understood - no personal data will be saved. Would you like to report another case or check status of existing one? if you don't need further assistance you can disconnect this call now. [SERVER RESPONSE]`);
   SaveDetails();
  }

  function Registrationuserdata(agent) {
   const [firstname, lastname, email, phonenumber] = [agent.parameters.firstname, agent.parameters.lastname, agent.parameters.email, agent.parameters.phonenumber];
   let missingSlots = [];
   if (!lastname) { missingSlots.push('lastname');}
   if (missingSlots.length === 1){
    agent.add(`Ops, Looks like you didn't provide a ${missingSlots[0]}[SERVER RESPONSE]`)
   } else {
    agent.add(`Understood - the report will be filled under ${lastname} . We might use your email or phone number to contact you. Would you like to report another issue or check status of existing one? If you don't need further assistance you can disconnect this call now. [SERVER RESPONSE]`);
   } 
   SaveData(firstname, lastname, email, phonenumber);
  }

  function Checkstatusprovidenumber(agent){
    let keycode = agent.parameters.number;
    return getStatus(keycode)
      .then( status => {
       agent.add(`Thanks - you provided` + keycode + `the status of your case is still` + status + `Would like to check another case or report a new issue? [SERVER RESPONSE]`);
      })
      .catch( error => {
        agent.add("There's no case with, " + keycode + `keycode` `.`);
      });
  }

  function getStatus(keycode){
  return myReportModel.find({_id : keycode}).exec()
    .then( doc => {
      return Promise.resolve(doc[0].status);
    });
  }

  function SaveData(keycode, firstname, lastname, email, phonenumber, category, description){
   let data = {
    _id : keycode,
    firstname : firstname,
    lastname : lastname,
    email : email,
    phonenumber : phonenumber,
    category : category,
    description : description,
   }
   return data;
  }

  function SaveDetails(){
   let result = {};
   result = SaveData();
   SaveToDb(result);
   console.log("Data Saved to database")
  }

  function generateKeyCode() {
    return Math.random().toFixed(16).split('.')[1];
  }

  function SaveToDb(data) {
    let myobj = data;
    return myReportModel.insertOne(myobj, function(err, res) {
     if (err) throw err;
     console.log("1 document inserted");
     db.close();
    })
   }

  let intentMap = new Map();
  intentMap.set('Check status - provide number', Checkstatusprovidenumber);
  intentMap.set('Registration - category', Registrationcategory)
  intentMap.set('Registration - provide number1', Registrationprovidenumber)
  intentMap.set('Registration - anonymous1', Registrationanonymous)
  intentMap.set('Registration - user data', Registrationuserdata)



  agent.handleRequest(intentMap);
});