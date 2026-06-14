const fs = require('fs');
const path = require('path');

const STYLE_PATH = path.join(__dirname, '../data/menuStyle.json');

module.exports = {
    name: "setprefix",
    alias: ["prefix", "changeprefix","stp"],
    description: "Change or remove the bot global command execution prefix.",
    category: "owner",

    execute: async (sock, chatId, msg, args, { isOwner }) => {
        // 1. Only the bot owner is allowed to alter the configuration matrix
        if (!isOwner) return await sock.sendMessage(chatId, { text: "❌ *Error:* Owner Only command." });

        let inputPrefix = args.join(" ");

        // 2. If no arguments are provided, display the premium configuration options dashboard
        if (!inputPrefix) {
            const optionsMenu = `┏━━━〔 *YASEEN-MD PREFIX INTERFACE* 〕━━━┓\n┃\n` +
                `┃ ⚙️ *Available Configuration Options:* \n┃\n` +
                `┃  › *.setprefix null* ➜ Active No Prefix System\n` +
                `┃  › *.setprefix @* ➜ Set default period prefix\n` +
                `┃  › *.setprefix !* ➜ Set exclamation symbol\n` +
                `┃  › *.setprefix #* ➜ Set hash character terminal\n┃\n` +
                `┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                `*💡 Note:* Typing \`.setprefix null\` allows commands to run directly without symbols.\n` +
                `*© POWERED BY YASEEN-MD*`;
            
            return await sock.sendMessage(chatId, { text: optionsMenu }, { quoted: msg });
        }

        // 3. Process the prefix choice (Handle 'null' selection explicitly)
        let finalPrefix = inputPrefix;
        if (inputPrefix.toLowerCase() === 'null') {
            finalPrefix = "";
        }

        try {
            // Ensure data directory exists inside the project tree
            if (!fs.existsSync(path.join(__dirname, '../data'))) {
                fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
            }

            // Load existing configuration or create a new database layout
            let config = {};
            if (fs.existsSync(STYLE_PATH)) {
                try {
                    config = JSON.parse(fs.readFileSync(STYLE_PATH));
                } catch (e) { config = {}; }
            }

            // Update the prefix parameter inside the database structure
            config.prefix = finalPrefix;
            fs.writeFileSync(STYLE_PATH, JSON.stringify(config, null, 2));

            // Inject the configuration dynamically into global memory for immediate main.js sync
            if (!global.botConfig) global.botConfig = {};
            global.botConfig.prefix = finalPrefix;

            // Trigger success dynamic reaction
            await sock.sendMessage(chatId, { react: { text: '⚡', key: msg.key } });

            const displayPrefix = finalPrefix === "" ? "None (No Prefix Mode)" : `[ ${finalPrefix} ]`;
            
            const successCaption = `┏━━━〔 *PREFIX MATRIX ALIGNED* 〕━━━┓\n┃\n` +
                `┃ ✅ *Status:* Database Injected Successfully\n` +
                `┃ ⚙️ *Active Prefix:* ${displayPrefix}\n` +
                `┃ 🧠 *Engine System:* ${finalPrefix === "" ? "Direct Command Run" : "Forced Symbol Mode"}\n┃\n` +
                `┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                `_Type \`.menu\` (or \`menu\` if null) to initialize verification._\n\n` +
                `*© POWERED BY YASEEN-MD*`;

            return await sock.sendMessage(chatId, { text: successCaption }, { quoted: msg });

        } catch (error) {
            console.error("Setprefix System Error:", error.message);
            return await sock.sendMessage(chatId, { text: "❌ *System Error:* Failed to commit new prefix signature to JSON storage." }, { quoted: msg });
        }
    }
};