const axios = require('axios');

module.exports = {
    name: "manga",
    alias: ["mangadex", "comic", "anime-m"],
    description: "Search for Manga details and covers from MangaDex.",
    category: "entertainment",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const query = args.join(" ");

        // 🟢 MANUAL (Triggered if no search term is provided)
        if (!query || query === 'manual' || query === 'help') {
            const manual = `📖 *YASEEN-ＭＤ ＭＡＮＧＡ*

> *“A story is only as good as its hero.”*

✦═════════════════════✦
1️⃣ *Usage:* .manga [title]
2️⃣ *Search:* Enter any manga name.
3️⃣ *Example:* .manga One Piece
✦═════════════════════✦

📂 *Field intel:*
> Fetches the synopsis, status, latest chapter info, and the official cover art directly from the MangaDex database.

_© 2026 YAS-TECH_`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '🔍', key: message.key } });

            // 1. Search for Manga ID
            const searchRes = await axios.get(`https://api.mangadex.org/manga`, {
                params: { title: query, limit: 1, 'includes[]': ['cover_art'] }
            });

            if (searchRes.data.data.length === 0) {
                return await sock.sendMessage(from, { text: "❌ *Manga not found.* Check the spelling and try again." });
            }

            const manga = searchRes.data.data[0];
            const attr = manga.attributes;
            const mangaId = manga.id;

            // 2. Get Cover Art
            const coverRel = manga.relationships.find(r => r.type === 'cover_art');
            const fileName = coverRel?.attributes?.fileName;
            const coverUrl = fileName ? `https://uploads.mangadex.org/covers/${mangaId}/${fileName}` : 'https://mangadex.org/manga-placeholder.png';

            // 3. Format Details
            const title = attr.title.en || Object.values(attr.title)[0];
            const status = attr.status.toUpperCase();
            const year = attr.year || "Unknown";
            const description = attr.description.en ? attr.description.en.split('\n')[0] : "No description available.";

            let responseText = `📚 *ＭＡＮＧＡ ＩＮＴＥＬ* 📚
> *Title:* ${title}

✦═════════════════════✦
🎭 *STATUS:* ${status}
📅 *YEAR:* ${year}
📖 *LATEST CH:* ${attr.lastChapter || "N/A"}

📝 *SYNOPSIS:*
> “${description}”
✦═════════════════════✦

🔗 *Link:* https://mangadex.org/title/${mangaId}

_© 2026 YAS-TECH | Dev: Arusha_`;

            // 4. Send with Cover Image
            await sock.sendMessage(from, { 
                image: { url: coverUrl }, 
                caption: responseText 
            }, { quoted: message });

            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (error) {
            console.error(error);
            await sock.sendMessage(from, { text: "❌ *Error:* Failed to fetch Manga data." });
        }
    }
};
