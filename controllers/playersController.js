//FUNZIONI PER COMBO BOX REGISTRAZIONE UTENTE

// Importiamo il modello del giocatore e dell'utente
const Giocatore = require('../models/giocatore');
const User = require('../models/user');

// Funzione per recuperare i giocatori non associati ad alcun utente
const getUnassociatedPlayers = async (req, res) => {
  try {
    // Troviamo i giocatori che non sono associati a nessun utente
    const unassociatedPlayers = await Giocatore.find({
      _id: { $nin: await User.distinct('giocatore') } // Trova giocatori non associati
    });

    // Ritorniamo l'elenco dei giocatori non associati
    res.json(unassociatedPlayers);
  } catch (error) {
    console.error('Errore nel recupero dei giocatori non associati:', error);
    res.status(500).send('Errore nel recupero dei giocatori non associati');
  }
};

// Funzione per aggiungere un nuovo giocatore
const addNewPlayer = async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).send('Il nome del giocatore è obbligatorio');
    }

    // Creiamo un nuovo giocatore
    const newPlayer = new Giocatore({ nome });

    // Salviamo il giocatore nel database
    await newPlayer.save();

    res.status(201).json(newPlayer); // Restituiamo il giocatore appena creato
  } catch (error) {
    console.error('Errore nell\'aggiunta del nuovo giocatore:', error);
    res.status(500).send('Errore nell\'aggiunta del nuovo giocatore');
  }
};

module.exports = {
  getUnassociatedPlayers,
  addNewPlayer
};
