const  mongoose = require('mongoose');
const Schema = mongoose.Schema;

let InterventionSchema = new Schema({
    date: {
        type: Date,
        required: true,
    },
    intervento:{
        type: String,
        required: true,
    },
    kilometri: {
        type: Number,
        required: true,
    },
    costo: {
        type: Number,
        required: true,
    }
});
const collection = new mongoose.model('Intervention', InterventionSchema);
module.exports = collection

