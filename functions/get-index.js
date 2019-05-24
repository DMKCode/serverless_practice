'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const Mustache = require('mustache');
const http = require('superagent-promise')(require('superagent'), Promise);
const URL = require('url');
const aws4 = require('aws4');
const awscred = Promise.promisifyAll(require('./awscred'));

const awsRegion = process.env.AWS_REGION;
const cognitoUserPoolId = process.env.cognito_user_pool_id;
const cognitoClientId = process.env.cognito_client_id;

const restaurantsApiRoot = process.env.restaurants_api;
const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

var html;

const loadHtml = async () => {
  if (!html) {
    html = await fs.readFileAsync('static/index.html', 'utf-8');
  }
  return html;
};

const getRestaurants = async () => {
  let url = URL.parse(restaurantsApiRoot);
  let opts = {
    host: url.hostname,
    path: url.pathname
  };

  if (!process.env.AWS_ACCESS_KEY_ID) {
    let cred = await awscred.loadAsync({ profile: 'dmkcode-US' });
    const {
      credentials: { accessKeyId, secretAccessKey, sessionToken }
    } = cred;
    process.env.AWS_ACCESS_KEY_ID = accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = secretAccessKey;
    if (sessionToken) {
      process.env.AWS_SESSION_TOKEN = sessionToken;
    }

    console.log('AWS Credentials loaded');
  }

  aws4.sign(opts);

  const httpReg = http
    .get(restaurantsApiRoot)
    .set('Host', opts.headers['Host'])
    .set('X-Amz-Date', opts.headers['X-Amz-Date'])
    .set('Authorization', opts.headers['Authorization']);

  if (opts.headers['X-Amz-Security-Token']) {
    httpReg.set('X-Amz-Security-Token', opts.headers['X-Amz-Security-Token']);
  }

  return (await httpReg).body;
};

module.exports.handler = async (event, context, callback) => {
  let template = await loadHtml();
  let restaurants = await getRestaurants();
  let dayOfWeek = days[new Date().getDay()];
  let view = {
    dayOfWeek,
    restaurants,
    awsRegion,
    cognitoUserPoolId,
    cognitoClientId,
    searchUrl: `${restaurantsApiRoot}/search`
  };
  let html = Mustache.render(template, view);

  const response = {
    statusCode: 200,
    body: html,
    headers: {
      'content-type': 'text/html; charset=UTF-8'
    }
  };

  callback(null, response);
};
