"use strict";

const AWS = require("aws-sdk");
AWS.config.region = "us-east-1";
const cognito = new AWS.CognitoIdentityServiceProvider();
const chance = require("chance").Chance();

let random_password = () => {
  // needs number, special char, upper and lower case
  return `${chance.string({ length: 8 })}B!gM0uth`;
};

let an_authenticated_user = async () => {
  let userpoolId = process.env.cognito_user_pool_id;
  let clientId = process.env.cognito_server_client_id;

  let firstName = chance.first();
  let lastName = chance.last();
  let password = random_password();
  let email = `${firstName}-${lastName}@dmkcode.com`;
  let username = email;

  let createReq = {
    UserPoolId: userpoolId,
    Username: username,
    MessageAction: "SUPPRESS",
    TemporaryPassword: password,
    UserAttributes: [
      { Name: "given_name", Value: firstName },
      { Name: "family_name", Value: lastName },
      { Name: "email", Value: email }
    ]
  };

  await cognito.adminCreateUser(createReq).promise();

  console.log(`[${username}] - user is created`);

  let req = {
    AuthFlow: "ADMIN_NO_SRP_AUTH",
    UserPoolId: userpoolId,
    ClientId: clientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password
    }
  };
  let resp = await cognito.adminInitiateAuth(req).promise();

  console.log(`[${username}] - initialised auth flow`);

  let challengeReq = {
    UserPoolId: userpoolId,
    ClientId: clientId,
    ChallengeName: resp.ChallengeName,
    Session: resp.Session,
    ChallengeResponses: {
      USERNAME: username,
      NEW_PASSWORD: random_password()
    }
  };
  let challengeResp = await cognito
    .adminRespondToAuthChallenge(challengeReq)
    .promise();

  console.log(`[${username}] - responded to auth challenge`);

  return {
    username,
    firstName,
    lastName,
    idToken: challengeResp.AuthenticationResult.IdToken
  };
};

module.exports = {
  an_authenticated_user
};
