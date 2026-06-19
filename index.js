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

// Object ya kuhifadhi socket za watu tofauti waliounganishwa
const activeSessions = {}; 

// Hakikisha folda kuu la sessions lipo
const sessionsMainDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsMainDir)) fs.mkdirSync(sessionsMainDir);

async function startUserBot(phoneNumber) {
    // Kama tayari kuna socket ya namba hii na iko hai, usiwashe upya
    if (activeSessions[phoneNumber]) return activeSessions[phoneNumber];

    const userSessionDir = path.join(sessionsMainDir, phoneNumber);
    if (!fs.existsSync(userSessionDir)) fs.mkdirSync(userSessionDir);

    const { state, saveCreds } = await useMultiFileAuthState(userSessionDir);
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

    // Hifadhi socket kwenye kumbukumbu kwa ajili ya namba hii
    activeSessions[phoneNumber] = sock; 

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
            console.error(`Handler Error for ${phoneNumber}:`, err);
        }
    });

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "open") {
            console.log(`🎉 YAS-TECH IS LIVE FOR NUMBER: ${phoneNumber}`);
            try {
                await sock.sendMessage(sock.user.id, { text: settings.WELCOME_MESSAGE || "YAS-TECH Connected Successfully!" });
            } catch (e) {
                console.error("Failed to send welcome message:", e.message);
            }
        }
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                // Kama hajalaunch out, iwashe upya namba hiyo tu
                delete activeSessions[phoneNumber];
                startUserBot(phoneNumber);
            } else {
                // Kama amelogout kabisa, futa data zake
                console.log(`🔒 Session logged out for ${phoneNumber}. Cleaning files...`);
                delete activeSessions[phoneNumber];
                try {
                    fs.rmSync(userSessionDir, { recursive: true, force: true });
                } catch (e) {
                    console.error("Session cleanup error:", e.message);
                }
            }
        }
    });

    sock.ev.on("creds.update", saveCreds);
    return sock;
}

// --- WAPAKE BOT ZOTE ZILIZOKUWA ACTIVE ZIKIWASHWA UPYA SERVER ---
function preloadExistingSessions() {
    if (fs.existsSync(sessionsMainDir)) {
        const folders = fs.readdirSync(sessionsMainDir);
        folders.forEach(folder => {
            if (fs.lstatSync(path.join(sessionsMainDir, folder)).isDirectory() && folder.match(/^\d+$/)) {
                console.log(`Arise session found for number: ${folder}. Starting...`);
                startUserBot(folder);
            }
        });
    }
}

// --- EXPRESS API ENDPOINT FOR MULTI-PAIRING ---
app.post('/api/pair', async (req, res) => {
    let { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required!' });

    // Safisha namba iwe namba tupu
    phone = phone.replace(/[^0-9]/g, '');

    try {
        // Washa socket maalum kwa ajili ya namba hii
        const sock = await startUserBot(phone);

        // Subiri sekunde kidogo kurekebisha hali ya mwanzo
        await delay(2000);

        if (!sock.authState.creds.registered) {
            let code = await sock.requestPairingCode(phone);
            code = code?.match(/.{1,4}/g)?.join('-') || code;
            return res.json({ code: code });
        } else {
            return res.status(400).json({ error: `The number ${phone} is already linked and running on this server!` });
        }
    } catch (error) {
        console.error(`API Pairing Error for ${phone}:`, error);
        return res.status(500).json({ error: 'Failed to generate code. Please make sure the number is correct and try again!' });
    }
});

// Start the Express Server
app.listen(PORT, () => {
    console.log(`🌍 Multi-Bot Web Server running on port: ${PORT}`);
    preloadExistingSessions(); // Inawasha bot zote zilizounganishwa nyuma pindi server ikizimika na kuwaka
});
