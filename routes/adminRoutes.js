// routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Rotta per ottenere tutti gli utenti con il loro stato e il giocatore associato
router.get('/users', adminController.getUsers);

// Rotta per approvare un utente (cambiando il suo stato)
router.put('/users/:userId/approve', adminController.approveUser);

// Rotta per rifiutare un utente (cambiando il suo stato)
router.put('/users/:userId/reject', adminController.rejectUser);

// Rotta per ottenere i giocatori non ancora associati a un utente
router.get('/players/unassociated', adminController.getUnassociatedPlayers);

// Rotta per aggiornare l'associazione di un utente con un giocatore
router.put('/users/:userId/player', adminController.updateUserPlayer);

module.exports = router;
