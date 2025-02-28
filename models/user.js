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
    type: String, 
    required: false //dovrà essere impostato a true 
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
