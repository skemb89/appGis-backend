const mongoose = require('mongoose');

// 1. Definiamo lo schema (la struttura del gioco)
const gameSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
    },
    tipologia: {
        type: String,
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
        type: String,  // Proprietario del gioco
        required: false,
    },
    posizione: {
        type: String,  // Posizione fisica del gioco
        required: false,
    }
});

// 2. Creiamo il modello 'Game' utilizzando lo schema definito sopra

const Game = mongoose.model('Game', gameSchema); // games è il nome della collezione (mongoDB usa il nome del modello in minuscolo e al plurale)

// 3. Esportiamo il modello per utilizzarlo altrove nel progetto
module.exports = Game;
