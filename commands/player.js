const axios = require('axios');

// Temporary storage to remember the search results for the user
const searchResults = {};

module.exports = {
    name: "ply",
    alias: ["player"],
    description: "Search and select a football player from a list.",
    category: "sports",

    execute: async (sock, chatId, message, args) => {
        const input = args.join(" ");

        // Check if user is providing a number to select a player (e.g., .ply 1)
        if (args.length === 1 && !isNaN(args[0])) {
            const index = parseInt(args[0]) - 1;
            const previousResults = searchResults[chatId];

            if (!previousResults || !previousResults[index]) {
                return sock.sendMessage(chatId, { text: "❌ *Invalid selection.* Please search for a player name first." });
            }

            const p = previousResults[index];
            await sock.sendMessage(chatId, { text: `⏳ *Fetching details for ${p.strPlayer}...*` });

            const infoText = `
👤 *PLAYER PROFILE* 👤

⚽ *Name:* ${p.strPlayer}
🏟️ *Team:* ${p.strTeam}
🌍 *Nationality:* ${p.strNationality}
🏃‍♂️ *Position:* ${p.strPosition}
🎂 *Born:* ${p.dateBorn}

📝 *Bio:* ${p.strDescriptionEN ? p.strDescriptionEN.substring(0, 300) + "..." : "No bio available."}

*YAS-TECH Sports Hub* 🕹️
            `.trim();

            if (p.strThumb) {
                return sock.sendMessage(chatId, { image: { url: p.strThumb }, caption: infoText }, { quoted: message });
            } else {
                return sock.sendMessage(chatId, { text: infoText }, { quoted: message });
            }
        }

        // Search Logic: If user provides a name (e.g., .ply Messi)
        if (!input) {
            return sock.sendMessage(chatId, { text: "❌ *Usage:* .ply [name] or .ply [number]" });
        }

        try {
            const url = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(input)}`;
            const response = await axios.get(url);

            if (!response.data.player) {
                return sock.sendMessage(chatId, { text: `🚫 *No players found for "${input}".*` });
            }

            const players = response.data.player.slice(0, 10); // Get top 10 results
            searchResults[chatId] = players; // Store results for this chat

            let listText = `🔍 *SEARCH RESULTS FOR: ${input.toUpperCase()}*\n\n`;
            players.forEach((p, i) => {
                listText += `${i + 1}. *${p.strPlayer}* (${p.strTeam})\n`;
            });

            listText += `\n💡 *To select:* Reply with *.ply [number]*\nExample: *.ply 1*`;

            return sock.sendMessage(chatId, { text: listText }, { quoted: message });

        } catch (err) {
            return sock.sendMessage(chatId, { text: "❌ *Error:* Failed to search players." });
        }
    }
};
