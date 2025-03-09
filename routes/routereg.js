//DEFINIIONI ROTTE PER FUNZIONI PLAYERSCONTROLLERS

const express = require('express');
const router = express.Router();
const playersController = require('../controllers/playersController'); // Assicurati che il percorso sia corret
const adminController = require('../controllers/adminController');

// Rotta per ottenere gli utenti con tutti i dettagli e i giocatori disponibili
router.get('/api/admin/users', adminController.getUsers);

// Rotta per ottenere i giocatori non associati
router.get('/api/players/unassociated', playersController.getUnassociatedPlayers);

// Rotta per aggiungere un nuovo giocatore
router.post('/api/players', playersController.addNewPlayer);

module.exports = router;
