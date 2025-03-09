const mongoose = require('mongoose');
const XLSX = require('xlsx');
const Game = require('./models/game'); // Modello Gioco
const Giocatore = require('./models/giocatore'); // Modello Giocatore
const CopiaGioco = require('./models/copiegiochi'); // Modello CopiaGioco
require('dotenv').config(); // Carica variabili d'ambiente

const URI = process.env.MONGO_URI;

// Funzione per introdurre un delay (non necessaria in questo caso, ma puoi mantenerla se vuoi fare altre operazioni in futuro)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const importCopieGiochi = async () => {
    try {
        // Connessione a MongoDB
        await mongoose.connect(URI);
        console.log("✅ Connesso a MongoDB");

        // 🗑️ **Pulisce la collezione copie prima di importare**
        // Se vuoi ripulire la collezione di copie (se c'è una collezione specifica per le copie, ad esempio 'copiegiochi')
        await CopiaGioco.deleteMany({});
        console.log("🗑️ Collezione 'copiegiochi' svuotata");

        // 📂 **Legge il file Excel**
        const workbook = XLSX.readFile("C:/Users/gamba/OneDrive/Documenti/App GiS/lista-copie-giochi.xlsx");
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // 📌 **Elimina la prima riga (intestazioni) e trova gli indici delle colonne**
        const headers = data.shift();
        const indexNome = headers.indexOf('Nome');
        const indexProprietario = headers.indexOf('Proprietario');
        const indexPosizione = headers.indexOf('Posizione');

        // 📌 **Mappa i dati e verifica la coerenza tra i giochi e i proprietari**
        const formattedData = await Promise.all(data.map(async (row, i) => {
            const nomeGioco = row[indexNome]; // Nome del gioco direttamente dal file
            const proprietarioNome = row[indexProprietario]; // Nome del proprietario
            const posizione = row[indexPosizione]; // Posizione

            // 🔎 **Trova il gioco nel DB tramite nome**
            const gameDoc = await Game.findOne({ nome: nomeGioco });
            if (!gameDoc) {
                console.log(`⚠️ Gioco non trovato: ${nomeGioco}`);
                return null; // Se il gioco non esiste, salta questa riga
            }

            // 🔎 **Trova il proprietario nel DB tramite nome**
            const playerDoc = await Giocatore.findOne({ nome: proprietarioNome });
            if (!playerDoc) {
                console.log(`⚠️ Proprietario non trovato: ${proprietarioNome}`);
                return null; // Se il proprietario non esiste, saltiamo questa riga
            }

            // Restituiamo un oggetto che rappresenta il collegamento tra gioco e proprietario
            return {
                gioco: gameDoc._id, // Usando l'ID del gioco
                proprietario: playerDoc._id, // Usando l'ID del proprietario
                posizione: posizione || null // La posizione, se esiste
            };
        }));

        // 🔹 **Filtra i dati validi (rimuove i null) e li inserisce nel database**
        const validData = formattedData.filter(entry => entry !== null);
        
        // Inserimento dei dati nella collezione 'CopiaGioco'
        await CopiaGioco.insertMany(validData); 
        console.log(`✅ ${validData.length} copie importate con successo`);

    } catch (error) {
        console.error('❌ Errore durante l\'importazione:', error);
    } finally {
        mongoose.connection.close();
        console.log("🔌 Connessione chiusa");
    }
};

// 📌 **Esegui lo script**
importCopieGiochi();
