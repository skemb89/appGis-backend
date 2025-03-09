const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

/**
 * Rotta per ottenere tutti gli utenti con i dettagli completi:
 * - Username
 * - Email
 * - Giocatore associato (se presente)
 * - Stato dell'utente (In attesa / Approvato)
 * - Ruolo (Admin / User)
 */
router.get('/users', adminController.getUsers);

/**
 * Rotta per ottenere tutti i giocatori non ancora associati a un utente.
 * Questi verranno mostrati nel menu a tendina per l'assegnazione dei giocatori.
 */
router.get('/players/unassociated', adminController.getUnassociatedPlayers);

/**
 * Rotta per aggiornare un utente specifico con i nuovi dati:
 * - Associa un giocatore (se selezionato)
 * - Cambia stato dell'utente (In attesa / Approvato)
 * - Cambia ruolo dell'utente (Admin / User)
 */
router.put('/users/:userId', adminController.updateUser);

module.exports = router;
