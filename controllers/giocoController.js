const Gioco = require('../models/game'); // Importa il modello Gioco
const CopiaGioco = require('../models/copiegiochi'); // Importa il modello CopiaGioco
const Giocatore = require('../models/giocatore'); // Importa il modello Giocatore

/**
 * Aggiunge un nuovo gioco al database, se non esiste già.
 * Inoltre, crea una copia fisica del gioco e la assegna a un proprietario.
 */
const aggiungiGioco = async (req, res) => {
    try {
        const { nome, tipologia, durataMedia, difficolta, giocatoriMin, giocatoriMax, bggId, proprietarioId, posizione } = req.body;

        // Controllo se il gioco con lo stesso bggId è già presente
        const giocoEsistente = await Gioco.findOne({ bggId });

        let gioco;
        if (giocoEsistente) {
            console.log(`Il gioco con bggId ${bggId} è già presente nel database.`);
            gioco = giocoEsistente; // Se esiste già, lo riutilizziamo
        } else {
            // Creiamo un nuovo gioco nel database
            gioco = new Gioco({
                nome,
                tipologia,
                durataMedia,
                difficolta,
                giocatoriMin,
                giocatoriMax,
                bggId
            });

            await gioco.save();
            console.log(`Gioco "${nome}" aggiunto con successo.`);
        }

        // Verifica che il proprietario esista
        const proprietario = await Giocatore.findById(proprietarioId);
        if (!proprietario) {
            return res.status(404).json({ message: "Proprietario non trovato." });
        }

        // Creiamo una copia del gioco e la assegniamo al proprietario
        const copiaGioco = new CopiaGioco({
            gioco: gioco._id,
            proprietario: proprietarioId,
            posizione
        });

        await copiaGioco.save();
        console.log(`Copia del gioco "${nome}" assegnata a ${proprietario.nome}.`);

        res.status(201).json({ message: "Gioco e copia registrati con successo.", gioco, copiaGioco });

    } catch (error) {
        console.error("Errore nell'aggiunta del gioco:", error);
        res.status(500).json({ message: "Errore nel server." });
    }
};

module.exports = {
    aggiungiGioco
};
