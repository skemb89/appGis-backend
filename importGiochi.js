const mongoose = require('mongoose');
const XLSX = require('xlsx');
const Gioco = require('./models/game'); // Modello Gioco
const Tipologia = require('./models/tipologia'); // Modello Tipologia
require('dotenv').config(); // Carica variabili d'ambiente

// Usa la variabile MONGO_URI dal file .env
const URI = process.env.MONGO_URI;

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

        // 3️⃣ **Trova gli indici delle colonne**
        const nomeIndex = headers.findIndex(h => h.toLowerCase().trim() === "nome");
        const tipologiaIndex = headers.findIndex(h => h.toLowerCase().trim() === "tipologia");
        const durataIndex = headers.findIndex(h => h.toLowerCase().trim() === "duratamedia");
        const difficoltaIndex = headers.findIndex(h => h.toLowerCase().trim() === "difficolta");
        const giocatoriMinIndex = headers.findIndex(h => h.toLowerCase().trim() === "giocatorimin");
        const giocatoriMaxIndex = headers.findIndex(h => h.toLowerCase().trim() === "giocatorimax");
        const bggIdIndex = headers.findIndex(h => h.toLowerCase().trim() === "bggid");

        if (nomeIndex === -1) {
            console.error("❌ Errore: La colonna 'Nome' non è stata trovata nell'Excel.");
            process.exit(1);
        }

        // 4️⃣ **Mappa i dati e collega la Tipologia**
        const formattedData = await Promise.all(data.map(async (row) => {
            const nomeTipologia = row[tipologiaIndex]; 

            // Trova la Tipologia nel DB (se non esiste, lascia null)
            const tipologiaDoc = nomeTipologia ? await Tipologia.findOne({ nome: nomeTipologia }) : null;

            return {
                nome: row[nomeIndex],
                tipologia: tipologiaDoc ? tipologiaDoc._id : null, // Usa l'ID della tipologia
                durataMedia: row[durataIndex] ? parseInt(row[durataIndex], 10) : null,
                difficolta: row[difficoltaIndex] ? parseFloat(row[difficoltaIndex]) : null,
                giocatoriMin: row[giocatoriMinIndex] ? parseInt(row[giocatoriMinIndex], 10) : null,
                giocatoriMax: row[giocatoriMaxIndex] ? parseInt(row[giocatoriMaxIndex], 10) : null,
                bggId: row[bggIdIndex] ? parseInt(row[bggIdIndex], 10) : null,
            };
        }));

        console.log(`📦 Numero di giochi da importare: ${formattedData.length}`);

        // 5️⃣ **Inserisce i dati nel database**
        await Gioco.insertMany(formattedData, { ordered: false });
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
