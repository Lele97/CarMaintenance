// test/routes/add.test.js
const request = require('supertest');
const app = require('./../app');
const expect = require('chai').expect;

describe('Update /update/{id}}', function () {

    let interventionId
    let interventionKilometri
    let interventionData
    let interventionCosto
    let intervention;

    it('get frist intervention', async function () {
        this.timeout(5000);
        const res = await request(app).get('/data');
        expect(res.status).to.equal(200)//get data

        intervention = res.body;
        interventionId = intervention[0]._id
        interventionKilometri = intervention[0].kilometri
        interventionData = intervention[0].data
        interventionCosto = intervention[0].costo
    })

    it('should update an intervention by _id', async function () {
        this.timeout(5000);
        const res = await request(app).post(`/update/${interventionId}`).send({
            date: interventionData,
            intervento: 'Update Intervention Test',
            kilometri:interventionKilometri,
            costo: interventionCosto
        });

        expect(res.status).to.equal(302); // oppure 200, dipende dal tuo controller
        expect(res.header.location).to.equal('/'); // se redirigi alla home
    });
})