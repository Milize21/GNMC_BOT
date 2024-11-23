// /events/ready.js
const axios = require('axios');
const config = require('../config.json');

module.exports = async (client) => {
    console.log(`🤖 Bot is online as ${client.user.tag}`);
    let playerCount = 0;

    const updateActivity = async () => {
        try {
            // Fetch the player data from the server
            const response = await axios.get(`http://${config.AllPlayersEmbed.ServerIP + ':' + config.AllPlayersEmbed.ServerPort}/players.json`);
            const players = response.data;
            playerCount = players.length;

            client.user.setActivity(`${playerCount}/${config.AllPlayersEmbed.maxPlayers} players online`, { type: 'WATCHING' });
        } catch (error) {
            console.error('Error fetching player data:', error);
            client.user.setActivity('Server Offline', { type: 'WATCHING' });
        }
    };

    await updateActivity();

    setInterval(updateActivity, 60000);
    console.log(`🕹️ Bot activity updated: ${playerCount}/${config.AllPlayersEmbed.maxPlayers} players online`);
};
