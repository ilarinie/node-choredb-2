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

    describe('POST and DELETE /chores', () => {
      it('should create a new chore with a proper request', (done) => {
        chai.request(server)
            .post('/chores')
            .set('Authorization', tokens.commune_admin_token)
            .send({
              name: "Proper Chore",
              priority: 20,
              points: 20
            })
            .end((err, res) => {
              should.not.exist(err);
              chai.request(server)
                  .get('/communes')
                  .set('Authorization', tokens.commune_admin_token)
                  .end((err, res) => {
                    var contents = JSON.parse(res.body.contents);
                    var chores = contents.chores;
                    chores.length.should.equal(11);
                    done();
                  });
            })
      });
      it('should not create a new chore with an improper request', (done) => {
        chai.request(server)
            .post('/chores')
            .set('Authorization', tokens.commune_admin_token)
            .send({
              name: null,
              priority: null,
              points: null
            })
            .end((err, res) => {
              should.exist(err);
              done();
            })
      });
      it('should delete an existing chore with a proper request', (done) => {
          chai.request(server)
              .delete('/chores/1')
              .set('Authorization', tokens.commune_admin_token)
              .send()
              .end((err, res) => {
                should.not.exist(err);
                done();
              })
      });
      it('should not delete a chore of another commune', (done) => {
          chai.request(server)
              .delete('/chores/20')
              .set('Authorization', tokens.commune_admin_token)
              .send()
              .end((err,res) => {
                should.exist(err);
                done();
              })
      });
      it('should not delete a chore if user is not an admin', (done) => {
         chai.request(server)
             .delete('/chores/1')
             .set('Authorization', tokens.commune_user_token)
             .send()
             .end((err, res) => {
                should.exist(err);
                done();
             })
      });
    });

    describe('POST /chores/:id/do', () => {
      it('should succeed with a proper user and chore id', (done) => {
        chai.request(server)
            .post('/chores/1/do')
            .set('Authorization', tokens.commune_admin_token)
            .send()
            .end((err, res) => {
              should.not.exist(err);
              chai.request(server)
                  .get('/chores')
                  .set('Authorization', tokens.commune_admin_token)
                  .send()
                  .end((err, res) => {
                      should.not.exist(err);
                      var chores = JSON.parse(res.body.contents);
                      chores[0].tasks.length.should.equal(1)
                      chores[1].tasks.length.should.equal(0);
                      done();
                  })
            })
      })
      it('should fail with an improper chore id', (done) => {
        chai.request(server)
            .post('/chores/6/do')
            .set('Authorization', tokens.commune_admin_token)
            .send()
            .end((err, res) => {
              should.exist(err);
              done();
            })
      })
    });

    describe('GET /chores', () => {
        it('should receive a valid list of chores', (done) => {
            chai.request(server)
                .get('/chores')
                .set('Authorization', tokens.commune_admin_token)
                .send()
                .end((err, res) => {
                    should.not.exist(err);
                    var chores = JSON.parse(res.body.contents);
                    chores.length.should.equal(10);
                    chores[0].tasks.length.should.equal(0);
                    done();
                });
        })
    })



});
