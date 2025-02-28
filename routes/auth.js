const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Giocatore = require('../models/giocatore');  // Assicurati che il percorso sia corretto
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Endpoint di registrazione
// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Controlla se l'utente esiste già
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username già in uso' });
    }

    // Crea un nuovo utente (la password verrà hashata dal middleware pre-save)
    const newUser = new User({ username, password });
    await newUser.save();

    res.status(201).json({ message: 'Utente registrato con successo!' });
  } catch (error) {
    console.error('Errore nella registrazione:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

// Endpoint di login
// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Trova l'utente nel database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Credenziali non valide' });
    }

    // Confronta la password fornita con quella hashata
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenziali non valide' });
    }

    // Genera un token JWT con payload id e username, scadenza 1 ora
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, message: 'Login effettuato con successo' });
  } catch (error) {
    console.error('Errore nel login:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

// Endpoint di profilo protetto
// GET /api/auth/profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // req.user viene impostato dal middleware se il token è valido
    const user = await User.findById(req.user.id).select('username');
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    // Restituisce il messaggio "ciao <username>"
    res.status(200).json({ message: `ciao ${user.username}` });
  } catch (error) {
    console.error('Errore nel recuperare il profilo:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

// Endpoint di profilo protetto (rinominato in /api/auth/profile2)
// GET /api/auth/profile2
router.get('/profile2', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('giocatore') // Popola il campo "giocatore"
      .select('username giocatore');
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    res.status(200).json({
      username: user.username,
      giocatore: user.giocatore ? user.giocatore.nome : 'Nessun giocatore associato',
    });
  } catch (error) {
    console.error('Errore nel recuperare il profilo:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

// Endpoint per modificare il profilo utente (modifica password e giocatore)
router.put('/modifica-profilo', authMiddleware, async (req, res) => {
  try {
    // Estrai i dati dal corpo della richiesta
    const { password, giocatoreId } = req.body;

    // Trova l'utente che sta facendo la richiesta usando l'ID contenuto nel token
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    // Se è stata fornita una nuova password, hashala e salvala
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Se è stato fornito un nuovo giocatore, aggiorna il campo giocatore
    if (giocatoreId) {
      const giocatore = await Giocatore.findById(giocatoreId);
      if (!giocatore) {
        return res.status(404).json({ message: 'Giocatore non trovato' });
      }
      user.giocatore = giocatore._id;  // Associa il nuovo giocatore all'utente
    }

    // Salva l'utente modificato nel database
    await user.save();

    // Risposta di successo
    res.status(200).json({
      message: 'Profilo aggiornato con successo!',
      user: {
        username: user.username, // Può restare, anche se non modificato
        giocatore: user.giocatore ? user.giocatore.nome : 'Nessun giocatore associato',
      },
    });
  } catch (error) {
    console.error('Errore nel modificare il profilo:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});



module.exports = router;
