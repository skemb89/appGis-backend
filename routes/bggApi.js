const axios = require('axios');
const xml2js = require('xml2js');

// Funzione per ottenere i dati del gioco da BGG
const getBGGGameData = async (bggId) => {
    if (!bggId) return null;

    try {
        const url = `https://boardgamegeek.com/xmlapi2/thing?id=${bggId}`;
        const response = await axios.get(url);
        
        // Converte la risposta XML in JSON
        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(response.data);

        // Estraggo i dati necessari
        const gameData = result.items.item;
        const imageUrl = gameData.image || null;
        const yearPublished = gameData.yearpublished ? gameData.yearpublished.$.value : null;

        return { imageUrl, yearPublished };
    } catch (error) {
        console.error(`❌ Errore nel recupero dati da BGG per ID ${bggId}:`, error.message);
        return null;
    }
};

module.exports = { getBGGGameData };
