const mongoose = require('mongoose');

// Definizione dello schema per Giocatore
const GiocatoreSchema = new mongoose.Schema({
  nome: { 
    type: String, 
    required: true, 
    unique: true  // Evita duplicati
  }
});

// Creiamo il modello Giocatore
const Giocatore = mongoose.model('Giocatore', GiocatoreSchema);

// Esportiamo il modello per poterlo usare in altre parti dell'applicazione
module.exports = Giocatore;
