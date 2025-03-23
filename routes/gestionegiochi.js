const express = require('express');
const router = express.Router();
const { aggiungiGioco } = require('../controllers/giocoController'); // Importa la funzione dal controller

// Rotta per aggiungere un nuovo gioco
router.post('/aggiungi', aggiungiGioco);

module.exports = router;
