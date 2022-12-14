import express, { Express, Request, Response} from 'express';
import {  IAgent, IReport } from './types';
const app : Express = express();
const diff = require('dialogflow-fulfillment');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv/config');
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true }, () =>
  console.log(`connected to DB!`)
);

//Middlewares
app.use(cors());
app.use(bodyParser.json());

var myReportModel = require('../models/Report');

app.get('/', (req:Request, res:Response)=>{
 res.send(`<h1>Voicebot-Whistleblower App</h1>`)
})

app.post('/', express.json(), (req:Request, res:Response)=>{
 const agent = new diff.WebhookClient({
  request : req,
  response : res
 });

 function DefaultWelcomeIntent(agent:IAgent) {
  agent.add(`Welcome to whistleblowers. All the calls are recorded, if you do not agree, please stop the call. Available 
  options are: New registration, Check the case, Privacy Policy. [SERVER RESPONSE]`);
 }

 function Checkstatus(agent:IAgent) {
  agent.add(`Please provide the ticket number you would like to learn more about [SERVER RESPONSE]`);
 }

 function Checkstatusprovidenumber(agent:IAgent){
  let keycode = agent.parameters.number;
  return getStatus(keycode)
    .then( (status: string) => {
     agent.add(`Thanks - you provided` + keycode + `the status of your case is still` + status + `Would like to check another case or report a new issue? [SERVER RESPONSE]`);
    })
    .catch( (error:string) => {
      agent.add(`There's no case with, ` + keycode + `keycode` + `.`);
    });
}

function getStatus(keycode:IReport){
return myReportModel.find({_id : keycode}).exec()
  .then( (doc: { status: any; }[]) => {
    return Promise.resolve(doc[0].status);
  });
}

 function Registration(agent:IAgent) {
  agent.add(`To start a new registration, please tell me what category would best describe the case: mobbing, assault or other? [SERVER RESPONSE]`);
 }

 function Registrationcategory(agent:IAgent) {
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

 function Registrationdescriptioncomplete(agent:IAgent) {
  agent.add(`Thank you. Your report has been saved. I will now give you a 16 digit number that you can use to check your report later on. Please say "ready" when you got something to write down the number. [SERVER RESPONSE]`);
 }

 function Registrationprovidenumber(agent:IAgent) {
  let newkeycode = generateKeyCode();
  agent.add(`Your case number is ` + newkeycode + `. Do you want to provide your contact details, or would you rather fill this report anonymously? [SERVER RESPONSE]`);
  Registrationnumberrepeat(newkeycode);
  SaveData(newkeycode);
 }

 function Registrationanonymous(agent:IAgent) {
  agent.add(`Understood - no personal data will be saved. Would you like to report another case or check status of existing one? if you don't need further assistance you can disconnect this call now. [SERVER RESPONSE]`);
  SaveDetails();
}

function Registrationnumberrepeat(keycode: string){
  let newkeycode = parseInt(keycode, 10)
  return `Of course - the number is` + newkeycode + `. Do you want to provide your contact details, or would you rather fill this report anonymously. [SERVER RESPONSE]`;
}

//  function Registrationprovidenumberrepeat(agent:IAgent, newkeycode:IReport) {
  function Registrationprovidenumberrepeat(agent:IAgent) {
  let keycode = Registrationnumberrepeat();
  agent.add(`Of course - the number is` + keycode + `. Do you want to provide your contact details, or would you rather fill this report anonymously. [SERVER RESPONSE]`);
 }

 function Registrationleavecontact(agent:IAgent) {
  agent.add(`Please state you name - either first name, last name or both - and any means of contact (phone number or email) [SERVER RESPONSE]`);
 }

 function Registrationuserdata(agent:IAgent) {
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

 function Registrationgetinfoloop(agent:IAgent) {
  agent.add(`Is there anything you'd like to add? Say "I'm done" to finish the report and go to the next stepl [SERVER RESPONSE]`);
 }

//  function SaveData(keycode:IReport, firstname:IReport, lastname:IReport, email:IReport, phonenumber:IReport, category:IReport, description:IReport){
  function SaveData(...args: (string | undefined)[]){
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

 function SaveToDb(data:Object) {
   let myobj = data;
   return myReportModel.insertOne(myobj, function(err: any, res:Response) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
   })
  }

 var intentMap = new Map();

 intentMap.set('Default Welcome Intent', DefaultWelcomeIntent)
 intentMap.set('Check status', Checkstatus)
 intentMap.set('Check status - provide number', Checkstatusprovidenumber)
 intentMap.set('Registration', Registration)
 intentMap.set('Registration - category', Registrationcategory)
 intentMap.set('Registration - description complete1', Registrationdescriptioncomplete)
 intentMap.set('Registration - provide number1', Registrationprovidenumber)
 intentMap.set('Registration - anonymous1', Registrationanonymous)
 intentMap.set('Registration - provide number1 - repeat', Registrationprovidenumberrepeat)
 intentMap.set('Registration - leave contact', Registrationleavecontact)
 intentMap.set('Registration - user data', Registrationuserdata)
 intentMap.set('Registration - get info loop1', Registrationgetinfoloop)
 agent.handleRequest(intentMap);

});

app.listen(process.env.PORT, ()=>console.log("Server is live at port 8080 💵 💵 💵"));