const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const expect = chai.expect;
const request = require('supertest');

chai.use(chaiHttp);

describe('🌐 ROUTE TESTS :: CarMaintenance', () => {
    it('GET / should return 200 and render home', (done) => {
        request(app)
            .get('/')
            .expect(200, done);
    });

    it('GET /data should return 200 and show interventions', (done) => {
        request(app)
            .get('/data')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.text).to.include('Intervento'); // or something in your template
                done();
            });
    });

    it('GET /add should return 200 and render form', (done) => {
        request(app)
            .get('/add')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.text).to.include('Inserisci un nuovo intervento');
                done();
            });
    });
});
