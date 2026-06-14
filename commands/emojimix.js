const fetch = require('node-fetch');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

module.exports = {
    name: "emojimix",
    alias: ["mix", "emix"],
    description: "Create a hybrid sticker from two emojis.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const query = args.join(" ");

        // 🟢 MANUAL (Triggered if query is empty or just 'manual')
        if (!query || query === 'manual') {
            const manual = `🎭 *YASEEN-ＭＤ ＥＭＯＪＩＭＩＸ*

> *“Two faces, one identity. Choose your mask wisely.”*

✦═════════════════════✦
1️⃣ *Usage:* .emojimix emoji1+emoji2
2️⃣ *Example:* .emojimix 😎+🥰
3️⃣ *Note:* Some emojis cannot be mixed.
✦═════════════════════✦

📂 *Field intel:*
> Combine two different emojis to generate a custom sticker. Ensure you use the + sign between them.

_© 2026 YAS-TECH_`;
            return sock.sendMessage(from, { text: manual });
        }

        // Check for the + sign
        if (!query.includes('+')) {
            const errorMsg = `❌ *Invalid Format*\n\n> Separate the emojis with a + sign.\n> Example: .emojimix 💀+🔥`;
            return sock.sendMessage(from, { text: errorMsg });
        }

        await sock.sendMessage(from, { react: { text: '🎭', key: message.key } });

        try {
            let [emoji1, emoji2] = query.split('+').map(e => e.trim());

            // Tenor API for Emoji Kitchen
            const url = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;

            const response = await fetch(url);
            const data = await response.json();

            if (!data.results || data.results.length === 0) {
                return sock.sendMessage(from, { 
                    text: "❌ These emojis cannot be mixed! Try common ones like 😂, 🤡, or 💖." 
                });
            }

            const imageUrl = data.results[0].url;
            const tmpDir = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

            const tempFile = path.join(tmpDir, `temp_${Date.now()}.png`);
            const outputFile = path.join(tmpDir, `sticker_${Date.now()}.webp`);

            const imageResponse = await fetch(imageUrl);
            const buffer = await imageResponse.buffer();
            fs.writeFileSync(tempFile, buffer);

            // FFmpeg conversion to WhatsApp Sticker format
            const ffmpegCommand = `ffmpeg -i "${tempFile}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" "${outputFile}"`;
            
            await new Promise((resolve, reject) => {
                exec(ffmpegCommand, (error) => {
                    if (error) reject(error);
                    else resolve();
                });
            });

            const stickerBuffer = fs.readFileSync(outputFile);

            await sock.sendMessage(from, { 
                sticker: stickerBuffer 
            }, { quoted: message });

            // Cleanup
            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
            if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);

        } catch (error) {
            console.error(error);
            return sock.sendMessage(from, { 
                text: "❌ System error. Ensure your server has ffmpeg installed." 
            });
        }
    }
};
