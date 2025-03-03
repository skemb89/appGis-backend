const express = require('express');
const Game = require('../models/game');  // Importa il modello Game
const Tipologia = require('../models/tipologia');  // Importa il modello Tipologia
const Giocatore = require('../models/giocatore');  // Importa il modello Giocatore

const router = express.Router();

// 1. Crea un nuovo gioco (POST)
router.post('/giochi', async (req, res) => {
    const { nome, durataMedia, difficolta, tipologia, giocatoriMin, giocatoriMax, proprietario, posizione } = req.body;

    try {
        const nuovoGioco = new Game({
            nome,
            durataMedia,
            difficolta,
            tipologia,
            giocatoriMin,
            giocatoriMax,
            proprietario,
            posizione
        });

        await nuovoGioco.save();
        res.status(201).json({ message: 'Gioco creato con successo!' });
    } catch (error) {
        console.error('Errore nel creare il gioco:', error);
        res.status(500).json({ message: 'Errore nel creare il gioco' });
    }
});

// 2. Ottieni tutti i giochi (GET)
router.get('/giochi', async (req, res) => {
    try {
        // Popoliamo i campi 'tipologia' e 'proprietario' per ottenere i rispettivi nomi
        const giochi = await Game.find()
            .populate('tipologia', 'nome')  // Popola il campo 'tipologia' con il nome
            .populate('proprietario', 'nome');  // Popola il campo 'proprietario' con il nome

        res.status(200).json(giochi);
    } catch (error) {
        console.error('Errore nel recuperare i giochi:', error);
        res.status(500).json({ message: 'Errore nel recuperare i giochi' });
    }
});

// 3. Modifica un gioco esistente (PUT)
router.put('/giochi/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, durataMedia, difficolta, tipologia, giocatoriMin, giocatoriMax, proprietario, posizione } = req.body;

    try {
        const giocoAggiornato = await Game.findByIdAndUpdate(id, {
            nome,
            durataMedia,
            difficolta,
            tipologia,
            giocatoriMin,
            giocatoriMax,
            proprietario,
            posizione
        }, { new: true });

        if (!giocoAggiornato) {
            return res.status(404).json({ message: 'Gioco non trovato!' });
        }

        res.status(200).json(giocoAggiornato);
    } catch (error) {
        console.error('Errore nell\'aggiornare il gioco:', error);
        res.status(500).json({ message: 'Errore nell\'aggiornare il gioco' });
    }
});

// 4. Elimina un gioco (DELETE)
router.delete('/giochi/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const giocoEliminato = await Game.findByIdAndDelete(id);

        if (!giocoEliminato) {
            return res.status(404).json({ message: 'Gioco non trovato!' });
        }

        res.status(200).json({ message: 'Gioco eliminato con successo!' });
    } catch (error) {
        console.error('Errore nell\'eliminare il gioco:', error);
        res.status(500).json({ message: 'Errore nell\'eliminare il gioco' });
    }
});

// 5. Ottieni i giochi per un giocatore specifico (GET per un utente loggato)
router.get('/giochi/giocatore/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Troviamo i giochi dove il proprietario corrisponde all'ID dell'utente loggato
        const giochi = await Game.find({ proprietario: userId })
            .populate('tipologia', 'nome')  // Popola il campo 'tipologia' con il nome
            .populate('proprietario', 'nome');  // Popola il campo 'proprietario' con il nome

        if (!giochi || giochi.length === 0) {
            return res.status(404).json({ message: 'Nessun gioco trovato per questo utente' });
        }

        res.status(200).json(giochi);
    } catch (error) {
        console.error('Errore nel recuperare i giochi:', error);
        res.status(500).json({ message: 'Errore nel recuperare i giochi' });
    }
});


module.exports = router;  // Esporta il router
