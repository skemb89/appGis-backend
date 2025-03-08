// controllers/adminController.js

// Importiamo i modelli necessari
const User = require('../models/user');
const Giocatore = require('../models/giocatore');

// Funzione per ottenere tutti gli utenti con il loro stato e il giocatore associato
const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate('giocatore'); // Popoliamo il campo giocatore con i dati effettivi
    res.json(users);
  } catch (error) {
    console.error('Errore nel recupero degli utenti:', error);
    res.status(500).send('Errore nel recupero degli utenti');
  }
};

// Funzione per approvare un utente cambiandone lo stato
const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Troviamo l'utente e aggiorniamo il suo stato a 'Approvato'
    const updatedUser = await User.findByIdAndUpdate(userId, { stato: 'Approvato' }, { new: true });

    if (!updatedUser) {
      return res.status(404).send('Utente non trovato');
    }

    res.json({ message: 'Utente approvato con successo', user: updatedUser });
  } catch (error) {
    console.error('Errore nell\'approvazione dell\'utente:', error);
    res.status(500).send('Errore nell\'approvazione dell\'utente');
  }
};

// Funzione per rifiutare un utente cambiandone lo stato
const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Troviamo l'utente e aggiorniamo il suo stato a 'Rifiutato'
    const updatedUser = await User.findByIdAndUpdate(userId, { stato: 'Rifiutato' }, { new: true });

    if (!updatedUser) {
      return res.status(404).send('Utente non trovato');
    }

    res.json({ message: 'Utente rifiutato con successo', user: updatedUser });
  } catch (error) {
    console.error('Errore nel rifiuto dell\'utente:', error);
    res.status(500).send('Errore nel rifiuto dell\'utente');
  }
};

// Funzione per ottenere tutti i giocatori non associati ad utenti
const getUnassociatedPlayers = async (req, res) => {
  try {
    const unassociatedPlayers = await Giocatore.find({
      _id: { $nin: await User.distinct('giocatore') }
    });

    res.json(unassociatedPlayers);
  } catch (error) {
    console.error('Errore nel recupero dei giocatori non associati:', error);
    res.status(500).send('Errore nel recupero dei giocatori non associati');
  }
};

// Funzione per aggiornare il giocatore associato a un utente
const updateUserPlayer = async (req, res) => {
  try {
    const { userId } = req.params;
    const { giocatoreId } = req.body;

    // Troviamo l'utente e aggiorniamo il campo giocatore
    const updatedUser = await User.findByIdAndUpdate(userId, { giocatore: giocatoreId }, { new: true });

    if (!updatedUser) {
      return res.status(404).send('Utente non trovato');
    }

    res.json({ message: 'Giocatore aggiornato con successo', user: updatedUser });
  } catch (error) {
    console.error('Errore nell\'aggiornamento del giocatore associato:', error);
    res.status(500).send('Errore nell\'aggiornamento del giocatore associato');
  }
};

// Esportiamo le funzioni per l'uso nelle rotte
module.exports = {
  getUsers,
  approveUser,
  rejectUser,
  getUnassociatedPlayers,
  updateUserPlayer
};
