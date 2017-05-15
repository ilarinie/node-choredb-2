process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../../src/server/app');
const knex = require('../../src/server/db/connection');
const tokens = require('../tokens');

chai.use(chaiHttp);




describe('routes : communes', () => {
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
      .set('Authorization', tokens.commune_user_token)
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.type.should.equal('application/json');
        var contents = JSON.parse(res.body.contents);
        var commune = contents.commune;
        var chores = contents.chores;
        var purchases = contents.purchases;
        purchases.length.should.equal(2);
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
          .set('Authorization', tokens.commune_user_token)
          .send({
            commune_name: "Proper commune"
          })
          .end((err, res) => {
            should.exist(err);
            err.message.should.equal("Not Acceptable");
            done();
          })
    });
    it('should succeed if user hasnt a commune', (done) => {
      chai.request(server)
          .post('/communes')
          .set('Authorization', tokens.user_without_commune_token)
          .send({
            commune_name: "Proper commune"
          })
          .end((err, res) => {
            should.not.exist(err);
            res.body.message.should.equal("Success")
            done();
          })
    })
  });

  describe('POST /communes/add_user', () => {
    it('should add a user after with a proper request', (done) => {
      chai.request(server)
          .post('/communes/add_user')
          .set('Authorization', tokens.commune_admin_token)
          .send({
            username: "user_without_commune"
          })
          .end((err, res) => {
            should.not.exist(err);
            done();
          })
    });
    it('should not add a user if user already in a commune', (done) => {
      chai.request(server)
          .post('/communes/add_user')
          .set('Authorization', tokens.commune_admin_token)
          .send({
            username: "testUser"
          })
          .end((err, res) => {
            should.exist(err);
            done();
          })
    });
    it('should not add a user if requester not an admin', (done) => {
      chai.request(server)
          .post('/communes/add_user')
          .set('Authorization', tokens.commune_user_token)
          .send({
            username: "test_user_without_commune"
          })
          .end((err, res) => {
            should.exist(err);
            done();
          })
    });




  })

});
