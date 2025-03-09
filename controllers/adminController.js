// controllers/adminController.js

const User = require('../models/user');
const Giocatore = require('../models/giocatore');

/**
 * Recupera tutti gli utenti con il loro stato e il giocatore associato.
 */
const getUsers = async (req, res) => {
    try {
        const users = await User.find().populate('giocatore');
        res.json(users);
    } catch (error) {
        console.error("Errore nel recupero degli utenti:", error);
        res.status(500).send("Errore nel recupero degli utenti");
    }
};

/**
 * Recupera tutti i giocatori non ancora associati a un utente.
 */
const getUnassociatedPlayers = async (req, res) => {
    try {
        const unassociatedPlayers = await Giocatore.find({
            _id: { $nin: await User.distinct('giocatore') }
        });

        res.json(unassociatedPlayers);
    } catch (error) {
        console.error("Errore nel recupero dei giocatori non associati:", error);
        res.status(500).send("Errore nel recupero dei giocatori non associati");
    }
};

/**
 * Aggiorna lo stato dell'utente e l'associazione con un giocatore.
 */
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { giocatoreId, status } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { giocatore: giocatoreId, status },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send("Utente non trovato");
        }

        res.json({ message: "Utente aggiornato con successo", user: updatedUser });
    } catch (error) {
        console.error("Errore nell'aggiornamento dell'utente:", error);
        res.status(500).send("Errore nell'aggiornamento dell'utente");
    }
};

module.exports = {
    getUsers,
    getUnassociatedPlayers,
    updateUser
};
