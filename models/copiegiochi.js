const mongoose = require('mongoose');

// Definizione dello schema per le copie fisiche dei giochi
const copiaGiocoSchema = new mongoose.Schema({
    gioco: {
        type: mongoose.Schema.Types.ObjectId,  // Riferimento al gioco
        ref: 'Gioco',
        required: true
    },
    proprietario: {
        type: mongoose.Schema.Types.ObjectId,  // Riferimento al proprietario (Giocatore)
        ref: 'Giocatore',
        required: true
    },
    posizione: {
        type: String,  // Posizione fisica della copia del gioco
        required: false
    }
});

// Creiamo il modello 'CopiaGioco'
const CopiaGioco = mongoose.model('CopiaGioco', copiaGiocoSchema);

module.exports = CopiaGioco;
