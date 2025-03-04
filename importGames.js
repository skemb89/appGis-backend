//import games che verifica i giochi con immagine null e carica i dati da BGG tramite API

// Importa le librerie necessarie
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const Game = require('./models/game'); // Modello Game
const Tipologia = require('./models/tipologia'); // Modello Tipologia
const Giocatore = require('./models/giocatore'); // Modello Giocatore
const { getBGGGameData } = require('./routes/bggApi'); // Importiamo la funzione per BGG
require('dotenv').config(); // Carica variabili d'ambiente

// Usa la variabile MONGO_URI dal file .env
const URI = process.env.MONGO_URI;

// Funzione per introdurre un delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Funzione principale di importazione
const importData = async () => {
    try {
        // Connessione a MongoDB
        await mongoose.connect(URI);
        console.log("✅ Connesso a MongoDB");

        // 1️⃣ **Legge il file Excel**
        const workbook = XLSX.readFile("C:/Users/gamba/OneDrive/Documenti/App GiS/lista-giochi.xlsx");
        const sheetName = workbook.SheetNames[0]; // Prende il primo foglio
        const worksheet = workbook.Sheets[sheetName];

        // 2️⃣ **Converte il foglio Excel in un array di oggetti**
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Elimina la prima riga (intestazioni)
        const headers = data.shift();

        // 3️⃣ **Trova i giochi nel database che hanno immagine null**
        const gamesWithNoImage = await Game.find({ immagine: null }).exec();
        const gamesWithNoImageNames = gamesWithNoImage.map(game => game.nome);
        console.log(`Trovati ${gamesWithNoImage.length} giochi con immagine null`);

        // 4️⃣ **Filtra i dati del file Excel per prendere solo i giochi che hanno immagine null nel DB**
        const filteredData = data.filter(row => gamesWithNoImageNames.includes(row[headers.indexOf('Nome')]));

        console.log(`Numero di giochi da aggiornare: ${filteredData.length}`);

        // 5️⃣ **Mappa i dati e collega Tipologia e Giocatore per i giochi con immagine null**
        const formattedData = await Promise.all(filteredData.map(async (row) => {
            const nomeTipologia = row[headers.indexOf('Tipologia')]; 
            const nomeGiocatore = row[headers.indexOf('Proprietario')]; 
            const bggId = row[headers.indexOf('bggID')] || null;

            // Trova la Tipologia nel DB (se non esiste, lascia null)
            const tipologiaDoc = await Tipologia.findOne({ nome: nomeTipologia });

            // Trova o crea il Giocatore
            let giocatoreDoc = await Giocatore.findOne({ nome: nomeGiocatore });
            if (!giocatoreDoc && nomeGiocatore) {
                giocatoreDoc = await Giocatore.create({ nome: nomeGiocatore });
                console.log(`👤 Creato nuovo Giocatore: ${nomeGiocatore}`);
            }

            // 🔎 **Chiamata API a BGG per recuperare immagine e anno**
            let imageUrl = null;
            let yearPublished = null;

            if (bggId) {
                // Aggiungi un delay di 10 secondi tra ogni chiamata API
                await delay(10000);  // 10 secondi
                const bggData = await getBGGGameData(bggId);
                if (bggData) {
                    imageUrl = bggData.imageUrl;
                    yearPublished = bggData.yearPublished;
                    console.log(`🎲 Dati trovati per ID BGG ${bggId}: Immagine: ${imageUrl}, Anno: ${yearPublished}`);
                }
            }

            return {
                nome: row[headers.indexOf('Nome')],
                tipologia: tipologiaDoc ? tipologiaDoc._id : null, // Usa l'ID della tipologia
                durataMedia: row[headers.indexOf('DurataMedia')] || null,
                difficolta: row[headers.indexOf('Difficolta')] || null,
                giocatoriMin: row[headers.indexOf('GiocatoriMin')] || null,
                giocatoriMax: row[headers.indexOf('GiocatoriMax')] || null,
                proprietario: giocatoreDoc ? giocatoreDoc._id : null, // Usa l'ID del giocatore
                posizione: row[headers.indexOf('Posizione')] || null,
                bggId,
                immagine: imageUrl, // 🖼️ Salva l'URL dell'immagine
                dataPubblicazione: yearPublished, // 📅 Salva l'anno di pubblicazione
            };
        }));

        // 6️⃣ **Aggiorna i giochi nel database che hanno immagine null**
        for (const gameData of formattedData) {
            await Game.updateOne(
                { nome: gameData.nome },  // Trova il gioco per nome
                { $set: { immagine: gameData.immagine, dataPubblicazione: gameData.dataPubblicazione } } // Aggiorna immagine e anno
            );
            console.log(`✅ Gioco "${gameData.nome}" aggiornato con immagine e anno`);
        }

        console.log('✅ Dati aggiornati correttamente');

    } catch (error) {
        console.error('❌ Errore nell\'importazione:', error);
    } finally {
        mongoose.connection.close(); // Chiude la connessione al database
        console.log("🔌 Connessione chiusa");
    }
};

// Esegui lo script
importData();
