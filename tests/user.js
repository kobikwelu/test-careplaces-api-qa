/**
 * Created by maryobikwelu on 3/16/20
**/

const { expect } = require('chai');
const superTest = require('supertest');
let endpoints = require('../data/urls');

const host = superTest(endpoints.urls[1].url_api);



describe('Employee tests', async function(){
    describe('/get', function(){
        it('successful retrieval SMOKE', async function(){
            await host.get('/api/v1/employees')
            .expect(200)
            .expect(function(res){
                expect(res.body.status).to.equal('success');
                expect(res.body.data[1].id).to.equal(2);
                expect(res.body.data[1].employee_name).to.equal('Garrett Winters');
                expect(res.body.data[1].employee_salary).to.equal(170750);
            });
        });
    });
});
