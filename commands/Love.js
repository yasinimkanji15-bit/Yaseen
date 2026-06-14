module.exports = {
    name: "love",
    alias: ["compatibility", "lovecalc", "affinity"],
    description: "Calculate random-dynamic love compatibility via text, tags, or replies.",
    category: "fun",

    execute: async (sock, chatId, msg, args) => {
        const from = chatId;
        const text = args.join(" ");

        // Helper function to extract or clean up names from mentions/numbers
        const getName = (input, jid) => {
            if (!input && jid) {
                return '@' + jid.split('@')[0];
            }
            return input ? input.replace(/@[0-9]+/g, '').trim() : "Unknown Target";
        };

        let target1 = "";
        let target2 = "";

        // 1. RESOLVE TARGETS: Check for reply + text or mentions
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const participant = msg.message?.extendedTextMessage?.contextInfo?.participant;
        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        if (quotedMsg && participant) {
            // Case A: User replied to someone's message
            target1 = msg.pushName || "Sender";
            target2 = '@' + participant.split('@')[0];
        } else if (text.includes("&")) {
            // Case B: Explicit format with '&' (Can be names or @mentions)
            const parts = text.split("&");
            target1 = parts[0].trim();
            target2 = parts[1].trim();
        } else if (mentions.length >= 2) {
            // Case C: Just tagged two people
            target1 = '@' + mentions[0].split('@')[0];
            target2 = '@' + mentions[1].split('@')[0];
        }

        // Validate if we successfully captured two targets
        if (!target1 || !target2 || target1 === target2) {
            const usageText = `❌ *Error:* Invalid selection pattern!\n\n` +
                `📝 *Usage Layouts:* \n` +
                `⏩ *Text format:* love Sara & Yaseen\n` +
                `⏩ *Tag format:* love @user1 & @user2\n` +
                `⏩ *Reply format:* Reply to someone's message and just type \`love\``;
            return sock.sendMessage(from, { text: usageText }, { quoted: msg });
        }

        try {
            await sock.sendMessage(from, { react: { text: '❤️', key: msg.key } });

            // 2. Localized Percent Generator (changes based on current timestamp mix to keep it unique every run)
            const mixSeed = Math.floor(Math.random() * 100);
            const percentage = Math.floor(Math.random() * 89) + 12; // Generates 12% to 100%

            // 3. EXPANDED MATRIX ADVICE REPOSITORY (Dynamic Selection)
            let verdict = "";
            let adviceOptions = [];

            if (percentage >= 85) {
                verdict = "Absolute Soulmates / Eternal Bond 💖";
                adviceOptions = [
                    "Your configurations are matching flawlessly. Lock this network down and transition to a lifetime covenant immediately.",
                    "An exceptional connection. Do not let external signal noise or minor bugs corrupt this high-tier operational sync.",
                    "The algorithms have spoken. This is a rare, pure affinity bond. Maximize investment and protect each other at all costs.",
                    "A flawless energetic match. You both possess the ultimate cryptographic keys to each other's security cores."
                ];
            } else if (percentage >= 65 && percentage < 85) {
                verdict = "Strong Dynamic Connection ✨";
                adviceOptions = [
                    "Clear chemical affinity detected. Allocate more resources to your communication pipelines to prevent system crashes.",
                    "A high-performing connection. Keep upgrading your emotional storage and support each other during structural overloads.",
                    "Great compatibility signature. Keep holding down the line and this love will safely boot into premium status.",
                    "Solid infrastructure here. A few minor configuration checks and you two will run perfectly without any lag."
                ];
            } else if (percentage >= 40 && percentage < 65) {
                verdict = "Unstable Warning Zone ⚠️";
                adviceOptions = [
                    "The database detects moderate structural friction. If you want this grid to hold, you must fix the trust leaks.",
                    "Your transmission patterns are crossing channels. Re-align your goals before the firewall between you breaks completely.",
                    "Average alignment score. It requires dual manual configuration to make it efficient, or you're just stalling an update.",
                    "Friction identified. Double your compromises and wipe old operational grudges out of your cache memory right now."
                ];
            } else {
                verdict = "Critical System Failure / Toxic Grid 🚫";
                adviceOptions = [
                    "Highly incompatible matrix. The core infrastructure is collapsing. Break up immediately, save your energy, and abort the mission.",
                    "Massive firewall conflict. Running this setup longer will corrupt your entire system storage. Wipe the cache and separate.",
                    "Total misalignment of interests. Do not force an invalid script into your lives—unpair immediately and clear the terminal.",
                    "Dangerous exposure to heavy emotional malware. Sever this connection link instantly before you completely crash your life."
                ];
            }

            // Pick one random advice string from the matching array tier
            const finalAdvice = adviceOptions[Math.floor(Math.random() * adviceOptions.length)];

            // 4. Output Render
            const loveMessage = `❤️ *YASEEN-MD LOVE CALCULATOR* ❤️\n\n` +
                `👤 *Partner 1:* ${target1}\n` +
                `👤 *Partner 2:* ${target2}\n\n` +
                `📊 *Compatibility:* ${percentage}%\n` +
                `📌 *Verdict:* ${verdict}\n` +
                `📢 *System Advice:* ${finalAdvice}\n\n` +
                `_Engine Status: Dynamic Cloud Generated • 2026_`;

            // Setup mentions array so tagged people get notified properly
            const cleanMentions = [];
            if (participant) cleanMentions.push(participant);
            mentions.forEach(m => cleanMentions.push(m));

            await sock.sendMessage(from, { text: loveMessage, mentions: cleanMentions }, { quoted: msg });
            await sock.sendMessage(from, { react: { text: percentage >= 65 ? '💖' : '💔', key: msg.key } });

        } catch (error) {
            console.error("Advanced Love Engine Error:", error.message);
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
            return sock.sendMessage(from, { text: "❌ *Engine Error:* Failed to map out the compatibility algorithm." }, { quoted: msg });
        }
    }
};