const mongoose = require('mongoose');
const XLSX = require('xlsx');
const Tipologia = require('./models/tipologia');
require('dotenv').config();

const URI = process.env.MONGO_URI;
console.log("MONGO_URI:", URI); // Debug

if (!URI) {
  console.error("Errore: MONGO_URI non è definito nel file .env");
  process.exit(1);
}

mongoose.connect(URI)
  .then(() => console.log('Connesso a MongoDB'))
  .catch(err => {
    console.error('Errore nella connessione a MongoDB:', err);
    process.exit(1);
  });

const filePath = "C:\\Users\\gamba\\OneDrive\\Documenti\\App GiS\\lista-tipologie.xlsx";
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

const headers = data.shift();
console.log("Headers trovati:", headers); // Debug

const nomeIndex = headers.findIndex(h => h.toLowerCase().trim() === "nome");
if (nomeIndex === -1) {
  console.error("Errore: La colonna 'Nome' non è stata trovata nell'Excel.");
  process.exit(1);
}

const formattedData = data
  .map(row => ({ nome: row[nomeIndex] }))
  .filter(entry => entry.nome); // Rimuove gli oggetti con nome undefined

console.log("Dati da importare:", formattedData); // Debug

Tipologia.insertMany(formattedData, { ordered: false })
  .then(() => {
    console.log('Dati importati correttamente');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Errore nell\'importazione:', err);
    mongoose.connection.close();
  });
