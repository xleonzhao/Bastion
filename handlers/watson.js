// index.js
'use strict'

require('dotenv').config();
var AssistantV2 = require('watson-developer-cloud/assistant/v2'); // watson sdk
// Create the service wrapper
var assistant = new AssistantV2({
  version: '2018-11-08'
});

var newContext = {
  global : {
    system : {
      turn_count : 1
    }
  }
};

var assistantId = process.env.ASSISTANT_ID || '<assistant-id>';
var sessionId = '';
function create_sessionId() {
  assistant.createSession({
    assistant_id: process.env.ASSISTANT_ID || '{assistant_id}',
  }, function (error, response) {
    if (error) {
      console.log("create session id error: " + error);
    } else {
      sessionId = response.session_id;
      console.log("response: " + JSON.stringify(response));
    }
  });
};
create_sessionId();

// Endpoint to be call from the client side
module.exports = async (message, callback) => {
  try {
    if (! assistantId || assistantId === '<assistant-id>') throw "assistant id is missing";
    if (! sessionId) throw "session id has not been created, wait for a moment";
    //message.client.log.console("sessionId: " + JSON.stringify(sessionId));
    //message.client.log.console("input: " + JSON.stringify(message.content));
	  
    var payload = {
      assistant_id: assistantId,
      session_id: sessionId,
      context: newContext,
      input: {
        message_type : 'text',
        text : message.content,
        options : {
          return_context : true
        }
      }
    };
    message.client.log.console("payload: " + JSON.stringify(payload));

    // Send the input to the assistant service
    assistant.message(payload, function (err, data) {
      if (err) {
        throw err;
      } else {
	//message.client.log.console("data: " + JSON.stringify(data));
        callback(message, data);
      }
    });
  }
  catch (e) {
    message.client.log.console("error: " + e);
  }
};

