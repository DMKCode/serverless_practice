"use strict";

const Promise = require("bluebird");
const awscred = Promise.promisifyAll(require("awscred"));

let initialised = false;

let init = async () => {
  if (initialised) {
    return;
  }

  process.env.restaurants_api =
    "https://udj82h717g.execute-api.us-east-1.amazonaws.com/dev/restaurants";
  process.env.restaurants_table = "restaurants";
  process.env.AWS_REGION = "us-east-1";
  process.env.cognito_user_pool_id = "test_cognito_client_id";
  process.env.cognito_client_id = "test_cognito_user_pool_id";

  let cred = await awscred.load((err, data) => {
    const {
      credentials: { accessKeyId, secretAccessKey }
    } = data;
    process.env.AWS_ACCESS_KEY_ID = accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = secretAccessKey;

    console.log("AWS Credentials loaded");
  });

  initialised = true;
};

module.exports.init = init;
