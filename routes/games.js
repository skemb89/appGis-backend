const express = require('express');
const CopiaGioco = require('../models/copiegiochi');  // Modello per le copie fisiche dei giochi
const Giocatore = require('../models/giocatore');  // Modello per i giocatori
const Tipologia = require('../models/tipologia');  // Modello per le tipologie di giochi
const Gioco = require('../models/game');  // Modello per i giochi

const router = express.Router();

// 1. Ottieni i giochi di un giocatore specifico (GET)
router.get('/giochi/giocatore/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Troviamo le copie dei giochi che appartengono al giocatore
        const copieGioco = await CopiaGioco.find({ proprietario: userId })
            .populate('gioco', 'nome')  // Popola il campo 'gioco' con il nome del gioco
            .populate('gioco.tipologia', 'nome');  // Popola anche la tipologia del gioco

        if (!copieGioco || copieGioco.length === 0) {
            return res.status(404).json({ message: 'Nessun gioco trovato per questo utente' });
        }

        // Estraiamo solo i nomi dei giochi e la tipologia dalle copie
        const giochi = copieGioco.map(copia => {
            const gioco = copia.gioco;
            // Restituisci anche il nome della tipologia se esiste
            return {
                nome: gioco.nome,
                tipologia: gioco.tipologia ? gioco.tipologia.nome : 'N/A' // Assicurati che venga restituito il nome della tipologia
            };
        });

        // Invia i giochi con il nome della tipologia
        res.status(200).json(giochi);
    } catch (error) {
        console.error('Errore nel recuperare i giochi:', error);
        res.status(500).json({ message: 'Errore nel recuperare i giochi' });
    }
});

module.exports = router;  // Esporta il router
