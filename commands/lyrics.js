const axios = require('axios');
module.exports = {
    name: "lyrics",
    alias: ["ly", "lyric"],
    description: "Search for song lyrics quickly.",
    category: "tools",
    execute: async (sock, chatId, message, args) => {
        const songQuery = args.join(' ').trim();

        // 🟢 INSTRUCTION MANUAL

        if (!songQuery) {

            const manual = `🎵 *Lyrics Finder Manual*

Find lyrics for almost any song instantly.
✦═════════◆═════════✦
*Usage:*

\`.lyrics [song name]\`
> • _Example:_ \`.lyrics Blinding Lights\`
> • _Example:_ \`.lyrics Burna Boy City Boys\`
✦═════════◆═════════✦

*Note:* If the search finds the wrong song, try adding the Artist's name to your request.

«.lyrics [song_name]»`;

            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });

        }

        try {

            // Loading reaction

            await sock.sendMessage(chatId, { react: { text: '🔍', key: message.key } });

            // 1. Search for the song

            const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(songQuery)}`;

            const response = await axios.get(searchUrl);

            if (!response.data || response.data.length === 0) {

                await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });

                return await sock.sendMessage(chatId, { 

                    text: `❌ No lyrics found for: *${songQuery}*` 

                }, { quoted: message });

            }

            // 2. Take the first result
            const songData = response.data[0];
            // 3. Extract lyrics
            const lyricsBody = songData.plainLyrics || "⚠️ Lyrics content is available but restricted for this track.";
            // 4. Construct the Message
            let lyricsMessage = `🎵 *LYRICS FINDER* 🎵\n\n`;
            lyricsMessage += `✨ *Title:* ${songData.trackName}\n`;
            lyricsMessage += `👤 *Artist:* ${songData.artistName}\n`;
            lyricsMessage += `💿 *Album:* ${songData.albumName || 'N/A'}\n`;

            lyricsMessage += `───────────────────\n\n`;
            lyricsMessage += lyricsBody;
            lyricsMessage += `\n\n───────────────────\n*YAS-TECH*`;

            // 5. Send it

            await sock.sendMessage(chatId, { text: lyricsMessage }, { quoted: message });

            // Success reaction

            await sock.sendMessage(chatId, { react: { text: '🎶', key: message.key } });

        } catch (error) {

            console.error('Lyrics Error:', error.message);

            await sock.sendMessage(chatId, { text: '❌ Service is currently down. Please try again later.' });

        }

    }

};

