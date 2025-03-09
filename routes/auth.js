const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Giocatore = require('../models/giocatore');  // Assicurati che il percorso sia corretto
const bcrypt = require('bcryptjs');

const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Endpoint di registrazione
// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password, email, giocatore } = req.body;

  try {
    // Controlla se l'utente esiste già
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username già in uso' });
    }

    // Crea un nuovo utente (la password verrà hashata dal middleware pre-save)
    const newUser = new User({ username, email, password, giocatore });
    await newUser.save();

    res.status(201).json({ message: 'Utente registrato con successo!' });
  } catch (error) {
    console.error('Errore nella registrazione:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

// Endpoint di login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Trova l'utente nel database
    const user = await User.findOne({ username }).populate('giocatore');
    if (!user) {
      return res.status(400).json({ message: 'Credenziali non valide' });
    }

    // Verifica che l'utente abbia lo stato 'Approvato'
    if (user.status !== 'Approvato') {
      return res.status(403).json({ message: 'L\'utente non è approvato' });
    }

    // Confronta la password fornita con quella hashata
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenziali non valide' });
    }

    // Genera un token JWT con payload id, username, e ruolo, scadenza 1 ora
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        role: user.role // Aggiungi il ruolo al payload del token
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Restituisci anche l'ID del giocatore se esiste
    const userId = user.giocatore ? user.giocatore._id : null;  // Ottieni l'ID del giocatore se presente

    res.status(200).json({ 
      token, 
      message: 'Login effettuato con successo',
      userId: userId  // Invia anche l'ID del giocatore
    });
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

    console.log('Dati ricevuti:', req.body); // Log per vedere cosa riceve il server

    // Trova l'utente che sta facendo la richiesta usando l'ID contenuto nel token
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

      // Assegna la password in chiaro, il middleware farà l'hashing
      if (password) {
        user.password = password;  // NON HASHARE QUI!
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
    console.log('Profilo aggiornato:', user); // Log per vedere il profilo aggiornato

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

// Nuovo endpoint per ottenere il nome del giocatore associato all'utente
// GET /api/auth/giocatore
router.get('/giocatore', authMiddleware, async (req, res) => {
  try {
    // Trova l'utente nel database e popola il campo "giocatore"
    const user = await User.findById(req.user.id).populate('giocatore', 'nome');  // Solo il nome del giocatore
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    // Restituisci il nome del giocatore se esiste
    if (user.giocatore) {
      res.status(200).json({
        nomeGiocatore: user.giocatore.nome  // Restituisce il nome del giocatore
      });
    } else {
      res.status(200).json({
        nomeGiocatore: 'Nessun giocatore associato'  // Se l'utente non ha un giocatore associato
      });
    }

  } catch (error) {
    console.error('Errore nel recuperare il giocatore:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

// Endpoint per ottenere il profilo utente con foto
// GET /api/auth/profile-with-photo
router.get('/profile-with-photo', authMiddleware, async (req, res) => {
  try {
    // Trova l'utente usando l'id contenuto nel token
    const user = await User.findById(req.user.id).select('username photo');
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    // Se l'utente non ha una foto, assegna il percorso della foto di default
    const photoUrl = user.photo ? user.photo : '/uploads/default.png';

    // Restituisci l'utente con username e photo
    res.status(200).json({
      username: user.username,
      photo: photoUrl
    });
  } catch (error) {
    console.error('Errore nel recuperare il profilo con foto:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});


module.exports = router;
