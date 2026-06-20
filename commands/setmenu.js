const fs = require('fs');
const path = require('path');
const { sendButtons } = require('gifted-btns'); // Tumeingiza library ya buttons hapa

const STYLE_PATH = path.join(__dirname, '../data/menuStyle.json');

module.exports = {
    name: "setmenu",
    alias: ["menustyle", "changemenu","stm"],
    description: "Change the layout style of the bot menu.",
    category: "owner",

    execute: async (sock, chatId, msg, args, { isOwner }) => {
        // Ensure only the bot owner can change the layout
        if (!isOwner) return await sock.sendMessage(chatId, { text: "❌ *Error:* Owner Only command." });

        const styleChoice = args[0];

        // Validating choices from Style 1 to Style 6
        if (!styleChoice || !['1', '2', '3', '4', '5', '6'].includes(styleChoice)) {
            const listCaption = `⚙️ *Available Layout Engines:* \n\n` +
                `› *1* ➜ Madrin Box Style\n` +
                `› *2* ➜ Cyber Tactical Panel\n` +
                `› *3* ➜ Minimalist Wave\n` +
                `› *4* ➜ Tokyo Neon Slate\n` +
                `› *5* ➜ Yas-Bot Tree View\n` +
                `› *6* ➜ Advanced Specs Grid\n\n` +
                `*💡 Tip:* You can also type \`.setmenu 5\` directly.`;

            // Tuma menu ya staili kwa kutumia mfumo wa buttons
            await sendButtons(sock, chatId, {
                title: '┏━━━〔 YASEEN-MD MENU STYLES 〕━━━┓',            
                text: listCaption,    
                footer: '© POWERED BY YASEEN-MD',            
                aimode: false,                     
                buttons: [
                    { id: '.setmenu 1', text: '📦 Madrin Box (1)' },       
                    { id: '.setmenu 2', text: '⚡ Cyber Panel (2)' },
                    { id: '.setmenu 5', text: '🌲 Yas Tree View (5)' }
                ]
            });
            return;
        }

        try {
            // Ensure data directory exists
            if (!fs.existsSync(path.join(__dirname, '../data'))) {
                fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
            }

            // Save the selected style inside the JSON configuration file
            const config = { currentStyle: styleChoice };
            fs.writeFileSync(STYLE_PATH, JSON.stringify(config, null, 2));

            // Send success dynamic reaction
            await sock.sendMessage(chatId, { react: { text: '✨', key: msg.key } });

            // Map names for the display caption
            const styleNames = {
                "1": "Madrin Box Style",
                "2": "Cyber Tactical Panel",
                "3": "Minimalist Wave",
                "4": "Tokyo Neon Slate",
                "5": "Yas-Bot Tree View",
                "6": "Advanced Specs Grid"
            };

            const successCaption = `┏━━━〔 *LAYOUT CONFIG COMPLETED* 〕━━━┓\n┃\n` +
                `┃ ✅ *Status:* Active & Injected\n` +
                `┃ ⚙️ *Active Engine:* Style ${styleChoice}\n` +
                `┃ 🎭 *Layout Name:* ${styleNames[styleChoice]}\n┃\n` +
                `┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                `_Type \`.menu\` to initialize the new system display._\n\n` +
                `*© POWERED BY YASEEN-MD*`;

            return await sock.sendMessage(chatId, { text: successCaption }, { quoted: msg });

        } catch (error) {
            console.error("Setmenu System Error:", error.message);
            return await sock.sendMessage(chatId, { text: "❌ *System Error:* Failed to write the style matrix configuration to database." }, { quoted: msg });
        }
    }
};
