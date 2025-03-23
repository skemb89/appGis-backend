require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000; // Usa la porta definita da Render o 5000 di fallback

// Importa le rotte dei giochi
const gameRoutes = require('./routes/games');
const authRoutes = require('./routes/auth');
const giocatoriRoutes = require("./routes/giocatori");
const regroutes = require('./routes/routereg'); // Utilizza il percorso relativo corretto per le rotte
const adminRoutes = require('./routes/adminRoutes'); // Importa le rotte dell'admin
const gestioneGiochiRoutes = require('./routes/gestionegiochi'); // importa le rotte per la gestione giochi (aggiunta, modifica, eliminazione)



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

// Utilizzo delle rotte per la registrazione
app.use(regroutes);

// Aggiunta delle rotte admin
app.use('/api/admin', adminRoutes);  // Aggiungi questa riga per usare le rotte dell'admin

// Aggiunta delle rotte per la gestione dei giochi
app.use('/api/gestionegiochi', gestioneGiochiRoutes); // Aggiungi questa riga per usare le rotte per la gestione dei giochi


// Serve i file statici dalla cartella 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Aggiunto endpoint per "/""
app.get('/', (req, res) => {
  res.send('Server attivo!');
});

console.log("PORT:", process.env.PORT);


// Determina l'host in base all'ambiente (locale o Render)
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'; // Usa '0.0.0.0' in produzione (Render), altrimenti 'localhost'

// Avvio del server
app.listen(PORT, host, () => {
  const address = `http://${host}:${PORT}`;
  console.log(`🚀 Server avviato su ${address}`);
});
