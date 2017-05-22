process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../../src/server/app');
const knex = require('../../src/server/db/connection');
const tokens = require('../tokens');


chai.use(chaiHttp);

describe('routes : users', () => {
    beforeEach(() => {
        return knex.migrate.rollback().then(() => {
            return knex.migrate.latest();
        })
        .then(() => {
            return knex.seed.run();
        });

    });
    afterEach(() => {
        return knex.migrate.rollback();
    });

    describe('GET /users', () => {
        it('should get a proper list of users with a proper request', (done) => {
            chai.request(server)
                .get('/users')
                .set('Authorization', tokens.commune_admin_token)
                .send()
                .end((err, res) => {
                    should.not.exist(err);
                    var users = res.body.contents;
                    users.length.should.equal(2);
                    done();
                })
        });

    });
    describe('DELETE /users/:user_id', () => {
       it('should remove user from the commune with a proper admin request', (done) => {
           chai.request(server)
               .delete('/users/d0f6c11a-826f-43ac-a309-e52d6c6e5271')
               .set('Authorization', tokens.commune_admin_token)
               .send()
               .end((err, res) => {
                    should.not.exist(err);
                    done();
               });
       });
       it('should not remove user from another commune', (done) => {
           chai.request(server)
               .delete('/users/d0f6c11a-9999-43ac-a309-e52d6c6e5271')
               .set('Authorization', tokens.commune_admin_token)
               .send()
               .end((err, res) => {
                   should.exist(err);
                   done();
               });
       })
    });
    describe('PUT /users', () => {
       it('should update users info after a proper request', (done) => {
          chai.request(server)
              .put('/users')
              .set('Authorization', tokens.commune_admin_token)
              .send({name: "Matti"})
              .end((err, res) => {
                should.not.exist(err);
                done();
              });
       });
    });


});