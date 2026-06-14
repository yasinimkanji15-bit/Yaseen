const axios = require('axios');

module.exports = {
    name: "nbascores",
    alias: ["nba", "nbascore", "hoops"],
    description: "Fetches live or recent NBA game scores and team updates.",
    category: "sports",

    execute: async (sock, chatId, msg, args) => {
        const from = chatId;

        try {
            // 1. Set loading reaction emoji
            await sock.sendMessage(from, { react: { text: '🏀', key: msg.key } });

            // 2. Querying David Cyril NBA Scores API endpoint
            const apiUrl = 'https://apis.davidcyril.name.ng/endpoints/sports/nba-scores';
            const response = await axios.get(apiUrl);
            
            // Extract games array from the API response
            // (Adjust response.data paths if the API wraps it inside a .result or .data object)
            const games = response.data?.result || response.data?.games || response.data;

            if (!games || games.length === 0) {
                await sock.sendMessage(from, { react: { text: '⚪', key: msg.key } });
                const noGamesText = `┌◽▫️ ❖ *NBA LIVE TRACKER* ❖ ▫️◽\n` +
                    `│ 📡 *Status:* Connection Stable\n` +
                    `│ ⚠️ *Update:* No active or recent games found at the moment.\n` +
                    `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n\n` +
                    `*© YASEEN-MD CYBER CORE*`;
                return sock.sendMessage(from, { text: noGamesText }, { quoted: msg });
            }

            // 3. Construct the Cyber Dashboard Layout
            let scoreboardText = `┌◽▫️ ❖ *NBA TERMINAL MAINBOARD* ❖ ▫️◽\n` +
                `│ 📡 *FEED:* apis.davidcyril.name.ng\n` +
                `│ 📊 *STATUS:* Central Uplink Synced\n` +
                `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n\n`;

            // 4. Loop through each game and build a structured layout
            // We slice to maximum 10 games to avoid hitting WhatsApp text length limitations
            games.slice(0, 10).forEach((game, index) => {
                const homeTeam = game.homeTeam || game.home || "Unknown Team";
                const awayTeam = game.awayTeam || game.away || "Unknown Team";
                const homeScore = game.homeScore !== undefined ? game.homeScore : "-";
                const awayScore = game.awayScore !== undefined ? game.awayScore : "-";
                const status = game.status || game.time || "Finished/Unknown";
                const quarter = game.quarter ? `• Q${game.quarter}` : "";

                scoreboardText += `* MATCH [0${index + 1}] • ${status} ${quarter}*\n` +
                    `│ 🏠 ${homeTeam} : *${homeScore}*\n` +
                    `│ 🚀 ${awayTeam} : *${awayScore}*\n` +
                    `└────────────────────────◽\n\n`;
            });

            scoreboardText += `┌◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n` +
                `*© 2026 YASEEN LAPORTE • OPERATIONAL*`;

            // 5. Send success reaction and final dashboard payload
            await sock.sendMessage(from, { react: { text: '🟢', key: msg.key } });
            await sock.sendMessage(from, { text: scoreboardText }, { quoted: msg });

        } catch (error) {
            console.error("NBA Scores Core Error:", error.message);
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
            
            const errorCaption = `┌◽▫️ ❖ *NBA SYSTEM FAILURE* ❖ ▫️◽\n` +
                `│ ❌ *Status:* Feed Synchronization Failed\n` +
                `│ ⚠️ *Reason:* David Cyril server timeout or endpoint mapping error.\n` +
                `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽`;
            return sock.sendMessage(from, { text: errorCaption }, { quoted: msg });
        }
    }
};