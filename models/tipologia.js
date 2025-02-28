const mongoose = require('mongoose');

// Schema per la Tipologia
const tipologiaSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,  // Il nome della tipologia (es. "Giochi da tavolo")
        unique: true     // Evita duplicati
    }
});

// Creiamo il modello per Tipologia
const Tipologia = mongoose.model('Tipologia', tipologiaSchema);

// Esportiamo il modello
module.exports = Tipologia;
