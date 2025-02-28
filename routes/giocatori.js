const express = require("express");
const router = express.Router();
const Giocatore = require("../models/giocatore"); // Importa il modello

// 📌 Creare un nuovo giocatore
router.post("/", async (req, res) => {
  try {
    const nuovoGiocatore = new Giocatore({ nome: req.body.nome });
    await nuovoGiocatore.save();
    res.status(201).json(nuovoGiocatore);
  } catch (error) {
    res.status(500).json({ message: "Errore nella creazione del giocatore", error });
  }
});

// 📌 Ottenere tutti i giocatori
router.get("/", async (req, res) => {
  try {
    const giocatori = await Giocatore.find();
    res.json(giocatori);
  } catch (error) {
    res.status(500).json({ message: "Errore nel recupero dei giocatori", error });
  }
});

// 📌 Ottenere un giocatore per ID
router.get("/:id", async (req, res) => {
  try {
    const giocatore = await Giocatore.findById(req.params.id);
    if (!giocatore) return res.status(404).json({ message: "Giocatore non trovato" });
    res.json(giocatore);
  } catch (error) {
    res.status(500).json({ message: "Errore nel recupero del giocatore", error });
  }
});

// 📌 Modificare un giocatore (aggiornare nome)
router.put("/:id", async (req, res) => {
  try {
    const giocatore = await Giocatore.findByIdAndUpdate(req.params.id, { nome: req.body.nome }, { new: true });
    if (!giocatore) return res.status(404).json({ message: "Giocatore non trovato" });
    res.json(giocatore);
  } catch (error) {
    res.status(500).json({ message: "Errore nell'aggiornamento del giocatore", error });
  }
});

// 📌 Eliminare un giocatore
router.delete("/:id", async (req, res) => {
  try {
    const giocatore = await Giocatore.findByIdAndDelete(req.params.id);
    if (!giocatore) return res.status(404).json({ message: "Giocatore non trovato" });
    res.json({ message: "Giocatore eliminato" });
  } catch (error) {
    res.status(500).json({ message: "Errore nella cancellazione del giocatore", error });
  }
});

module.exports = router;
