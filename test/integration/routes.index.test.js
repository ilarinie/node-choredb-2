process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../../src/server/app');
const knex = require('../../src/server/db/connection');
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);


var payload_user_with_commune = {
  id: 1,
  expiry: Math.floor(new Date().getTime() + 60 * 60 * 60 * 1000)//7*24*60*60;
};
const token_with_commune = "JWT " + jwt.sign(payload_user_with_commune, process.env.SECRET_KEY);

var payload_user_without_commune = {
  id: 1,
  expiry: Math.floor(new Date().getTime() + 60 * 60 * 60 * 1000)//7*24*60*60;
};
const token_without_commune = "JWT " + jwt.sign(payload_user_without_commune, process.env.SECRET_KEY);

describe('routes : index', () => {
    beforeEach(() => {
        return knex.migrate.rollback()
            .then(() => {
                return knex.migrate.latest();
            })
            .then(() => {
                return knex.seed.run();
            });

    });
    afterEach(() => {
        return knex.migrate.rollback();
    });


  describe('GET /communes', () => {
    it('should return a seeded commune in correct order', (done) => {
      chai.request(server)
      .get('/communes')
      .set('Authorization', token_with_commune)
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        var commune = res.body.commune;
        var chores = res.body.chores;
        var purchases = res.body.purchases;
        purchases.length.should.equal(5);
        chores.length.should.equal(10);
        commune.commune_id.should.equal(1);
        done();
      });
    });
  });

  describe('POST /communes', () => {
    it('should not succeed if user has a commune', (done) => {
      chai.request(server)
          .post('/communes')
          .set('Authorization', token_with_commune)
          .send({
            commune_name: "Proper commune"
          })
          .end((err, res) => {
            should.exist(err);
            err.message.should.equal("Not Acceptable");
            done();
          })
    })
  })


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
