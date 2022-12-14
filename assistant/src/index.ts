import { dialogflow, SimpleResponse } from "actions-on-google";
import express, { RequestHandler } from "express";
import cors from "cors";
import bodyParser, { json } from "body-parser";
 
const http = express();
const assistant = dialogflow();
 
http.on("error", function (err) {
  console.log(err);
});
 
http.listen(8080, function () {
  console.log("listening");
});
 
http.use(cors());
// http.use(json(), assistant);
http.use(bodyParser.json() as RequestHandler);
http.use(bodyParser.urlencoded({ extended: true }) as RequestHandler, assistant);
 
assistant.intent("Default Welcome Intent", (conv) => {
  conv.ask(
    new SimpleResponse({
      text: "Welcome to GFT Bank",
      speech: "Welcome to GFT Bank",
    })
  );
});
 
assistant.intent("BankStatement", (conv) => {
  conv.ask(
    new SimpleResponse({
      text: "Sorry Bart, you don't have any money in your banking account!",
      speech: "Sorry Bart, you don't have any money in your banking account!",
    })
  );
});

assistant.intent("Age", (conv) => {
  conv.ask(
    new SimpleResponse({
      text: "21 years old",
      speech: "21 years old",
    })
  );
});