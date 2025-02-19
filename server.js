require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const host = process.env.HOST || 'localhost'; // Usa l'host pubblico o localhost
const PORT = process.env.PORT || 5000;


// Importa le rotte dei giochi
const gameRoutes = require('./routes/games');

// Middleware
app.use(express.json());
app.use(cors());

// Connessione a MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ Connesso a MongoDB"))
  .catch(err => console.error("❌ Errore di connessione:", err));

// Usa le rotte per i giochi
app.use('/api', gameRoutes);

// Avvio del server
app.listen(PORT, host, () => {
  const address = `http://${host}:${PORT}`;
  console.log(`🚀 Server avviato su ${address}`);
});

