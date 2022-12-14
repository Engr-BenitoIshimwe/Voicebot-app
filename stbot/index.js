const express = require('express');
const app = express();
const diff = require('dialogflow-fulfillment');

app.get('/', (req, res)=>{
 res.send("We are live")
})

app.post('/', express.json(), (req, res)=>{
 const agent = new diff.WebhookClient({
  request : req,
  response : res
 });

 function demo(agent) {
  agent.add("Sending response from Webhook server as v1.1.11.1");
 }

 function finalConfirmation(agent) {
  var name = agent.context.get("awaiting_name").parameters['given-name'];
  var email = agent.context.get("awaiting_email").parameters.email;

  console.log(name);
  console.log(email);

  agent.add(`Hello ${name}, your email: ${email}. We confirmed your meeting.`);

  agent.add("Dummy Response");
 }

 var intentMap = new Map();

 intentMap.set('finalConfirmation', finalConfirmation)

 intentMap.set('webhookDemo',demo)

 agent.handleRequest(intentMap);

});

app.listen(3333, ()=>console.log("Server is live at port 3333"));