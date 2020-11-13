/**
 * Created by maryobikwelu on 3/16/20
**/

const { expect } = require('chai');
const superTest = require('supertest');
const app = require('../app');
const User = require('../models/User');
const { mocha } = require('mocha');
const generator = require('generate-serial-number');
const serialNumber = generator.generate(3);
const bcrypt = require('bcrypt');

const host = superTest(app);

const testUser = {
    email: `${serialNumber}`+'@test.net',
    password: '',
    name: 'Michael Jackson',
    role: 'dev',
    emailActivationToken: '34534534534erewrwe',
    emailActivationTokenExpiryDate : Date.now() + 60000 * 2
};

const testUserNoEmail = {
    password: '',
    name: 'Jackson Michael',
    role: 'dev'
};

const expiredToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUz' +
    'UxMiJ9.eyJpc3N1ZXIiOiJodHRwOi8vbG9jY' +
    'Wxob3N0OjgwMDAiLCJpc3N1ZWRBdCI6MTU4NDQzNTk3MjM5Nyw' +
    'iZXhwaXJlc0F0IjoxNTg0NDM3NzcyMzk3LCJyb2xlIjoiZGV2I' +
    'iwiZW1haWwiOiJ0ZXN0NkBlbWFpbG9uZS5jb20ifQ.LCc' +
    '2BO_OXg4ZA8SYRgNKAxPdwDnYifLR3yTcujfuuZikWM1WtV3i' +
    'KWZf6Fy--h1SPICljxPpEnomEzErIKF4dQ';

describe('user api tests', async function(){
    describe('/register', function(){
        this.timeout(15000);
        it('successful registration SMOKE', async function(){
            testUser.password = 'testpassword';
            await host.post('/api/v1/user/register')
            .set('Content-Type', 'application/json')
            .send(testUser)
            .expect(200)
            .expect(function(res){
                expect(res.body.message).to.equal('Success');
                expect(res.body.message).to.not.equal('null');
                expect(res.body.user.email).to.equal(testUser.email);
            });
        });
        it('failed registration - missing required attribute - email', async function(){
            await host.post('/api/v1/user/register')
            .set('Content-Type', 'application/json')
            .send(testUserNoEmail)
            .expect(400)
            .expect(function(res){
                expect(res.body.message).to.equal('Bad request. Please check your request');
                expect(res.body.description).to.equal('Missing required attribute/s in body of request');
            });
        });
        it('failed registration - user exists', async function(){
            await host.post('/api/v1/user/register')
            .set('Content-Type', 'application/json')
            .send(testUser)
            .expect(401)
            .expect(function(res){
                expect(res.body.message).to.equal('Your action was unauthorized');
                expect(res.body.description).to.equal('A user with that email already exists');
            });
            await User.findOneAndDelete({ email: testUser.email });
        });
    });
    describe('/login', function(){
        const user = Object.assign({}, testUser);
        this.beforeEach(async function() {
            user.password = await bcrypt.hash('testpassword', 2);
            await User.create(user)
        });
        this.afterEach(async function() {
            await User.findOneAndDelete({ email: user.email });
        });
        it('successful login', async function(){
            await host.post('/api/v1/user/login')
            .set('Content-Type', 'application/json')
            .send({
                "email" : user.email,
                "password": 'testpassword'
            })
            .expect(200)
            .expect(function(res){
                expect(res.body.message).to.equal('Success');
                expect(res.body.payload.token).to.not.equal('null');
                expect(res.body.payload.issuedAt).to.not.equal('null');
                expect(res.body.payload.expires).to.not.equal('null');
            });
        });
        it('failed login - missing required attribute - email | password', async function(){
            await host.post('/api/v1/user/login')
            .set('Content-Type', 'application/json')
            .send({
                "email" : user.email
            })
            .expect(400)
            .expect(function(res){
                expect(res.body.message).to.equal('Bad request. Please check your request');
                expect(res.body.description).to.equal('Missing required attribute/s in body of request');
            });
        });
    });
});
