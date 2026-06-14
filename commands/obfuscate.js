const JavaScriptObfuscator = require('javascript-obfuscator');

module.exports = {
    name: "obfuscate",
    alias: ["obfu", "encrypt", "hacker"],
    description: "Encrypt and protect your JavaScript code.",
    category: "owner", // Set to owner to prevent spamming server resources

    execute: async (sock, chatId, message, args) => {
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0);
        const codeToObfuscate = args.join(" ");

        // 📜 --- MANUAL --- 📜
        if (!codeToObfuscate) {
            const manual = `✦═════════◆═════════✦
🛡️  *YASEEN  ＥＮＣＲＹＰＴ* 🛡️
✦═════════◆═════════✦

📖  *ＤＥＳＣＲＩＰＴＩＯＮ:*
Obfuscate your JS code to protect it from 'tricky' friends and code thieves.

🛰️  *ＵＳＡＧＥ:*
> *${prefix}obfuscate [your javascript code]*

💡  *ＡＩ  ＷＩＳＤＯＭ:*
> _"Secrets are only safe when they are unreadable."_

✦═════════◆═════════✦
_© 2026 YAS-TECH • Security Node_`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(chatId, { react: { text: '🛡️', key: message.key } });

            // 🛠️ OBFUSCATION SETTINGS
            const obfuscationResult = JavaScriptObfuscator.obfuscate(codeToObfuscate, {
                compact: true,
                controlFlowFlattening: true,
                controlFlowFlatteningThreshold: 0.1,
                numbersToExpressions: true,
                simplify: true,
                stringArrayShuffle: true,
                splitStrings: true,
                stringArrayThreshold: 0.1,
                unicodeEscapeSequence: true // Adds extra layer of protection
            });

            const result = obfuscationResult.getObfuscatedCode();

            const response = `✦═════════◆═════════✦
🔐  *ＣＯＤＥ  ＥＮＣＲＹＰＴＥＤ*
✦═════════◆═════════✦

\`\`\`javascript
${result}
\`\`\`

💡 *ＡＩ  ＷＩＳＤＯＭ:*
> _"Code is poetry, but some poems are meant to be encrypted."_

✦═════════◆═════════✦
_© 2026 YAS-TECH_`;

            await sock.sendMessage(chatId, { text: response }, { quoted: message });
            await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

        } catch (error) {
            console.error("OBFUSCATION ERROR:", error);
            return await sock.sendMessage(chatId, { 
                text: "⚠️ *Error:* Check your code syntax. It must be valid JavaScript." 
            }, { quoted: message });
        }
    }
};
