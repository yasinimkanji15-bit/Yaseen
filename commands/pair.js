const { makeWASocket, useMultiFileAuthState, delay, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs-extra");

module.exports = {
    name: "pair",
    alias: ["pairing", "getcode"],
    description: "Generate a WhatsApp pairing code for a new session.",
    category: "owner",

    execute: async (sock, chatId, message, args, { isOwner }) => {
        let inputNumber = args[0];
        
        // 1. Badala ya message.reply, tumia sock.sendMessage
        if (!inputNumber) {
            return sock.sendMessage(chatId, { text: "❌ Please provide a phone number!\n\nExample: *.pair 2557XXXXXXXX*" }, { quoted: message });
        }

        let phoneNumber = inputNumber.replace(/[^0-9]/g, '');
        
        // 2. Hapa pia badilisha kuelekea sock.sendMessage
        await sock.sendMessage(chatId, { text: "🔄 *YAS-TECH* is generating your Pairing Code, please wait..." }, { quoted: message });

        const sessionPath = `./temp_session/${phoneNumber}`;
        if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

        const { state } = await useMultiFileAuthState(sessionPath);
        const { version } = await fetchLatestBaileysVersion();

        try {
            let tempSock = makeWASocket({
                version,
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: ["Ubuntu", "Chrome", "20.0.04"]
            });

            if (!tempSock.authState.creds.registered) {
                await delay(5000); 
                
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
            }

        } catch (error) {
            console.error(error);
            await sock.sendMessage(chatId, { text: "❌ Error: Failed to generate code. Check the number format." }, { quoted: message });
            await fs.remove(sessionPath);
        }
    }
};
