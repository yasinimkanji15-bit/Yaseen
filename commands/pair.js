const { delay } = require("@whiskeysockets/baileys");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    name: "pair",
    alias: ["pairing", "getcode"],
    description: "Generate a WhatsApp pairing code for a new session.",
    category: "owner",

    execute: async (sock, chatId, message, args, { isOwner }) => {
        let inputNumber = args[0];

        if (!inputNumber) {
            return sock.sendMessage(chatId, { text: "❌ Please provide a phone number!\n\nExample: *.pair 2557XXXXXXXX*" }, { quoted: message });
        }

        let phoneNumber = inputNumber.replace(/[^0-9]/g, '');

        await sock.sendMessage(chatId, { text: "🔄 *YAS-TECH* is generating your Pairing Code, please wait..." }, { quoted: message });

        try {
            // Badala ya kutengeneza socket mpya hapa, tunaiomba index.js iwashe na kusimamia hii session
            // Hii inahakikisha session inakaa kwenye folda kuu la 'sessions' na itakuwa inajiwasha yenyewe mbeleni
            const mainServer = require('../index'); // Hakikisha path hii inaelekea ilipo index.js yako vizuri
            
            if (typeof mainServer.startUserBot !== 'function') {
                return sock.sendMessage(chatId, { text: "❌ Server configuration error. Multi-bot function not found." }, { quoted: message });
            }

            const tempSock = await mainServer.startUserBot(phoneNumber);
            await delay(3000); 

            if (!tempSock.authState.creds.registered) {
                let code = await tempSock.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;

                let responseText = `╭───⊷ 📱 *PAIR CODE* ⊶
│
┠⊷ *Phone:* +${phoneNumber}
┠⊷ *Code:* *${code.toUpperCase()}*
│
┠⊷ *How to enter it:*
┃ 1️⃣ Open WhatsApp on that phone
┃ 2️⃣ Tap ⋮ Menu → *Linked Devices*
┃ 3️⃣ Tap *Link a Device*
┃ 4️⃣ Tap *Link with Phone Number*
┃ 5️⃣ Enter the code: *${code.toUpperCase()}*
│
┠⊷ ⚠️ Valid for *~2 minutes* only
┖⊷ *Powered by YAS-TECH*`;

                await sock.sendMessage(chatId, { text: responseText }, { quoted: message });

                await delay(2000);
                await sock.sendMessage(chatId, { text: code.toUpperCase() }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, { text: `❌ The number +${phoneNumber} is already linked and active on this server!` }, { quoted: message });
            }

        } catch (error) {
            console.error("Command Pair Error:", error);
            await sock.sendMessage(chatId, { text: "❌ Error: Failed to generate code. Check the number format or server logs." }, { quoted: message });
            
            // Kama ilifeli mwanzoni kabisa na kufuta faili
            const sessionPath = path.join(__dirname, '../sessions', phoneNumber);
            if (fs.existsSync(sessionPath)) {
                try {
                    await fs.remove(sessionPath);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }
};
