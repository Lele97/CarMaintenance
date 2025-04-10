// test/routes/add.test.js
const request = require('supertest');
const app = require('../../app');
const expect = require('chai').expect;

describe('POST /add/insert', function () {
    it('should create a new intervention', function (done) {
        request(app)
            .post('/add/insert')
            .send({
                date: '2023-12-31',
                intervento: 'Cambio olio',
                kilometri: 100000,
                costo: 60
            })
            .expect(302) // redirect dopo salvataggio
            .end(function (err, res) {
                if (err) return done(err);
                expect(res.header.location).to.equal('/');
                done();
            });
    });
});
