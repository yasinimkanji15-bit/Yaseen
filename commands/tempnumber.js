const axios = require('axios');

if (!global.tempSmsCache) global.tempSmsCache = {};

module.exports = {
    name: "tempsms",
    alias: ["tsms", "sms", "checksms"],
    description: "Bulk generate and check virtual numbers.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0); 
        const input = args[0]?.toLowerCase();

        // 🌍 COUNTRY MAPPING
        const countries = {
            "1": "uk",
            "2": "sweden",
            "3": "finland",
            "4": "netherlands",
            "5": "denmark",
            "6": "belgium",
            "7": "slovenia",
            "0": "random"
        };

        // --- 🟢 1. YAS-TECH TEMP-SMS MANUAL ---
        if (!input) {
            const manual = `✦═══════════════════════◆
📟 *YASEEN TEMP-SMS BULK*
✦═══════════════════════◆

🛰️ *OPERATIONAL COMMANDS:*
> *${prefix}tempsms gen [amount]* ➔ Bulk Random
> *${prefix}tempsms gen [country_num] [amount]* ➔ Bulk Country

🌍 *COUNTRY CODES:*
1. UK | 2. Sweden | 3. Finland | 4. Netherlands
5. Denmark | 6. Belgium | 7. Slovenia | 0. Random

📍 *EXAMPLE:*
> *${prefix}tempsms gen 1 5* (5 UK Numbers)
> *${prefix}tempsms gen 10* (10 Random Numbers)

✦═══════════════════════◆
_© 2026 YAS-TECH • Signal Node_`;
            return await sock.sendMessage(from, { text: manual }, { quoted: message });
        }

        // --- 🚀 2. BULK GENERATE LOGIC ---
        if (input === "gen") {
            let countryKey = "0";
            let amount = 1;

            // Check if args[1] is a country code or just an amount
            if (args[1] && countries[args[1]]) {
                countryKey = args[1];
                amount = parseInt(args[2]) || 1;
            } else if (args[1]) {
                amount = parseInt(args[1]) || 1;
            }

            // Limit bulk to prevent spam/ban (Max 20 at once)
            if (amount > 20) amount = 20;

            const selectedCountry = countries[countryKey];
            const generatedNumbers = [];

            try {
                await sock.sendMessage(from, { react: { text: '📡', key: message.key } });

                for (let i = 0; i < amount; i++) {
                    const { data } = await axios.get(`https://api.giftedtech.co.ke/api/tempgen/sms/generate?apikey=gifted&country=${selectedCountry}`);
                    if (data.success) {
                        generatedNumbers.push(data.result.number);
                    }
                }

                if (generatedNumbers.length === 0) throw new Error();

                // Save the LAST generated number to cache for the 'check' command
                global.tempSmsCache[from] = generatedNumbers[generatedNumbers.length - 1];

                let report = `📟 *BULK SIGNAL REPORT*\n\n`;
                report += `> 🌍 *TARGET:* ${selectedCountry.toUpperCase()}\n`;
                report += `> 🔢 *COUNT:* ${generatedNumbers.length}\n\n`;
                
                generatedNumbers.forEach((num, index) => {
                    report += `${index + 1}. ${num}\n`;
                });

                report += `\n> ⏳ *EXPIRY:* 10 Minutes\n`;
                report += `> 💡 *Note:* Only the last number (#${generatedNumbers.length}) is active for ${prefix}tempsms check.`;

                await sock.sendMessage(from, { text: report }, { quoted: message });
                return await sock.sendMessage(from, { react: { text: '✅', key: message.key } });

            } catch (e) {
                return sock.sendMessage(from, { text: "❌ *SIGNAL ERROR:* Bulk allocation failed." });
            }
        }

        // --- 📥 3. CHECK SMS INBOX ---
        if (input === "check") {
            const activeNumber = global.tempSmsCache[from];
            if (!activeNumber) return sock.sendMessage(from, { text: `❌ *NO ACTIVE SIGNAL:* Generate a number first.` });

            try {
                await sock.sendMessage(from, { react: { text: '📥', key: message.key } });
                const { data } = await axios.get(`https://api.giftedtech.co.ke/api/tempgen/sms/inbox?apikey=gifted&number=${activeNumber}`);

                if (!data.success) throw new Error();
                const messages = data.result;

                if (messages.length === 0) {
                    return sock.sendMessage(from, { text: `📭 *INBOX EMPTY*\n\n> No SMS for: ${activeNumber}` }, { quoted: message });
                }

                let inboxReport = `📥 *SMS INBOX:* ${activeNumber}\n\n`;
                messages.slice(0, 5).forEach((m, i) => {
                    inboxReport += `📩 *MSG [${i + 1}]*\n> *FROM:* ${m.from}\n> *TEXT:* ${m.text}\n\n`;
                });

                await sock.sendMessage(from, { text: inboxReport }, { quoted: message });
                return await sock.sendMessage(from, { react: { text: '✅', key: message.key } });
            } catch (e) {
                return sock.sendMessage(from, { text: "❌ *INBOX ERROR:* Node offline." });
            }
        }
    }
};
