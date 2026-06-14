const fs = require('fs');
const isAdmin = require('../lib/isAdmin');
const vkPath = './database/votekick.json';

module.exports = {
    name: "votekick",
    alias: ["vk"],
    execute: async (sock, chatId, m, args) => {
        const senderId = m.key.participant || m.key.remoteJid;
        try {
            const { isBotAdmin } = await isAdmin(sock, chatId, senderId);
            if (!isBotAdmin) return sock.sendMessage(chatId, { text: "❌ I need to be admin!" });

            let target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;
            if (!target) return sock.sendMessage(chatId, { text: "❌ Tag the person!" });

            const pollMsg = await sock.sendMessage(chatId, {
                poll: {
                    name: `Vote Kick: @${target.split('@')[0]}?`,
                    values: ["✅ Yes, kick them", "❌ No, keep them"],
                    selectableCount: 1
                }
            });

            // Tunahifadhi kura kwa 0 mwanzoni
            let vkData = JSON.parse(fs.readFileSync(vkPath));
            vkData[pollMsg.key.id] = { 
                target: target, 
                yes: 0, 
                no: 0, 
                chatId: chatId,
                endTime: Date.now() + 60000 // Sekunde 60
            };
            fs.writeFileSync(vkPath, JSON.stringify(vkData, null, 2));

            await sock.sendMessage(chatId, { 
                text: `⚠️ *VOTE STARTED!*\n\n👤 *Target:* @${target.split('@')[0]}\n⏱️ *Time:* 60 Seconds\n\n_Decision will be made when time is up!_`, 
                mentions: [target] 
            });

            // --- HII NDIO TIMER ---
            setTimeout(async () => {
                let currentData = JSON.parse(fs.readFileSync(vkPath));
                if (currentData[pollMsg.key.id]) {
                    const result = currentData[pollMsg.key.id];
                    
                    if (result.yes > result.no) {
                        await sock.groupParticipantsUpdate(chatId, [result.target], "remove");
                        await sock.sendMessage(chatId, { text: `✅ *Vote Passed!*\n\nResults: Yes (${result.yes}), No (${result.no}).\n@${result.target.split('@')[0]} has been kicked.`, mentions: [result.target] });
                    } else {
                        await sock.sendMessage(chatId, { text: `❌ *Vote Failed!*\n\nResults: Yes (${result.yes}), No (${result.no}).\nUser will stay.` });
                    }
                    
                    delete currentData[pollMsg.key.id];
                    fs.writeFileSync(vkPath, JSON.stringify(currentData, null, 2));
                }
            }, 60000); // 60,000ms = 1 Minute

        } catch (e) { console.error(e); }
    }
};
