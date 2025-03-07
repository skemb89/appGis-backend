const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Definizione dello schema utente
const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  giocatore: { 
    type: mongoose.Schema.Types.ObjectId,  
    ref: 'Giocatore', 
    required: false  
  },
  photo: { 
    type: String, // URL della foto profilo
    required: false, // Campo opzionale
    default: '' // Se vuoto, non mostra un'immagine
  },
  status: { 
    type: String, 
    enum: ['In attesa', 'Approvato'], // Stato dell'utente
    default: 'In attesa', // Default per nuovi utenti
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], // Ruolo dell'utente
    default: 'user', // Default per nuovi utenti
  },
  date: { 
    type: Date, 
    default: Date.now // Data di registrazione
  }
});

// Middleware pre-save per hashare la password
UserSchema.pre('save', async function(next) {
  // Se la password non è stata modificata, passa al prossimo middleware
  if (!this.isModified('password')) return next();
  
  try {
    // Genera un salt con 10 cicli
    const salt = await bcrypt.genSalt(10);
    // Hasha la password con il salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Metodo per confrontare la password in chiaro con quella hashata
UserSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
