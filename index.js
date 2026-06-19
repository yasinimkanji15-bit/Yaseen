const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    makeCacheableSignalKeyStore,
    DisconnectReason,
    fetchLatestBaileysVersion,
    delay
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");

// 1. IMPORT YOUR HANDLERS
const settings = require('./settings');
const { handleMessages } = require('./main'); 
const chatbot = require('./chatbot'); 

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); 

const PORT = process.env.PORT || 3000;
let globalSock = null; 

async function startYASEENBot() {
    const sessionDir = path.join(__dirname, 'session');
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, 
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    globalSock = sock; 

    // --- PAIRING CODE VIA TERMINAL (FALLBACK FOR OWNER) ---
    if (!sock.authState.creds.registered && settings.OWNER_NUMBER) {
        const phoneNumber = settings.OWNER_NUMBER.replace(/[^0-9]/g, '');
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(`\n✅ OWNER PAIRING CODE: ${code}\n`);
            } catch (error) {
                console.error("❌ Terminal Pairing Error:", error.message);
            }
        }, 5000);
    }

    // --- THE MESSAGE LISTENER ---
    sock.ev.on('messages.upsert', async (m) => {
        try {
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
            const messageBody = msg.message.conversation || 
                                msg.message.extendedTextMessage?.text || 
                                msg.message.imageMessage?.caption || 
                                msg.message.videoMessage?.caption || "";

            if (typeof chatbot.handle === 'function') {
                await chatbot.handle(sock, chatId, msg, messageBody);
            } else if (typeof chatbot === 'function') {
                await chatbot(sock, chatId, msg, messageBody);
            }

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

// --- EXPRESS API ENDPOINT FOR PAIRING SITE ---
app.post('/api/pair', async (req, res) => {
    let { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required!' });

    phone = phone.replace(/[^0-9]/g, '');

    if (!globalSock) {
        return res.status(500).json({ error: 'Bot server is not ready yet. Please wait a few seconds!' });
    }

    try {
        if (!globalSock.authState.creds.registered) {
            await delay(1500);
            let code = await globalSock.requestPairingCode(phone);
            code = code?.match(/.{1,4}/g)?.join('-') || code;
            return res.json({ code: code });
        } else {
            return res.json({ error: 'Bot is already connected to another account!' });
        }
    } catch (error) {
        console.error("API Pairing Error:", error);
        return res.status(500).json({ error: 'Failed to generate code. Please try again!' });
    }
});

// Start the Express Server and the WhatsApp Bot
app.listen(PORT, () => {
    console.log(`🌍 Express Web Server running on port: ${PORT}`);
});

startYASEENBot();
