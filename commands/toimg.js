const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const { exec } = require('child_process');
const { tmpdir } = require('os');
const path = require('path');
const ffmpegPath = require('ffmpeg-static'); // 🛠️ Using your static dependency

module.exports = {
    name: "simage",
    alias: ["toimg", "tovideo", "stickerimg"],
    description: "Extract raw media data using portable FFmpeg static engine.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quoted || !quoted.stickerMessage) {
            const manual = `🖼️ *YASEEN－ＭＤ  ＥＸＴＲＡＣＴＯＲ*\n\n> • Reply to a sticker with \`.simage\`\n\n*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '📸', key: message.key } });

            const stickerMessage = quoted.stickerMessage;
            const isAnimated = stickerMessage.isAnimated || stickerMessage.seconds > 0;

            const stream = await downloadContentFromMessage(stickerMessage, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

            const tempDir = tmpdir();
            const inputPath = path.join(tempDir, `YASEEN_${Date.now()}.webp`);
            fs.writeFileSync(inputPath, buffer);

            if (isAnimated) {
                const outputPath = path.join(tempDir, `YASEEN_video_${Date.now()}.mp4`);
                
                // 🚀 Using "${ffmpegPath}" ensures we use the static binary
                await new Promise((resolve, reject) => {
                    exec(`"${ffmpegPath}" -i "${inputPath}" -movflags +faststart -pix_fmt yuv420p -vf "scale=512:512:force_original_aspect_ratio=decrease" "${outputPath}"`, (error) => {
                        if (error) reject(error);
                        else resolve();
                    });
                });

                const videoBuffer = fs.readFileSync(outputPath);
                await sock.sendMessage(from, {
                    video: videoBuffer,
                    caption: `🎬 *YASEEN－ＭＤ  ＶＩＤＥＯ*\n\n> *“Animated data extracted via Static Node.”*\n\n*🛡️ YASEEN－ＭＤ 🛡️*`
                }, { quoted: message });

                fs.unlinkSync(outputPath);
            } else {
                const outputPath = path.join(tempDir, `YASEEN_img_${Date.now()}.png`);
                
                await new Promise((resolve, reject) => {
                    exec(`"${ffmpegPath}" -i "${inputPath}" "${outputPath}"`, (error) => {
                        if (error) reject(error);
                        else resolve();
                    });
                });

                const imageBuffer = fs.readFileSync(outputPath);
                await sock.sendMessage(from, {
                    image: imageBuffer,
                    caption: `📸 *YASEEN－ＭＤ  ＩＭＡＧＥ*\n\n> *“Visual data extracted via Static Node.”*\n\n*🛡️ YASEEN－ＭＤ 🛡️*`
                }, { quoted: message });

                fs.unlinkSync(outputPath);
            }

            fs.unlinkSync(inputPath);
            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

        } catch (err) {
            console.error('SIMAGE STATIC ERROR:', err);
            await sock.sendMessage(from, { 
                text: "❌ *STATIC ERROR:* The FFmpeg binary failed to initialize. Try restarting the bot." 
            }, { quoted: message });
        }
    }
};
