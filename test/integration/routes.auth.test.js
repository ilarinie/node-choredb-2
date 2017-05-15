process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../../src/server/app');
const knex = require('../../src/server/db/connection');
var jscover = require('node-jscover');

console.log(jscover.instrument('', 'routes.auth.test.js'));

chai.use(chaiHttp);

describe('routes : auth', () => {
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
    describe('POST /auth/register', () => {
        it('should register a new user', (done) => {
            chai.request(server)
                .post('/auth/register')
                .send({
                    username: 'testinger',
                    password: 'testPassword'
                })
                .end((err, res) => {
                    should.not.exist(err);
                    res.redirects.length.should.eql(0);
                    res.status.should.eql(200);
                    res.type.should.eql('application/json');
                    res.body.status.should.eql('User created, you can now log in');
                    done();
                });
        });
    });

    describe('POST /auth/login', () => {
        it('should login a user', (done) => {
            chai.request(server)
                .post('/auth/login')
                .send({
                    username: 'testUser',
                    password: 'testPassword'
                })
                .end((err, res) => {
                    should.not.exist(err);
                    res.redirects.length.should.eql(0);
                    res.status.should.eql(200);
                    res.type.should.eql('application/json');
                    res.body.message.should.eql('Succesfully authenticated.');
                    done();
                });
        });
        it('should not login an unregistered user', (done) => {
            chai.request(server)
                .post('/auth/login')
                .send({
                    username: 'completetyWrong',
                    password: 'authentication'
                })
                .end((err, res) => {
                    should.exist(err);
                    res.redirects.length.should.eql(0);
                    res.status.should.eql(401);
                    res.type.should.eql('application/json');
                    done();
                });
        });
    });
    describe('GET /auth/validate_token', () => {
        it('should return true with  valid token', (done) => {
            var token = "";

            chai.request(server)
                .post('/auth/login')
                .send({
                    username: 'testUser',
                    password: 'testPassword'
                })
                .end((err, res) => {
                    should.not.exist(err);
                    token = res.body.token;
                    testToken();
                });

            function testToken() {
                chai.request(server)
                    .get('/auth/validate_token')
                    .set('Authorization', "JWT " + token)
                    .end((err, res) => {
                        should.not.exist(err);
                        res.body.status.should.eql('Token valid.');
                        res.status.should.eql(200);
                        res.redirects.length.should.eql(0);
                        done();
                    });
            }
        });
        it('should return false with invalid token', (done) => {
            var token = "wrongtoken";
            chai.request(server)
                .post('/auth/login')
                .send({
                    username: 'testUser',
                    password: 'testPassword'
                })
                .end((err, res) => {
                    should.not.exist(err);
                    testToken();
                });

            function testToken() {
                chai.request(server)
                    .get('/auth/validate_token')
                    .set('Authorization', "JWT " + token)
                    .end((err, res) => {
                        should.exist(err);
                        err.status.should.eql(401);
                        done();
                    });
            }

        });
    });
});
