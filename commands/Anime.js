const axios = require('axios');

module.exports = {
    name: "anime",
    alias: ["anisearch", "findanime"," an"],
    description: "Searches for anime details by name.",
    category: "search",

    execute: async (sock, chatId, msg, args) => {
        const from = chatId;
        const query = args.join(" ");

        if (!query) {
            await sock.sendMessage(from, { react: { text: '⚠️', key: msg.key } });
            return sock.sendMessage(from, { text: "*Please provide an anime name.*\nExample: .anime Naruto" }, { quoted: msg });
        }

        try {
            await sock.sendMessage(from, { react: { text: '🔍', key: msg.key } });

            // Kutumia Jikan API (MyAnimeList) - Bure na haihitaji Key
            const apiUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`;
            const response = await axios.get(apiUrl);
            
            const animeData = response.data?.data?.[0];

            if (!animeData) {
                await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
                return sock.sendMessage(from, { text: `❌ Anime "${query}" not found.` }, { quoted: msg });
            }

            // Kuchuja taarifa kwa ufupi kabisa
            const title = animeData.title;
            const type = animeData.type || 'N/A';
            const episodes = animeData.episodes || 'N/A';
            const score = animeData.score || 'N/A';
            const status = animeData.status || 'N/A';
            const imageUrl = animeData.images?.jpg?.large_image_url || animeData.images?.jpg?.image_url;
            const synopsis = animeData.synopsis ? animeData.synopsis.substring(0, 200) + '...' : 'No synopsis available.';

            const captionText = `🎬 *Title:* ${title}\n` +
                `📺 *Type:* ${type}\n` +
                `🔢 *Episodes:* ${episodes}\n` +
                `⭐ *Score:* ${score}\n` +
                `⏳ *Status:* ${status}\n\n` +
                `📝 *Synopsis:* ${synopsis}`;

            await sock.sendMessage(from, { react: { text: '🟢', key: msg.key } });

            // Inatuma picha ya Anime na maelezo yake mafupi
            if (imageUrl) {
                await sock.sendMessage(from, { 
                    image: { url: imageUrl }, 
                    caption: captionText 
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: captionText }, { quoted: msg });
            }

        } catch (error) {
            console.error(error);
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
            return sock.sendMessage(from, { text: "❌ Error: Failed to fetch anime details." }, { quoted: msg });
        }
    }
};