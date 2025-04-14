// test/routes/add.test.js
const request = require('supertest');
const app = require('./../app');
const expect = require('chai').expect;

describe('POST /add/insert', function () {
    it('should create a new intervention', async function () {
        this.timeout(5000); // Se il DB è lento o c'è un redirect

        const res = await request(app)
            .post('/add/insert')
            .send({
                date: '2023-12-31',
                intervento: 'Cambio olio',
                kilometri: 100000,
                costo: 60
            });

        expect(res.status).to.equal(302); // check del redirect
        expect(res.header.location).to.equal('/');
    });
});
