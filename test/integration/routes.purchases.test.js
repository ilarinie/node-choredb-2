process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../../src/server/app');
const knex = require('../../src/server/db/connection');
const tokens = require('../tokens');

chai.use(chaiHttp);


describe('routes : chores', () => {
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

  describe('POST & DELETE /purchases', () => {
    it('can create and delete a purchase', (done) => {
      chai.request(server)
          .post('/purchases')
          .set('Authorization', tokens.commune_admin_token)
          .send({
            description: "ASD",
            amount: 1.1
          })
          .end((err, res) => {
            should.not.exist(err);
            res.body.message.should.equal("Purchase created.");
            deletePurchase();
          })

          function deletePurchase() {
            chai.request(server)
                .delete('/purchases/1')
                .set('Authorization', tokens.commune_admin_token)
                .send()
                .end((err, res) => {
                  should.not.exist(err);
                  res.body.message.should.equal("Purchase cancelled succesfully");
                  done();
                });
          }
      });
  });

  describe('GET /purchases', () => {
    it('can get a list of purchases', (done) => {
      chai.request(server)
          .get('/purchases')
          .set('Authorization', tokens.commune_admin_token)
          .send()
          .end((err, res) => {
            should.not.exist(err);
            res.body.message.should.equal("List of purchases provided.");
            var purchases = JSON.parse(res.body.contents);
            purchases.length.should.equal(10);
            done();
          })

    })


  });
});
