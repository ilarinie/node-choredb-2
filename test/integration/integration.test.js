process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../../src/server/app');
const knex = require('../../src/server/db/connection');
const tokens = require('../tokens');

chai.use(chaiHttp);

describe('routes : integration', () => {
    beforeEach(() => {
        return knex.migrate.rollback().then(() => {
            return knex.migrate.latest();
        });

    });
    afterEach(() => {
        return knex.migrate.rollback();
    });

    it('User is able to register, log in, create a commune and create a chore', (done) => {
        var token = "";
        // register
        chai.request(server).post('/auth/register').send({username: "tester", password: "tester"}).end((err, res) => {
            should.not.exist(err);
            logIn();
        })
        function logIn() {
            chai.request(server).post('/auth/login').send({username: "tester", password: "tester"}).end((err, res) => {
                should.not.exist(err);
                should.exist(res.body.contents.token);
                token = "JWT " + res.body.contents.token;
                createCommune();
            });
        }
        function createCommune() {
            chai.request(server).post('/communes').set('Authorization', token).send({commune_name: "testCommune"}).end((err, res) => {
                should.not.exist(err);
                createChore();
            });
        }
        function createChore() {
          chai.request(server).post('/chores').set('Authorization', token).send({name: "testChore", priority: 1, points: 1}).end((err, res) => {
              should.not.exist(err);
              createPurchase();
          });
        }
        function createPurchase() {
          chai.request(server).post('/purchases').set('Authorization', token).send({description: "testPurchase", amount: 1.99}).end((err, res) => {
              should.not.exist(err);
              getCommune();
          });
        }
        function getCommune() {
          chai.request(server).get('/communes').set('Authorization', token).send().end((err, res) => {
              should.not.exist(err);
              var contents = res.body.contents;
              var commune = contents.commune;
              var chores = contents.chores;
              var purchases = contents.purchases;
              purchases.length.should.equal(1);
              purchases[0].amount.should.eql('1.99');
              chores.length.should.equal(1);
              commune.commune_id.should.equal(1);
              deleteChore();
          });
        }

        function deleteChore() {
          chai.request(server).delete('/chores/1').set('Authorization', token).send().end((err, res) => {
              should.not.exist(err);
              deletePurchase();
          });
        }

        function deletePurchase() {
          chai.request(server).delete('/purchases/1').set('Authorization', token).send().end((err, res) => {
              should.not.exist(err);
              getCommune2();
          });
        }

        function getCommune2(){
          chai.request(server).get('/communes').set('Authorization', token).send().end((err, res) => {
              should.not.exist(err);
              var contents = res.body.contents;
              var commune = contents.commune;
              var chores = contents.chores;
              var purchases = contents.purchases;
              purchases.length.should.equal(2);
              purchases[1].amount.should.equal('1.99');
              commune.commune_id.should.equal(1);
              done();
          });
        }

    });

});
