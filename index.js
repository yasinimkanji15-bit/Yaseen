const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    makeCacheableSignalKeyStore,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

// 1. IMPORT YOUR HANDLERS
const settings = require('./settings');
const { handleMessages } = require('./main'); // This is the engine
const chatbot = require('./chatbot'); // LINE INAYO-IMPORT CHATBOT

async function startYASEENBot() {
    const sessionDir = path.join(__dirname, 'session');
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, // Set to true if you want to scan QR instead of pairing
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // --- PAIRING CODE LOGIC ---
    if (!sock.authState.creds.registered) {
        const phoneNumber = settings.OWNER_NUMBER.replace(/[^0-9]/g, '');
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(`\n✅ YOUR PAIRING CODE: ${code}\n`);
            } catch (error) {
                console.error("❌ Pairing Error:", error.message);
            }
        }, 5000);
    }

    // --- THE MESSAGE LISTENER ---
    sock.ev.on('messages.upsert', async (m) => {
        try {
            // Umerekebisha hapa ili 'msg' isomwe kutoka kwenye 'm.messages[0]' inayokuja kutoka Baileys
            const msg = m.messages[0]; 
            if (!msg.message) return;

            const chatId = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;

            // --- JAIL CHECK ---
            const jailPath = './database/jail.json';
            if (fs.existsSync(jailPath)) {
                const jailData = JSON.parse(fs.readFileSync(jailPath));
                if (jailData[chatId] && jailData[chatId].includes(sender)) {
                    await sock.sendMessage(chatId, { delete: msg.key });
                    return;
                }
            }

            // --- CHATBOT HANDLER LOGIC ---
            // Hapa tunapitisha text au caption kwenda kwenye chatbot engine
            const messageBody = msg.message.conversation || 
                                msg.message.extendedTextMessage?.text || 
                                msg.message.imageMessage?.caption || 
                                msg.message.videoMessage?.caption || "";

            if (typeof chatbot.handle === 'function') {
                await chatbot.handle(sock, chatId, msg, messageBody);
            } else if (typeof chatbot === 'function') {
                await chatbot(sock, chatId, msg, messageBody);
            }

            // This line sends the message to main.js to check for .ping
            await handleMessages(sock, m); 

        } catch (err) {
            console.error("Handler Error:", err);
        }
    });

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "open") {
            console.log(`🎉 YAS-TECH IS LIVE!`);
            await sock.sendMessage(sock.user.id, { text: settings.WELCOME_MESSAGE });
        }
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                startYASEENBot();
            }
        }
    });

    sock.ev.on("creds.update", saveCreds);
}

startYASEENBot();