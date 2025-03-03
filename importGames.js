// Importa le librerie necessarie
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const Game = require('./models/game'); // Modello Game
const Tipologia = require('./models/tipologia'); // Modello Tipologia
const Giocatore = require('./models/giocatore'); // Modello Giocatore
require('dotenv').config(); // Carica variabili d'ambiente

// Usa la variabile MONGO_URI dal file .env
const URI = process.env.MONGO_URI;

// Funzione principale di importazione
const importData = async () => {
    try {
        // Connessione a MongoDB
        await mongoose.connect(URI);
        console.log("✅ Connesso a MongoDB");

        // 1️⃣ **Cancella i dati esistenti nella collezione 'games'**
        await Game.deleteMany({});
        console.log("🗑️ Collezione 'games' svuotata!");

        // 2️⃣ **Legge il file Excel**
        const workbook = XLSX.readFile("C:/Users/gamba/OneDrive/Documenti/App GiS/lista-giochi.xlsx");
        const sheetName = workbook.SheetNames[0]; // Prende il primo foglio
        const worksheet = workbook.Sheets[sheetName];

        // 3️⃣ **Converte il foglio Excel in un array di oggetti**
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Elimina la prima riga (intestazioni)
        const headers = data.shift();

        // 4️⃣ **Mappa i dati e collega Tipologia e Giocatore**
        const formattedData = await Promise.all(data.map(async (row) => {
            const nomeTipologia = row[headers.indexOf('Tipologia')]; 
            const nomeGiocatore = row[headers.indexOf('Proprietario')]; 

            // Trova la Tipologia nel DB (se non esiste, lascia null)
            const tipologiaDoc = await Tipologia.findOne({ nome: nomeTipologia });

            // Trova o crea il Giocatore
            let giocatoreDoc = await Giocatore.findOne({ nome: nomeGiocatore });
            if (!giocatoreDoc && nomeGiocatore) {
                giocatoreDoc = await Giocatore.create({ nome: nomeGiocatore });
                console.log(`👤 Creato nuovo Giocatore: ${nomeGiocatore}`);
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
            };
        }));

        // 5️⃣ **Inserisce i dati nella collezione 'games'**
        await Game.insertMany(formattedData);
        console.log('✅ Dati importati correttamente');

    } catch (error) {
        console.error('❌ Errore nell\'importazione:', error);
    } finally {
        mongoose.connection.close(); // Chiude la connessione al database
        console.log("🔌 Connessione chiusa");
    }
};

// Esegui lo script
importData();
