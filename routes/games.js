const express = require('express');
const CopiaGioco = require('../models/copiegiochi');  // Modello per le copie fisiche dei giochi
const Giocatore = require('../models/giocatore');      // Modello per i giocatori (non usato direttamente qui, ma utile per riferimento)
const Tipologia = require('../models/tipologia');      // Modello per le tipologie di giochi
const Gioco = require('../models/game');               // Modello per i giochi

const router = express.Router();

/**
 * Endpoint: GET /api/giochi/giocatore/:userId
 * Descrizione: Ottiene la lista dei giochi posseduti da un giocatore specifico.
 *              Per ogni gioco, restituisce il nome del gioco e il nome della tipologia.
 * 
 * Funzionamento:
 * 1. Viene estratto l'ID del giocatore dalla URL (req.params.userId).
 * 2. Si esegue una query sulla collection "CopiaGioco" per trovare tutte le copie dei giochi
 *    che appartengono al giocatore (campo "proprietario" uguale a userId).
 * 3. Si utilizza il metodo "populate" per sostituire il riferimento "gioco" con i dati reali del gioco,
 *    selezionando in particolare il campo "nome" e il campo "tipologia".
 * 4. Si utilizza un ulteriore "populate" per popolare il campo "tipologia" del gioco,
 *    ottenendo il suo "nome" dalla collection "Tipologia".
 * 5. Se vengono trovati giochi, si mappa l'array per restituire un oggetto per ciascun gioco,
 *    contenente solo il nome del gioco e il nome della tipologia (o "N/A" se non disponibile).
 * 6. In caso di errori o se nessun gioco viene trovato, viene restituito un messaggio di errore appropriato.
 */
router.get('/giochi/giocatore/:userId', async (req, res) => {
    const { userId } = req.params;  // Estrae l'ID del giocatore dalla URL

    try {
        // Trova tutte le copie dei giochi posseduti dal giocatore specificato.
        // Il campo "proprietario" in CopiaGioco contiene l'ID del giocatore.
        const copieGioco = await CopiaGioco.find({ proprietario: userId })
            // Popola il campo "gioco" selezionando solo il "nome" e "tipologia"
            .populate('gioco', 'nome tipologia')
            // Popola il campo "tipologia" del gioco, ottenendo il "nome" dalla collection Tipologia
            .populate('gioco.tipologia', 'nome');

        // Se non vengono trovate copie (cioè, nessun gioco posseduto), restituisce un 404
        if (!copieGioco || copieGioco.length === 0) {
            return res.status(404).json({ message: 'Nessun gioco trovato per questo utente' });
        }

        // Mappa le copie dei giochi per estrarre solo il nome del gioco e il nome della tipologia
        const giochi = copieGioco.map(copia => {
            const gioco = copia.gioco;  // Il documento del gioco popolato
            return {
                nome: gioco.nome,  // Il nome del gioco
                // Se il gioco ha una tipologia popolata, restituisce il nome, altrimenti "N/A"
                tipologia: gioco.tipologia && gioco.tipologia.nome ? gioco.tipologia.nome : 'N/A'
            };
        });

        // Restituisce la lista dei giochi con nome e tipologia
        res.status(200).json(giochi);
    } catch (error) {
        console.error('Errore nel recuperare i giochi:', error);
        res.status(500).json({ message: 'Errore nel recuperare i giochi' });
    }
});

module.exports = router;  // Esporta il router per l'utilizzo nell'applicazione
