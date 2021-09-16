const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const HttpsProxyAgent = require('https-proxy-agent');

// const httpsAgent = new HttpsProxyAgent("http://localhost:8080");

dotenv.config({ path: '.env' });

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

const assistant = new AssistantV2({
  version: '2020-09-24',
  authenticator: new IamAuthenticator({
    apikey: process.env.ASSISTANT_V1_IAM_APIKEY,
  }),
  serviceUrl:process.env.SERVICE_URL
});


app.get('/api/session', (req, response) => {

  assistant.createSession({
    assistantId: process.env.ASSISTANT_ID
  })
    .then(res => {
      response.status(201).json({ sessionId: res.result });
    })
    .catch(err => {
      console.log(err)
      response.status(500).json({ msg: "Internal Server Error" });
    });
})


app.post('/api/message', (req, res) => {

  const message = req.body.message;
  const sessionId = req.body.sessionId;

  assistant.message({
    assistantId: process.env.ASSISTANT_ID,
    sessionId:sessionId,
    input: {
      'message_type': "text",
      'text': message
    }
  })
    .then(result => {
      res.json({ message: result.result });
    })
    .catch(err => {
      console.log(err);
    });
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:3000`)
})

module.exports = app;