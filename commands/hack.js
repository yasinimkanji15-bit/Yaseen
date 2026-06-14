module.exports = {
    name: "hack",
    alias: ["penetrate", "breach"],
    description: "Initialize a simulated system breach with progress tracking.",
    category: "tools",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        let targetName = args.join(" ") || "External Node";

        // 🟢 1. REFRESHED TACTICAL MANUAL
        const manual = `💻 *YASEEN-ＭＤ ＨＡＣＫ ＮＯＤＥ BY IQBAL*
\`\`\`
  _   _    _    ____ _  __
 | | | |  / \\  / ___| |/ /
 | |_| | / _ \\| |   | ' / 
 |  _  |/ ___ \\ |___| . \\ 
 |_| |_/_/   \\_\\____|_|\\_\\
\`\`\`
> *“Progress is the only way forward.”*

✦═════════════════════✦
1️⃣ *Usage:* .hack <Target / 's'>
2️⃣ *Feature:* Dynamic Progress Bar [███░]
3️⃣ *Protocol:* Elite Data Siphon
✦═════════════════════✦

_© 2026 YASEEN Laporte • Operational_`;

        if (!args[0]) return await sock.sendMessage(from, { text: manual }, { quoted: message });

        if (targetName.toLowerCase() === 's') {
            targetName = from.split('@')[0];
        }

        // 🟢 2. PROGRESS BAR GENERATOR
        const createBar = (percent) => {
            const size = 10; // 10 blocks total
            const filled = Math.round(size * (percent / 100));
            const empty = size - filled;
            return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percent}%`;
        };

        const stages = [
            { txt: "🔍 *[SCAN]* Initializing network sweep...", p: 15 },
            { txt: "📡 *[PROXY]* Routing through Arusha Node...", p: 30 },
            { txt: "🔑 *[EXPLOIT]* Brute-forcing RSA-4096 keys...", p: 45 },
            { txt: "🔓 *[ACCESS]* Bypassing firewall security...", p: 60 },
            { txt: "📂 *[SCRAPE]* Siphoning encrypted database...", p: 80 },
            { txt: "📍 *[TRACK]* Geolocation fix acquired...", p: 95 },
            { txt: "💀 *[WIPE]* Purging system logs...", p: 100 }
        ];

        try {
            await sock.sendMessage(from, { react: { text: '💀', key: message.key } });

            // Send Initial Frame
            let { key } = await sock.sendMessage(from, { 
                text: `🚀 *YASEEN-ＭＤ ＥＸＰＬＯＩＴ ＳＴＡＲＴＥＤ...*\n> Target: *${targetName}*` 
            });

            // 🟢 3. ANIMATION LOOP WITH BAR
            for (let i = 0; i < stages.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                const frame = `💻 *YASEEN-ＭＤ ＴＥＲＭＩＮＡＬ*

> Target: ${targetName}
> Status: ${stages[i].txt}

📊 *Progress:* \`${createBar(stages[i].p)}\`

_System link established..._`;

                await sock.sendMessage(from, { text: frame, edit: key });
            }

            // Final Result
            await new Promise(resolve => setTimeout(resolve, 2000));
            await sock.sendMessage(from, { 
                text: `💀 *ＢＲＥＡＣＨ ＣＯＭＰＬＥＴＥ*\n\n> *Target:* ${targetName}\n> *Result:* FULL SYSTEM OVERTAKE\n\n_YAS-TECH Operation Finished._`,
                edit: key
            });

        } catch (err) {
            console.error(err);
        }
    }
};
