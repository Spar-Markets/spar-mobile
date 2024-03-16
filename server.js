/*
server.js – Configures the Plaid client and uses Express to defines routes that call Plaid endpoints in the Sandbox environment. Utilizes the official Plaid node.js client library to make calls to the Plaid API.
*/

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const {Configuration, PlaidApi, PlaidEnvironments} = require('plaid');
const mongoose = require('mongoose');

const app = express();
const port = 8000;

// app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


// WE should look at saving this in a .env file which should be safer
const uri = 'mongodb+srv://jjquaratiello:Schoolipad1950!@cluster0.xcfppj4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';



// Mongo

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Define a Song schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  balance: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0.0,
  },
  skillRating: {
    type: mongoose.Schema.Types.Decimal128,
    default: 50.0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  activematches: {
    type: [String],
    default: [],
    required: true,
  },
  plaidPersonalAccess: {
    type: String,
    default: "",
  },
});

const User = mongoose.model('users', userSchema);

app.post("/createUser", async (req, res) => {
    console.log(req.body)
    const { email } = req.body;
    console.log('Received email:', email);
    const newUser = new User({
      email,
    });
    console.log("New User Created")
    await newUser.save();
  });

app.use(
  // FOR DEMO PURPOSES ONLY
  // Use an actual secret key in production
  session({secret: 'bosco', saveUninitialized: true, resave: true}),
);


const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

// Configuration for the Plaid client
const config = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': '65833a47f1ae5c001b9d8fee',
      'PLAID-SECRET': '3838c18936a0e24249069c952b743a',
    },
  },
});

//Instantiate the Plaid client with the configuration
const client = new PlaidApi(config);

//Creates a Link token and return it
app.post('/createLinkToken', async (req, res) => {
  console.log("called")
  let payload1 = {};
  let payload = {};

  console.log(req.body.address)
  //Payload if running iOS
  if (req.body.address === 'localhost') {
    payload1 = {
      user: { client_user_id: 'user' },
      client_name: 'Spar',
      language: 'en',
      products: ['auth'],
      country_codes: ['US'],
      //redirect_uri: process.env.PLAID_SANDBOX_REDIRECT_URI,
    };
  } else {
    //Payload if running Android
    payload = {
      user: { client_user_id: 'user' },
      client_name: 'Spar',
      language: 'en',
      products: ['auth'],
      country_codes: ['US'],
      android_package_name: process.env.PLAID_ANDROID_PACKAGE_NAME,
    };
  }
  console.log("grabbing token")
  const tokenResponse = await client.linkTokenCreate(payload1);
  console.log(tokenResponse.data)
  res.json(tokenResponse.data);
});


// Exchanges the public token from Plaid Link for an access token
app.post('/exchangePublicToken', async function (
  request,
  response,
  next,
) {
  const publicToken = request.body.public_token;
  try {
    const response = await client.itemPublicTokenExchange({
      public_token: publicToken,
    });

    // These values should be saved to a persistent database and
    // associated with the currently signed-in user
    const accessToken = response.data.access_token;
    const itemID = response.data.item_id;
    
    console.log("Success" + accessToken)
    res.json({ public_token_exchange: 'complete' });
  } catch (error) {
    console.log("Error exchanging link for access")
    // handle error
  }
});


// Fetches balance data using the Node client library for Plaid
app.post('/Balance', async (req, res, next) => {
  const access_token = req.session.access_token;
  const balanceResponse = await client.accountsBalanceGet({access_token});
  res.json({
    Balance: balanceResponse.data,
  });
});

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}...`);
});