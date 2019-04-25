"use strict";

const co = require("co");
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));
const Mustache = require("mustache");
const fetch = require("node-fetch");
const URL = require("url");
const aws4 = require("aws4");

const restaurantsApiRoot = process.env.restaurants_api;
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

var html;

const loadHtml = () => {
  if (!html) {
    html = fs.readFileAsync("static/index.html", "utf-8");
  }
  return html;
};

const getRestaurants = async () => {
  let url = URL.parse(restaurantsApiRoot);
  let opts = {
    host: url.hostname,
    path: url.pathname
  };

  aws4.sign(opts);
  const restaurants = await fetch(restaurantsApiRoot, {
    method: "get",
    headers: {
      Host: opts.headers["Host"],
      "X-Amz-Date": opts.headers["X-Amz-Date"],
      Authorization: opts.headers["Authorization"],
      "X-Amz-Security-Token": opts.headers["X-Amz-Security-Token"]
    }
  });
  return await restaurants.json();
};

module.exports.handler = async (event, context) => {
  let template = await loadHtml();
  let restaurants = await getRestaurants();
  let dayOfWeek = days[new Date().getDay()];
  let html = Mustache.render(template, { dayOfWeek, restaurants });

  return {
    statusCode: 200,
    body: html,
    headers: {
      "Content-Type": "text/html; charset=UTF-8"
    }
  };
};
