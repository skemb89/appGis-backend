const mongoose = require('mongoose');

// Definizione dello schema per Giochi (dati generali del gioco)
const giocoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
    },
    tipologia: {
        type: mongoose.Schema.Types.ObjectId,  // Riferimento alla collezione Tipologie
        ref: 'Tipologia',
        required: true, 
    },
    durataMedia: {
        type: Number,  // Durata media in minuti
        required: false, 
    },
    difficolta: {
        type: Number,  // Difficoltà BGG
        required: false, 
    },
    giocatoriMin: {
        type: Number,  // Numero minimo di giocatori
        required: false, 
    },
    giocatoriMax: {
        type: Number,  // Numero massimo di giocatori
        required: false, 
    },
    bggId: {
        type: Number,  // ID del gioco su BoardGameGeek
        unique: false,
        sparse: true
    }
});

// Creiamo il modello 'Gioco'
const Gioco = mongoose.model('Gioco', giocoSchema);

module.exports = Gioco;
