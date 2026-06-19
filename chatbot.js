const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, './database/chatbotConfig.json');

// Kazi ya kuhakikisha database directory ipo
if (!fs.existsSync(path.dirname(CONFIG_PATH))) {
    fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
}

// Kupakia settings na kumbukumbu za majina
function loadConfig() {
    if (!fs.existsSync(CONFIG_PATH)) {
        return { globalDm: true, globalGc: true, activeChats: {}, memory: {} };
    }
    try {
        const data = JSON.parse(fs.readFileSync(CONFIG_PATH));
        // Kuhakikisha miundo mipya ipo
        if (!data.activeChats) data.activeChats = {};
        if (!data.memory) data.memory = {};
        return data;
    } catch (e) {
        return { globalDm: true, globalGc: true, activeChats: {}, memory: {} };
    }
}

function saveConfig(config) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function getRandomEmoji(emojiArray) {
    return emojiArray[Math.floor(Math.random() * emojiArray.length)];
}

module.exports = {
    handle: async (sock, chatId, msg, messageBody) => {
        try {
            let body = messageBody?.trim();
            if (!body || msg.key.fromMe) return;

            chatId = msg.key.remoteJid;
            body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
            
            // --- USOMAJI WA CHAT ZA JUU (QUOTED MESSAGE) ---
            const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const quotedText = quotedMessage?.conversation || quotedMessage?.extendedTextMessage?.text || "";

            // Load settings from settings.js
            const settings = require('./settings');
            const prefix = settings.PREFIX || ".";
            const isCmd = body.startsWith(prefix);

            // --- 🤖 SMART CHATBOT LOGIC ---
            const isGroup = chatId.endsWith('@g.us');
            
            // Get chatbot config from settings.js
            const aiEnabled = isGroup ? settings.CHATBOT_GC : settings.CHATBOT_DM;

            // 1. Pata jina la mtumiaji kutoka WhatsApp (Username)
            const pushName = msg.pushName || "friend"; 
            const senderId = msg.key.remoteJid;
            
            let savedContactName = "";
            if (global.store && global.store.contacts && global.store.contacts[senderId]) {
                savedContactName = global.store.contacts[senderId].name || global.store.contacts[senderId].verifiedName || "";
            }
            
            // Final resolved name prioritizing your saved contact name, falling back to WhatsApp username
            const finalResolvedName = savedContactName || pushName;
            
            const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const isMentioned = mentionedJid.includes(botNumber);

            if (aiEnabled && body && !msg.key.fromMe && !isCmd) {
                if (isGroup && !isMentioned) return;

                await sock.sendPresenceUpdate('composing', chatId); 
                
                try {
                    const smartPrompt = `
                    [SYSTEM CONFIGURATION: HIGH CONTEXT AWARENESS]
                    - Identity: Your name is Yaseen, live in Arusha,Tanzania a regular human chatting casually on WhatsApp.
                    
                    STRICT RULES (SHERIA KALI):
                    1. QUOTED MESSAGE CONTEXT: If the user is replying to a specific message from the past, look at the "Quoted Text" provided below. Use it to understand exactly what they mean by their current message. Do NOT reset the conversation or reply with generic greetings like "Mambo vipi" if they are replying to a previous statement.
                    2. LANGUAGE MIRRORING: Strictly match the language used by the user. If they reply in English (e.g., "Hello there"), respond ONLY in English. If they reply in Swahili/Sheng, respond ONLY in Swahili/Sheng. Do NOT mix English and Swahili greetings in one sentence.
                    3. NO REAL-TIME REPETITION: Do not compulsively greet the user or repeat words like "mambo vipi", "niaje", or "poa" if the greeting phase is already passed. Respond directly to the topic.
                    4. HUMANOID FLOW: Keep responses very brief (1-5 words), natural, and direct. Do not sound too eager, polite, or formal. No emojis unless absolutely necessary.
                    5. USER IDENTITY LOOKUP: The person you are talking to is identified as "${finalResolvedName}". Only mention or use their name if they explicitly ask you something like "What is my name?", "Do you know me?", or "Who am I?". Do NOT naturally include their name in normal greetings or casual responses.

                    [CONVERSATION DATA]
                    ${quotedText ? `- Quoted Text (The chat from above they are replying to): "${quotedText}"` : ''}
                    - Current User Message: "${body}"`;

                    const { data } = await axios.get(`https://apis.prexzyvilla.site/ai/ch?q=${encodeURIComponent(smartPrompt)}`);
                    let result = data.result || data.response;
                    
                    if (result) {
                        result = result.replace(/^(yaseen|ai|assistant|bot):\s*/i, '');
                        
                        const randomDelay = Math.floor(Math.random() * (3000 - 1500 + 1)) + 1500;
                        setTimeout(async () => {
                            await sock.sendMessage(chatId, { text: result }, { quoted: msg });
                        }, randomDelay);
                    }
                } catch (err) {
                    console.error("Chatbot Core Error:", err.message);
                }
            }
        } catch (error) {
            console.error("Main Handle Error:", error.message);
        }
    }
};