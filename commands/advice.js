const { prepareWAMessageMedia } = require('@whiskeysockets/baileys');

// --- DATABASE YA USHAURI KULINGANA NA MAKUNDI (ENGLISH ONLY) ---
const ADVICE_DATABASE = {
    social: [
        "Your time is limited, so don't waste it living someone else's life.",
        "To judge a man by his weakest link or greatest failure is like judging the power of the ocean by one wave.",
        "Surround yourself with people who force you to level up."
    ],
    financial: [
        "Do not save what is left after spending, but spend what is left after saving.",
        "Beware of little expenses; a small leak will sink a great ship.",
        "An investment in knowledge pays the best interest."
    ],
    education: [
        "The beautiful thing about learning is that no one can take it away from you.",
        "Education is not the learning of facts, but the training of the mind to think.",
        "Procrastination is the thief of time. Start studying today, not tomorrow."
    ],
    political: [
        "Leadership is not about being in charge. It is about taking care of those in your charge.",
        "A nation that is afraid to let its people judge the truth and falsehood in an open market is a nation that is afraid of its people.",
        "If you want to change the world, change the way people think."
    ],
    funny: [
        "Always borrow money from a pessimist. They won't expect it back.",
        "If you think you are too small to make a difference, try sleeping with a mosquito.",
        "I’m not lazy, I’m just on energy-saving mode."
    ]
};

const DEFAULT_IMAGE = "https://files.catbox.moe/038kef.jpg";

module.exports = {
    name: "advice",
    alias: ["ushauri", "adv", "social_advice", "financial_wisdom", "education_node", "political_mind", "funny_humor"],
    description: "Get targeted category-based advice for yourself or tagged friends.",
    category: "fun",

    execute: async (sock, chatId, message, args, { pushname }) => {
        try {
            const msgStructure = message.message;
            const incomingText = (
                msgStructure?.conversation || 
                msgStructure?.extendedTextMessage?.text || 
                msgStructure?.buttonsResponseMessage?.selectedButtonId || 
                msgStructure?.templateButtonReplyMessage?.selectedId ||
                msgStructure?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson ||
                ""
            ).trim().toLowerCase();

            let categoryInput = args[0]?.toLowerCase();

            // Kutambua aina ya ushauri kulingana na maandishi yaliyotumwa au kubofya
            if (/social/i.test(incomingText)) categoryInput = 'social';
            else if (/financial|wisdom/i.test(incomingText)) categoryInput = 'financial';
            else if (/education|node/i.test(incomingText)) categoryInput = 'education';
            else if (/political|mind/i.test(incomingText)) categoryInput = 'political';
            else if (/funny|humor/i.test(incomingText)) categoryInput = 'funny';

            // --- 🟢 FIX: USALAMA WA HALI YA JUU KUKAMATA JID KUZUIA SPLIT ERROR ---
            let targetUser = null;
            
            if (msgStructure?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                targetUser = msgStructure.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (message.key?.participant) {
                targetUser = message.key.participant;
            } else if (message.sender) {
                targetUser = message.sender;
            } else {
                targetUser = chatId; // Kama yote yakifeli kabisa
            }

            // Hakikisha targetUser ni string kabla ya kuendelea
            if (typeof targetUser !== 'string') {
                targetUser = String(targetUser);
            }

            // ====================================================
            // SECTION 1: KUTUMA MENU YA MAKUNDI (KAMA HAJACHAGUA)
            // ====================================================
            if (!categoryInput || !ADVICE_DATABASE[categoryInput]) {
                await sock.sendMessage(chatId, { react: { text: '❓', key: message.key } });

                const menuText = `*💡 YASEEN-MD ADVICE ROUTER*\n\nHello *${pushname}*, please select the type of advice you want to give out:`;

                const { sendButtons } = require('gifted-btns');
                return await sendButtons(sock, chatId, {
                    title: '┏━━━〔 SELECT ADVICE SECTOR 〕━━━┓',
                    text: menuText,
                    footer: '© POWERED BY YASEEN-MD',
                    aimode: false,
                    buttons: [
                        { id: 'social_advice', text: '🤝 Social Advice' },
                        { id: 'financial_wisdom', text: '💰 Financial Wisdom' },
                        { id: 'education_node', text: '📚 Education Node' },
                        { id: 'political_mind', text: '🏛️ Political Mind' },
                        { id: 'funny_humor', text: '🎭 Funny/Humor' }
                    ]
                });
            }

            // ====================================================
            // SECTION 2: KUTUMA USHAURI ULIOCHAGULIWA
            // ====================================================
            await sock.sendMessage(chatId, { react: { text: '💡', key: message.key } });

            const selectedGroup = ADVICE_DATABASE[categoryInput];
            const randomAdvice = selectedGroup[Math.floor(Math.random() * selectedGroup.length)];

            // Sasa hivi .split() haitafeli kwa sababu targetUser ni string ya uhakika
            const mentionTag = `@${targetUser.split('@')[0]}`;
            const finalCaption = `*💡 ${categoryInput.toUpperCase()} ADVICE FOR ${mentionTag}*\n\n> "${randomAdvice}"\n\n_Sent via YASEEN-MD_`;

            return await sock.sendMessage(chatId, {
                image: { url: DEFAULT_IMAGE },
                caption: finalCaption,
                mentions: [targetUser]
            }, { quoted: message });

        } catch (error) {
            console.error("Advice Interactive Error:", error);
            return await sock.sendMessage(chatId, { text: `❌ *System Error:* ${error.message}` });
        }
    }
};
