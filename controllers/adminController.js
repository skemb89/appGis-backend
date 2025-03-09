const User = require('../models/user');
const Giocatore = require('../models/giocatore');

/**
 * Recupera tutti gli utenti con il loro stato, ruolo, email e il giocatore associato.
 * Inoltre, include una lista di tutti i giocatori disponibili.
 */
const getUsers = async (req, res) => {
    try {
        // Trova tutti gli utenti e popola il campo 'giocatore' con i dati completi del giocatore associato
        const users = await User.find()
            .populate('giocatore') // Popola il campo 'giocatore' con i dati completi del giocatore
            .select('username email role status giocatore'); // Seleziona solo i campi necessari: username, email, role, status, giocatore

        // Recupera tutti i giocatori per il menu a tendina
        const players = await Giocatore.find();

        res.json({ users, players }); // Restituisce gli utenti e i giocatori come risposta JSON
    } catch (error) {
        console.error("❌ Errore nel recupero degli utenti:", error);
        res.status(500).send("Errore nel recupero degli utenti");
    }
};

/**
 * Recupera tutti i giocatori che non sono ancora stati associati a un utente.
 */
const getUnassociatedPlayers = async (req, res) => {
    try {
        // Trova tutti i giocatori il cui ID non è presente in alcun campo "giocatore" degli utenti
        const unassociatedPlayers = await Giocatore.find({
            _id: { $nin: await User.distinct('giocatore') }
        });

        res.json(unassociatedPlayers); // Restituisce l'elenco dei giocatori disponibili
    } catch (error) {
        console.error("❌ Errore nel recupero dei giocatori non associati:", error);
        res.status(500).send("Errore nel recupero dei giocatori non associati");
    }
};

/**
 * Aggiorna i dati di un utente: 
 * - Associa un nuovo giocatore (se selezionato)
 * - Modifica lo stato (In attesa / Approvato)
 * - Modifica il ruolo (Admin / User)
 */
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params; // Prende l'ID dell'utente dalla URL
        const { giocatoreId, status, role } = req.body; // Dati inviati dal frontend

        // Verifica che lo stato e il ruolo siano validi
        const validStatuses = ["In attesa", "Approvato"];
        const validRoles = ["user", "admin"];

        if (!validStatuses.includes(status) || !validRoles.includes(role)) {
            return res.status(400).send("Valori non validi per stato o ruolo.");
        }

        // Aggiorna l'utente con i nuovi dati
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { giocatore: giocatoreId || null, status, role },
            { new: true } // Restituisce l'utente aggiornato
        );

        if (!updatedUser) {
            return res.status(404).send("Utente non trovato");
        }

        res.json({ message: "✅ Utente aggiornato con successo", user: updatedUser });
    } catch (error) {
        console.error("❌ Errore nell'aggiornamento dell'utente:", error);
        res.status(500).send("Errore nell'aggiornamento dell'utente");
    }
};

module.exports = {
    getUsers,
    getUnassociatedPlayers,
    updateUser
};
