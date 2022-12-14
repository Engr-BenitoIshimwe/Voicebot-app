'use strict';

const express = require('express')
const { WebhookClient } = require('dialogflow-fulfillment')
const app = express()
const MIN_SEQUENCE_LENGTH = 10;

app.listen(process.env.PORT || 8080, () => {
  console.log("listening to 🔥🔥🔥🔥🔥🔥localhost:8080 🔥🔥🔥🔥🔥")
})

app.get('/', (req, res) => res.send('online'))
app.post('/dialogflow', express.json(), (req, res) => {
  const agent = new WebhookClient({ request: req, response: res })

  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  let dfRequest = request.body;
  let action = dfRequest.queryResult.action;
  switch (action) {
    case 'handle-sequence':
      handleSequence(dfRequest, response);
      break;
    case 'validate-sequence':
      validateSequence(dfRequest, response);
      break;
    default:
      response.json({
        fulfillmentText: `Webhook for action "${action}" not implemented.`
      });
  }


  ////
  // Helper functions

  /* Send an SSML response.
  * @param request: Dialogflow WebhookRequest JSON with camelCase keys.
  *     See https://cloud.google.com/dialogflow/es/docs/reference/common-types#webhookrequest
  * @param response: Express JS response object
  * @param ssml: SSML string.
  * @example: sendSSML(request, response, 'hello')
  *     Will call response.json() with SSML payload '<speak>hello</speak>'
  */
  function sendSSML(request, response, ssml) {
    ssml = `<speak>${ssml}</speak>`;

    if (request.originalDetectIntentRequest.source == 'GOOGLE_TELEPHONY') {
      // Dialogflow Phone Gateway Response
      // see https://cloud.google.com/dialogflow/es/docs/reference/rpc/google.cloud.dialogflow.v2beta1#google.cloud.dialogflow.v2beta1.Intent.Message.TelephonySynthesizeSpeech
      response.json({
        fulfillmentMessages: [{
          platform: 'TELEPHONY',
          telephonySynthesizeSpeech: {ssml: ssml}
        }]
      });
    }
    else {
      // Some CCAI telephony partners accept SSML in a plain text response.
      // Check your specific integration and customize the payload here.
      response.json({
        fulfillmentText: ssml
      });
    }
  }

  /* Extract an output context from the incoming WebhookRequest.
  * @param request: Dialogflow WebhookRequest JSON with camelCase keys.
  *     See https://cloud.google.com/dialogflow/es/docs/reference/common-types#webhookrequest
  * @param name: A string
  * @return: The context object if found, or undefined
  * @see: https://cloud.google.com/dialogflow/es/docs/reference/rpc/google.cloud.dialogflow.v2#google.cloud.dialogflow.v2.Context
  *     and note this webhook uses JSON camelCase instead of RPC snake_case.
  * @example:
  *     // Modify an existing output content
  *     let context = getOutputContext(request, 'some-context');
  *     context.lifespanCount = 5;
  *     context.parameters.some_parameter = 'new value';
  *     response.json({
  *       fulfillmentText: 'new value set',
  *       outputContexts: [context]
  *     });
  */
  function getOutputContext(request, name) {
    return request.queryResult.outputContexts.find(
        context => context.name.endsWith(`/contexts/${name}`)
    );
  }

  ////
  // Action handler functions

  /*
  * Fulfillment function for:
  *     actions: handle-sequence
  *     intents: "Sequence", "Sequence - Edit"
  * @param request: Dialogflow WebhookRequest JSON with camelCase keys.
  *     See https://cloud.google.com/dialogflow/es/docs/reference/common-types#webhookrequest
  * @param response: Express JS response object
  */
  function handleSequence(request, response) {
    let parameters = request.queryResult.parameters;
    let isSlotFilling = !request.queryResult.allRequiredParamsPresent;
    let isEditing = getOutputContext(request, 'editing-sequence');
    console.log(request.queryResult.action + ': ' + JSON.stringify(parameters));

    if (isSlotFilling) {
      // Prompt the user for the sequence

      let verbatim = `<prosody rate="slow"><say-as interpret-as="verbatim">${parameters.existing_sequence}</say-as></prosody>`;

      if (!parameters.existing_sequence && !parameters.new_sequence) {
        // Initial prompt
        response.json({
          fulfillmentText: "What is your sequence? Please pause after a few characters so I can confirm as we go."
        });
      }
      else if (!isEditing) {
        // Confirm what the system heard with the user. We customize the response
        // according to how many sequences we've heard to make the prompts less
        // verbose.
        if (!parameters.previous_sequence) {
          // after the first input
          sendSSML(request, response,
              `Say "no" to correct me at any time. Otherwise, what comes after ${verbatim}`);
        }
        else if (parameters.existing_sequence.length < MIN_SEQUENCE_LENGTH) {
          // we know there are more characters to go
          sendSSML(request, response,
              `${verbatim} What's next?`);
        }
        else {
          // we might have all we need
          sendSSML(request, response,
              `${verbatim} What's next? Or say "that's all".`);
        }
      }
      else {
        // User just said "no"
        sendSSML(request, response,
            `Let's try again. What comes after ${verbatim}`);
      }
    }
    else {
      // Slot filling is complete.

      // Construct the full sequence.
      let sequence = (parameters.existing_sequence || '') + (parameters.new_sequence || '');

      // Trigger the follow up event to get back into slot filling for the
      // next sequence.
      response.json({
        followupEventInput: {
          name: 'continue-sequence',
          parameters: {
            existing_sequence: sequence,
            previous_sequence: parameters.existing_sequence || ''
          }
        }
      });

      // TODO: CHALLENGE: consider validating the sequence here.
      // The user has already confirmed existing_sequence, so if you find a unique
      // record in your database with this existing_sequence prefix, you could send
      // a followUpEventInput like 'validated-sequence' to skip to the next part
      // of the flow. You could either create a new intent for this event, or
      // reuse the "Sequence - done" intent. If you reuse the "done" intent, you
      // could add another parameter "assumed_sequence" with value
      // "#validated-sequence.sequence", then modify the validateSequence function
      // below to customize the response for this case.
    }
  }

  /*
  * Fulfillment function for:
  *     action: validate-sequence
  *     intents: "Sequence - Done"
  * @param request: Dialogflow WebhookRequest JSON with camelCase keys.
  *     See https://cloud.google.com/dialogflow/es/docs/reference/common-types#webhookrequest
  * @param response: Express JS response object
  */
  function validateSequence(request, response) {
    let parameters = request.queryResult.parameters;
    // TODO: add logic to validate the sequence and customize your response
    let verbatim = `<say-as interpret-as="verbatim">${parameters.sequence}</say-as>`;
    sendSSML(request, response, `Thank you. Your sequence is ${verbatim}`);
  }


  // function welcome () {
  //   agent.add('Welcome to my agent!')
  // }

  // function fallback (agent) {
  //   agent.add(`I didn't understand`);
  //   agent.add(`I'm sorry, can you try again?`);
  // }

  // let intentMap = new Map()
  // intentMap.set('Default Welcome Intent', welcome)
  // agent.handleRequest(intentMap)
})


