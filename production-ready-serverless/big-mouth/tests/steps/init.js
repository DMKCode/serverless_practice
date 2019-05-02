"use strict";

const Promise = require("bluebird");

let initialised = false;

let init = async () => {
  if (initialised) {
    return;
  }

  process.env.restaurants_api =
    "https://udj82h717g.execute-api.us-east-1.amazonaws.com/dev/restaurants";
  process.env.restaurants_table = "restaurants";
  process.env.AWS_REGION = "us-east-1";
  process.env.cognito_client_id = "test_cognito_user_pool_id";
  process.env.cognito_user_pool_id = "us-east-1_DoRcnwa16";
  process.env.cognito_server_client_id = "51qf54ln3hh63vct86dln3v8ge";

  initialised = true;
};

module.exports.init = init;
