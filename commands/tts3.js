const gtts = require('google-tts-api');

module.exports = {
    name: "tts",
    alias: ["tspeech", "say"],
    description: "Systematic Multi-Language Voice Engine with Instant Deletion.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        // 1. --- INSTANT COMMAND DELETION ---
        // Deletes your ".tts" message immediately to keep the chat clean
        try {
            await sock.sendMessage(from, { delete: message.key });
        } catch (err) {
            console.log("Delete failed: Likely not an admin in a group.");
        }

        // 2. --- FULL HELP MENU (If no text is provided) ---
        if (args.length === 0 && !quoted) {
            const manual = `🎙️ *YAS-TECH — VOICE ENGINE*

> *“Voice is the identity of the machine. Select your frequency.”*

✦═══════════════════════◆
🌍 *SUPPORTED FREQUENCIES:*

> 📍 🇹🇿 *sw* : Swahili
> 📍 🇺🇸 *en* : English (US)
> 📍 🇬🇧 *en-gb* : English (UK - Male)
> 📍 🇸🇦 *ar* : Arabic
> 📍 🇫🇷 *fr* : French
> 📍 🇪🇸 *es* : Spanish
> 📍 🇩🇪 *de* : German
> 📍 🇮🇳 *hi* : Hindi
> 📍 🇯🇵 *ja* : Japanese
> 📍 🇰🇷 *ko* : Korean
> 📍 🇷🇺 *ru* : Russian
> 📍 🇵🇹 *pt* : Portuguese
> 📍 🇹🇷 *tr* : Turkish

🚀 *PROTOCOL:*
> \`.tts [code] [text]\`
> _Example:_ \`.tts sw Mambo Yaseen_

📝 *QUOTE MODE:*
> Reply to any text with \`.tts [code]\`
✦═══════════════════════◆

> _© 2026 YAS-TECH • Systematic Voice_`;
            return await sock.sendMessage(from, { text: manual });
        }

        try {
            let lang = 'en'; 
            let text = "";

            // 3. LANGUAGE & TEXT EXTRACTION
            if (args[0] && (args[0].length === 2 || args[0].includes('-'))) {
                lang = args[0].toLowerCase();
                text = args.slice(1).join(" ");
            } else {
                text = args.join(" ");
            }

            // 4. QUOTE DETECTION (Reply Mode)
            if (quoted && !text) {
                text = quoted.conversation || 
                       quoted.extendedTextMessage?.text || 
                       quoted.imageMessage?.caption || "";
            }

            if (!text || text.length > 200) return;

            // 5. GENERATE AUDIO URL
            const url = gtts.getAudioUrl(text, {
                lang: lang,
                slow: false,
                host: 'https://translate.google.com',
            });

            // 6. SEND AS VOICE NOTE (STABLE PROTOCOL)
            // Using ogg/opus as it's the most stable for WhatsApp PTT
            // --- NEW OPTIMIZED BLOCK ---
await sock.sendMessage(from, { 
    audio: { url: url }, 
    mimetype: 'audio/mp4', // Hapa tumia mp4 kwa audio ya kawaida
    ptt: false // Ibadilishe kuwa false
}, { quoted: message });

        } catch (e) {
            console.error("TTS Error:", e);
        }
    }
};
