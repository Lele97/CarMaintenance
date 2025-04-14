const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('./../app');
const expect = chai.expect;
const request = require('supertest');

chai.use(chaiHttp);

describe('🌐 ROUTE TESTS :: CarMaintenance', () => {
    it('GET /data should return 200 and show interventions', async function () {
        this.timeout(5000);
        const res = await request(app).get('/data');
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Intervento');
    });

    it('GET /add should return 200 and render form', async function () {
        this.timeout(5000);
        const res = await request(app).get('/add');
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Inserisci un nuovo intervento');
    });
});

