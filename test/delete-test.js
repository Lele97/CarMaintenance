// test/routes/add.test.js
const request = require('supertest');
const app = require('./../app');
const expect = require('chai').expect;

describe('DELETE /delete/{id}}', function () {

    let interventionId

    it('get _id for frist intervention', async function () {
        this.timeout(5000);
        const res = await request(app).get('/data');
        expect(res.status).to.equal(200)//get data

        const intervention = res.body;
        interventionId = intervention[0]._id
    })

    it('should delete an intervention by _id', async function () {
        this.timeout(5000);
        const res = await request(app).post(`/delete/${interventionId}`);

        expect(res.status).to.equal(302); // oppure 200, dipende dal tuo controller
        expect(res.header.location).to.equal('/'); // se redirigi alla home
    });
})