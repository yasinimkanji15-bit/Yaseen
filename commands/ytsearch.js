const StephUI = require('stephtech-ui');

module.exports = {
    name: "search",
    alias: ["ytsearch", "tafuta","eg1"],
    description: "Search for videos and display them using a beautiful carousel layout.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        const query = args.join(" ");
        
        if (!query) {
            return await sock.sendMessage(chatId, { text: "❌ Tafadhali weka neno unalotaka kutafuta! Mfano: `.search bongo flava`" }, { quoted: message });
        }

        try {
            // Anzisha interface ya StephUI kwa kupitisha socket ya sasa
            const ui = new StephUI(sock);

            // React kuonyesha bot inafanyia kazi ombi
            await sock.sendMessage(chatId, { react: { text: '🔍', key: message.key } });

            // Mfano wa data (Hapa unaweza kuweka matokeo halisi kutoka kwenye API yako ya YouTube)
            const searchResults = [
                {
                    title: `Video ya Kwanza Kuhusu ${query}`,
                    description: "👤 Alikiba\n⏱️ 3:45 Mins\n👁️ 1.2M Views",
                    imageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500",
                    videoUrl: "https://youtube.com"
                },
                {
                    title: `Video ya Pili Kuhusu ${query}`,
                    description: "👤 Diamond Platnumz\n⏱️ 4:12 Mins\n👁️ 3.5M Views",
                    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500",
                    videoUrl: "https://youtube.com"
                }
            ];

            // Badilisha data ya matokeo iende kwenye mfano wa kadi za stephtech-ui
            const cards = searchResults.map(item => ({
                title: item.title,
                body: item.description,
                image: item.imageUrl,
                buttons: [
                    { id: `.download ${item.videoUrl}`, text: "📥 Download Video" },
                    { id: "", text: "🔗 Tazama YouTube", type: "url", url: item.videoUrl }
                ]
            }));

            // Tuma Carousel kwa mtumiaji kupitia library ya stephtech-ui
            await ui.carousel(chatId, {
                header: `🎵 Matokeo ya Utafiti: ${query}`,
                cards: cards
            });

        } catch (err) {
            console.error("Search UI Command Error:", err);
            await sock.sendMessage(chatId, { text: "❌ Kushindwa kukamilisha utafutaji kwa sasa. Jaribu tena baadae." }, { quoted: message });
        }
    }
};
