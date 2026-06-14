const jsBeautify = require('js-beautify').js;

module.exports = {
    name: "deobfuscate",
    alias: ["unobfu", "decode", "unhex"],
    description: "Reveal the hidden strings and logic in encrypted JS code.",
    category: "owner",

    execute: async (sock, chatId, message, args) => {
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0);
        const codeToDecode = args.join(" ");

        // 📜 --- MANUAL --- 📜
        if (!codeToDecode) {
            const manual = `✦═════════◆═════════✦
🔓  *YASEEN  ＤＥＣＯＤＥ* 🔓
✦═════════◆═════════✦

📖  *ＤＥＳＣＲＩＰＴＩＯＮ:*
Uncover the real code behind hex-encryption and messy obfuscation.

🛰️  *ＵＳＡＧＥ:*
> *${prefix}deobfuscate [encrypted code]*

💡  *ＡＩ  ＷＩＳＤＯＭ:*
> _"Truth is the only thing that cannot be hidden forever."_

✦═════════◆═════════✦
_© 2026 YAS-TECH • Intelligence Node_`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(chatId, { react: { text: '🔍', key: message.key } });

            // 🛠️ STEP 1: Un-Hexing logic (Regex to find \x00 style strings)
            let decoded = codeToDecode.replace(/\\x([0-9A-Fa-f]{2})/g, (match, hex) => {
                return String.fromCharCode(parseInt(hex, 16));
            });

            // 🛠️ STEP 2: Beautify the structure
            const finalCode = jsBeautify(decoded, { 
                indent_size: 2, 
                space_in_empty_paren: true 
            });

            const response = `✦═════════◆═════════✦
🔓  *ＣＯＤＥ  ＵＮＣＯＶＥＲＥＤ*
✦═════════◆═════════✦

\`\`\`javascript
${finalCode}
\`\`\`

💡 *ＡＩ  ＷＩＳＤＯＭ:*
> _"To defeat a trick, you must first understand the trick."_

✦═════════◆═════════✦
_© 2026 YAS-TECH_`;

            await sock.sendMessage(chatId, { text: response }, { quoted: message });
            await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

        } catch (error) {
            console.error("DE-OBFUSCATE ERROR:", error);
            return await sock.sendMessage(chatId, { 
                text: "⚠️ *Error:* This code is too heavily protected or uses a different encryption method." 
            }, { quoted: message });
        }
    }
};
