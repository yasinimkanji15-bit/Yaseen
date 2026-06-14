const axios = require('axios');

// Hii inatunza matokeo ya mwisho uliyosearch
let movieSession = {}; 

module.exports = {
    name: "movie",
    alias: ["film"],
    description: "Easy movie search and selection.",
    category: "search",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const input = args[0];
        const query = args.join(" ").trim();
        const omdbKey = "7db99fb5"; 

        if (!query) {
            return sock.sendMessage(from, { text: "🎬 *USAGE:* .movie [name]\n_Example: .movie Avengers_" });
        }

        try {
            // 1. KAMA MTUMIAJI AMEANDIKA NAMBA (1-10)
            if (!isNaN(input) && movieSession[from]) {
                const index = parseInt(input) - 1;
                if (index >= 0 && index < movieSession[from].length) {
                    const selectedId = movieSession[from][index].imdbID;
                    
                    await sock.sendMessage(from, { react: { text: '⏳', key: message.key } });
                    const { data: d } = await axios.get(`https://www.omdbapi.com/?i=${selectedId}&apikey=${omdbKey}`);

                    const detailText = `🎬 *ＭＯＶＩＥ  ＩＮＴＥＬ*

> *Title:* ${d.Title}
> *Year:* ${d.Year}
> *Rating:* ⭐ ${d.imdbRating}
> *Genre:* ${d.Genre}

📝 *Plot:* _${d.Plot}_

🛡️ *YASEEN－ＭＤ*`;

                    return await sock.sendMessage(from, { 
                        image: { url: d.Poster !== "N/A" ? d.Poster : 'https://via.placeholder.com/500' }, 
                        caption: detailText 
                    }, { quoted: message });
                }
            }

            // 2. KAMA NI SEARCH MPYA (JINA LA MOVIE)
            await sock.sendMessage(from, { react: { text: '🔍', key: message.key } });
            const { data } = await axios.get(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${omdbKey}`);

            if (data.Response === "False") {
                return sock.sendMessage(from, { text: "❌ No results found!" });
            }

            // Tunahifadhi list kwenye session ya group/chat hii
            const results = data.Search.slice(0, 10);
            movieSession[from] = results; 

            let listText = `🎬 *YASEEN－ＭＤ  ＭＯＶＩＥ  ＬＩＳＴ*\n\n`;
            results.forEach((m, i) => {
                listText += `*${i + 1}.* ${m.Title} (${m.Year})\n`;
            });
            
            listText += `\n✨ *To see details, type:* \`.movie [number]\`\n_Example: .movie 1_`;

            await sock.sendMessage(from, { text: listText }, { quoted: message });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: "⚠️ Connection Error!" });
        }
    }
};
