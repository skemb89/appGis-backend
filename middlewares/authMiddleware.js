const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  // Estrae l'header Authorization dalla richiesta
  const authHeader = req.headers.authorization;

  // Se l'header è mancante o non inizia con 'Bearer ', restituisce un errore 401
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accesso non autorizzato: token mancante' });
  }

  // Estrae il token dopo "Bearer "
  const token = authHeader.split(' ')[1];

  try {
    // Verifica il token usando il segreto memorizzato in process.env.JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Aggiunge i dati decodificati (ad es. id e username) a req.user
    req.user = decoded;
    next(); // Prosegue al prossimo middleware o route handler
  } catch (error) {
    return res.status(401).json({ message: 'Token non valido o scaduto' });
  }
}

module.exports = authMiddleware;
