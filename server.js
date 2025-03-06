require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000; // Usa la porta definita da Render o 5000 di fallback

// Importa le rotte dei giochi
const gameRoutes = require('./routes/games');
const authRoutes = require('./routes/auth');
const giocatoriRoutes = require("./routes/giocatori");

// Middleware
app.use(express.json());
app.use(cors());

// Connessione a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connesso a MongoDB"))
  .catch(err => console.error("❌ Errore di connessione:", err));

// Usa le rotte per i giochi
app.use('/api', gameRoutes);

// Utilizzo delle rotte di autenticazione
app.use('/api/auth', authRoutes); // <-- Associa le rotte sotto /api/auth

// Utilizzo delle rotte per i giocatori
app.use("/api/giocatori", giocatoriRoutes);

// Serve i file statici dalla cartella 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Aggiunto endpoint per "/""
app.get('/', (req, res) => {
  res.send('Server attivo!');
});


// Determina l'host in base all'ambiente (locale o Render)
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'; // Usa '0.0.0.0' in produzione (Render), altrimenti 'localhost'

// Avvio del server
app.listen(PORT, host, () => {
  const address = `http://${host}:${PORT}`;
  console.log(`🚀 Server avviato su ${address}`);
});
