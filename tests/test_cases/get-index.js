'use strict';

const cheerio = require('cheerio');
const expect = require('chai').expect;
const when = require('../steps/when');
const init = require('../steps/init').init;

describe('When we invoke the GET / endpoint', async () => {
  beforeEach(async () => {
    await init();
  });

  it('should return the index page with 8 restaurants', async () => {
    let res = await when.we_invoke_get_index();

    expect(res.statusCode).to.equal(200);
    expect(res.headers['content-type']).to.equal('text/html; charset=UTF-8');
    expect(res.body).to.not.be.null;

    let $ = cheerio.load(res.body);
    let restaurants = $('.restaurant', '#restaurantsUl');
    expect(restaurants.length).to.equal(8);
  });
});
