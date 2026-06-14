const axios = require('axios');

if (!global.tempMailCache) global.tempMailCache = {};

module.exports = {
    name: "tempmail",
    alias: ["tmail", "tempemail", "checkmail"],
    description: "Generate and check temporary disposable emails.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        
        // 🛠️ DYNAMIC PREFIX DETECTION
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0); 
        const input = args[0]?.toLowerCase();

        // --- 🟢 1. YAS-TECH TEMP-MAIL MANUAL ---
        if (!input) {
            const manual = `✦═══════════════════════◆
📧 *YASEEN TEMP-MAIL*
✦═══════════════════════◆

🛰️ *OPERATIONAL COMMANDS:*
> *${prefix}tempmail gen* ➔ Generate New Email
> *${prefix}tempmail check* ➔ Check Active Inbox

💡 *TIP:* Use these for one-time registrations. Emails expire in 10 minutes!

✦═══════════════════════◆
_© 2026 YAS-TECH • Privacy Node_`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        // --- 🚀 2. GENERATE EMAIL ---
        if (input === "gen") {
            try {
                await sock.sendMessage(from, { react: { text: '📧', key: message.key } });
                const { data } = await axios.get(`https://api.giftedtech.co.ke/api/tempgen/v2/generate?apikey=gifted&mode=random`);

                if (!data.success) throw new Error();

                const email = data.result.email;
                global.tempMailCache[from] = email; 

                let report = `📧 *GHOST MAIL GENERATED*\n\n`;
                report += `> 📍 *ADDRESS:* ${email}\n`;
                report += `> ⏳ *EXPIRY:* 10 Minutes\n`;
                report += `> 🛡️ *STATUS:* Active & Waiting...\n\n`;
                report += `💡 *Type ${prefix}tempmail check to read incoming messages.*`;

                await sock.sendMessage(from, { text: report }, { quoted: message });
                return await sock.sendMessage(from, { react: { text: '✅', key: message.key } });
            } catch (e) {
                return sock.sendMessage(from, { text: "❌ *CORE ERROR:* Failed to synthesize temporary address." });
            }
        }

        // --- 📥 3. CHECK INBOX ---
        if (input === "check") {
            const activeEmail = global.tempMailCache[from];
            if (!activeEmail) return sock.sendMessage(from, { text: `❌ *NO ACTIVE MAIL:* Generate one first using ${prefix}tempmail gen` });

            try {
                await sock.sendMessage(from, { react: { text: '📥', key: message.key } });
                const { data } = await axios.get(`https://api.giftedtech.co.ke/api/tempgen/v2/inbox?apikey=gifted&email=${activeEmail}`);

                if (!data.success) throw new Error();

                const messages = data.result;

                if (messages.length === 0) {
                    return sock.sendMessage(from, { 
                        text: `📭 *INBOX EMPTY*\n\n> No messages received yet for:\n> ${activeEmail}` 
                    }, { quoted: message });
                }

                let inboxReport = `📥 *INBOX REPORT FOR:* \n> ${activeEmail}\n\n`;
                
                messages.forEach((m, i) => {
                    inboxReport += `📩 *MESSAGE [${i + 1}]*\n`;
                    inboxReport += `> 👤 *FROM:* ${m.from}\n`;
                    inboxReport += `> 📝 *SUBJECT:* ${m.subject}\n`;
                    inboxReport += `> 📅 *DATE:* ${m.date}\n`;
                    inboxReport += `> 💬 *BODY:* ${m.text || "No text content available."}\n\n`;
                });

                await sock.sendMessage(from, { text: inboxReport }, { quoted: message });
                return await sock.sendMessage(from, { react: { text: '✅', key: message.key } });
            } catch (e) {
                return sock.sendMessage(from, { text: "❌ *INBOX ERROR:* Connection to mail node lost." });
            }
        }
    }
};
