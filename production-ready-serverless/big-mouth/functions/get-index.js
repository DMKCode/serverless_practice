"use strict";

const co = require("co");
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));
const Mustache = require("mustache");
const fetch = require("node-fetch");

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
  const restaurants = await fetch(restaurantsApiRoot);
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
