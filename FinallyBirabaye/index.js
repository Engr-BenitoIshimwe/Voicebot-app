'use strict';

const express = require('express')
const { WebhookClient } = require('dialogflow-fulfillment')
const app = express()
const { struct } = require('pb-util'); 
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv/config');

//Middlewares
app.use(cors());
app.use(bodyParser.json());

//Import Routes
const personsRoute = require('./routes/persons');

app.use('/persons', personsRoute);

app.get('/', (req, res) => res.send('online'))
app.post('/dialogflow', express.json(), (req, res) => {
  const agent = new WebhookClient({ request: req, response: res })

  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  let dfRequest = request.body;
  let action = dfRequest.queryResult.action;
  switch (action) {
    case 'handle-policy':
      handlePolicy(dfRequest, response);
      break;
    case 'handle-recording':
      handleRecording(dfRequest, response);
      break;
    case 'handle-case':
      handleCase(dfRequest, response);
      break;
    case 'handle-registration':
      handleRegistration(dfRequest, response);
      break;
    case 'handle-keycode':
      handleKeycode(dfRequest, response);
      break;
    default:
      response.json({
        fulfillmentText: `Webhook for action "${action}" not implemented.`
      });
  }

  function sendSSML(request, response, ssml) {
    ssml = `<speak>${ssml}</speak>`;

    if (request.originalDetectIntentRequest.source == 'GOOGLE_TELEPHONY') {
      response.json({
        fulfillmentMessages: [{
          platform: 'TELEPHONY',
          telephonySynthesizeSpeech: {ssml: ssml}
        }]
      });
    }
    else {
      response.json({
        fulfillmentText: ssml
      });
    }
  }

  function getOutputContext(request, name) {
    return request.queryResult.outputContexts.find(
        context => context.name.endsWith(`/contexts/${name}`)
    );
  }

  function getInputContext(request, name) {
    return request.queryResult.inputContexts.find(
        context => context.name.endsWith(`/contexts/${name}`)
    );
  }

  function handlePolicy(request, response){
   sendSSML(request, response,
       `Check Our privacy policy: 1...., 2....., 3......, 4........ to check the status of your case Please say<p><s>Check my Status</s></p>to continue to the registration Please say<p><s>New registration</s></p>`);
  }
  
  function handleRecording(request, response) {
   let parameters = request.queryResult.parameters;

   console.log(request.queryResult.action + ': ' + JSON.stringify(parameters));

   // Save description to database
   SaveRecording(parameters.description);

   sendSSML(request, response,
    `Thank you for sharing that with us. Please let us know if you would like to provide your personal details? (Yes/No)`);
  }

 function handleCase(request, response) {
  let parameters = request.queryResult.parameters;
  console.log(request.queryResult.action + ': ' + JSON.stringify(parameters));

    let result = checkingStatus(parameters.keycode);

    sendSSML(request, response, `The status of your case is: ${result}If you wish to hear back please say "Replay" or say "Finish" to get back to the Menu`);
    }

    response.json({
     followupEventInput: {
      name: 'continue-status',
      parameters: {
       keycode: parameters.keycode,
      }
     }
    })
  

  function checkingStatus(keycode) {
    // send keycode to database to find status
   return `Case with case number ${keycode} the status is still in progress`;
  }

  function handleRegistration(request, response) {
   let parameters = request.queryResult.parameters;
   console.log(request.queryResult.action + ': ' + JSON.stringify(parameters));
   let firstname = parameters.firstname;
   let lastname = parameters.lastname;
   let email = parameters.email;
   
  //  Save person details to database
  let result = SaveDetails(firstname, lastname, email);

  sendSSML(request, response, `Thank you for providing your personal details. Your registration has been recorded. Please prepare something to write down your key code that will be required to check the status of your registration. Say "Ready" when you are ready to hear the number`);
  }

  function handleKeycode(request, response) {
   let newkeycode = generateKeyCode();
   let verbatim = `<say-as interpret-as="verbatim">${newkeycode}</say-as>`;
   sendSSML(request, response, `Your key code is: ${verbatim} . Please say "Repeat" if you wish me to repeat the number or say "Finish" to get back the Menu`);
   // Save keycode to database
   let result = SavekeyCode(newkeycode);
  }

  function generateKeyCode() {
   return Math.random().toFixed(16).split('.')[1];
  }
}

//connect to db
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true }, () =>
  console.log('connected to DB!')
);
/**
 * now listing the server on port number 8080 :)
 */
app.listen(8080, () => {
  console.log("Server is Running on port 8080🔥🔥🔥")
})