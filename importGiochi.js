const mongoose = require('mongoose');
const XLSX = require('xlsx');
const Game = require('./models/game'); // Modello Game
const Tipologia = require('./models/tipologia'); // Modello Tipologia
require('dotenv').config(); // Carica variabili d'ambiente

const URI = process.env.MONGO_URI;

// Funzione per introdurre un delay (non necessaria più per l'API di BGG)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const importData = async () => {
    try {
        // Connessione a MongoDB
        await mongoose.connect(URI);
        console.log("✅ Connesso a MongoDB");

        // 🗑️ **Pulisce la collezione prima di importare**
        await Game.deleteMany({});
        console.log("🗑️ Collezione 'games' svuotata");

        // 📂 **Legge il file Excel**
        const workbook = XLSX.readFile("C:/Users/gamba/OneDrive/Documenti/App GiS/lista-giochi.xlsx");
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // 📌 **Elimina la prima riga (intestazioni) e trova gli indici delle colonne**
        const headers = data.shift();
        const indexNome = headers.indexOf('Nome');
        const indexDurataMedia = headers.indexOf('DurataMedia');
        const indexDifficolta = headers.indexOf('Difficolta');
        const indexTipologia = headers.indexOf('Tipologia');
        const indexGiocatoriMin = headers.indexOf('GiocatoriMin');
        const indexGiocatoriMax = headers.indexOf('GiocatoriMax');
        const indexBggId = headers.indexOf('bggID');

        // 📌 **Mappa i dati e recupera le informazioni senza chiamare BGG API**
        const formattedData = await Promise.all(data.map(async (row, i) => {
            const nomeGioco = row[indexNome]; // Nome del gioco direttamente dal file
            const bggId = row[indexBggId]; // Prendiamo il BGG ID dal file

            // 🔎 **Trova la Tipologia nel DB**
            const nomeTipologia = row[indexTipologia];
            const tipologiaDoc = await Tipologia.findOne({ nome: nomeTipologia });

            return {
                nome: nomeGioco,
                bggId,
                tipologia: tipologiaDoc ? tipologiaDoc._id : null,
                durataMedia: row[indexDurataMedia] || null,
                difficolta: row[indexDifficolta] || null,
                giocatoriMin: row[indexGiocatoriMin] || null,
                giocatoriMax: row[indexGiocatoriMax] || null
            };
        }));

        // 🔹 **Filtra i dati validi (rimuove i null) e li inserisce nel database**
        const validData = formattedData.filter(entry => entry !== null);
        await Game.insertMany(validData);
        console.log(`✅ ${validData.length} giochi importati con successo`);

    } catch (error) {
        console.error('❌ Errore durante l\'importazione:', error);
    } finally {
        mongoose.connection.close();
        console.log("🔌 Connessione chiusa");
    }
};

// 📌 **Esegui lo script**
importData();
