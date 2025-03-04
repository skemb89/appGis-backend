const mongoose = require('mongoose');

// Definizione dello schema per Game
const gameSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
    },
    tipologia: {
        type: mongoose.Schema.Types.ObjectId,  // Riferimento a Tipologia
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
    proprietario: {
        type: mongoose.Schema.Types.ObjectId,  // Riferimento a Giocatore
        ref: 'Giocatore',
        required: false,
    },
    posizione: {
        type: String,  // Posizione fisica del gioco
        required: false,
    },
    // Nuovi campi per integrazione con BGG
    bggId: {
        type: Number,  // ID del gioco su BoardGameGeek
        unique: false,
        sparse: true  // Permette valori null
    },
    immagine: {
        type: String,  // URL dell'immagine del gioco
        required: false
    },
    dataPubblicazione: {
        type: Number,  // Anno di pubblicazione del gioco
        required: false
    }
});

// Creiamo il modello 'Game'
const Game = mongoose.model('Game', gameSchema);

// Esportiamo il modello
module.exports = Game;
