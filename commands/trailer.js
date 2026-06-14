const yts = require('yt-search');

module.exports = {
    name: "trailer",
    alias: ["movietrailer", "preview"],
    description: "Search and get a movie trailer link.",
    category: "search",

    execute: async (sock, chatId, m, args) => {
        const from = chatId;
        const query = args.join(" ");

        if (!query) {
            return sock.sendMessage(from, { text: "❌ Please provide a movie name!\n\n*Example:* .trailer Deadpool & Wolverine" });
        }

        try {
            await sock.sendMessage(from, { react: { text: '🎬', key: m.key } });

            // Search YouTube for the trailer
            const search = await yts(`${query} official trailer`);
            const video = search.videos[0]; // Get the first result

            if (!video) {
                return sock.sendMessage(from, { text: "❌ Sorry, I couldn't find a trailer for that movie." });
            }

            let trailerMsg = `✨ *ＹＡＳＥＥＮ－ＭＤ  ＴＲＡＩＬＥＲ* ✨\n\n`;
            trailerMsg += `🎬 *Title:* ${video.title}\n`;
            trailerMsg += `🕒 *Duration:* ${video.timestamp}\n`;
            trailerMsg += `📅 *Uploaded:* ${video.ago}\n`;
            trailerMsg += `👁️ *Views:* ${video.views.toLocaleString()}\n`;
            trailerMsg += `🔗 *Link:* ${video.url}\n\n`;
            trailerMsg += `_© 2026 YASEEN LAPORTE TECH_`;

            // Using your bot's menu image
           const botImg = global.botConfig?.menuThumb || "https://files.catbox.moe/038kef.jpg";
            const isBuffer = Buffer.isBuffer(botImg);

             await sock.sendMessage(from, {
              image: { url: video.thumbnail }, // Shows the movie thumbnail
                caption: trailerMsg,
                contextInfo: {
                    externalAdReply: {
                        title: "MOVIE TRAILER FOUND",
                        body: video.author.name,
                       ...(isBuffer ? { thumbnail: botImg } : { thumbnailUrl: botImg }),
                        sourceUrl: video.url,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error("Trailer Error:", err);
            await sock.sendMessage(from, { text: "❌ An error occurred while searching for the trailer." });
        }
    }
};
