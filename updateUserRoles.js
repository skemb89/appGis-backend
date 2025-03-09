const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/user');  // Assicurati che il percorso al modello User sia corretto

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

// Funzione per aggiornare tutti gli utenti
async function updateUsers() {
  try {
    // Aggiorna tutti gli utenti, impostando il ruolo a "user" e lo stato a "In attesa"
    const result = await User.updateMany(
      {}, // Nessuna condizione, quindi aggiorna tutti gli utenti
      { $set: { role: 'user', status: 'Approvato' } } // Imposta il ruolo e lo stato
    );

    console.log(`${result.nModified} utenti aggiornati con successo.`);
  } catch (error) {
    console.error('Errore nell\'aggiornamento degli utenti:', error);
  } finally {
    // Chiudi la connessione al database
    mongoose.connection.close();
  }
}

// Chiamata alla funzione per aggiornare gli utenti
updateUsers();
