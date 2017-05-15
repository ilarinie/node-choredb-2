process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../../src/server/app');
const knex = require('../../src/server/db/connection');
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);


describe('routes : index', () => {
  describe('GET /404', () => {
    it('should throw an error', (done) => {
      chai.request(server)
      .get('/404')
      .end((err, res) => {
        res.redirects.length.should.equal(0);
        res.status.should.equal(404);
        res.type.should.equal('application/json');
        res.body.message.should.eql('Not Found');
        done();
      });
    });
  });

});
