module.exports = {
    name: "ttt",
    alias: ["tictactoe", "dama"],
    description: "Play Tic-Tac-Toe against a friend.",
    category: "games",

    execute: async (sock, chatId, message, args, { pushname }) => {
        if (!global.ttt) global.ttt = {};

        // 🟢 MANUAL & START LOGIC
        if (!args[0]) {
            const manual = `✦═══════════════════════◆
🎮  *YASEEN  ＴＴＴ  ＮＯＤＥ*
✦═══════════════════════◆

🛰️  *ＯＰＥＲＡＴＩＯＮＡＬ  ＣＯＭＭＡＮＤＳ:*
> *.ttt @tag_friend* ➔ Challenge Subject
> *1 - 9* ➔ Occupy Sector

🛰️  *ＴＨＥ  ＧＲＩＤ:*
1️⃣ 2️⃣ 3️⃣
4️⃣ 5️⃣ 6️⃣
7️⃣ 8️⃣ 9️⃣

According to my creator YASEEN, the dossier is complete.
*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        // Check if a game is already running
        if (global.ttt[chatId]) {
            return await sock.sendMessage(chatId, { text: "❌ *ACCESS DENIED:* A simulation is already in progress in this sector!" }, { quoted: message });
        }

        // Get the opponent
        const opponent = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                         (args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net');

        if (!opponent || opponent === (message.key.participant || message.key.remoteJid)) {
            return await sock.sendMessage(chatId, { text: "❌ *ERROR:* You must designate a valid target to challenge!" });
        }

        // Initialize game state
        global.ttt[chatId] = {
            board: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
            playerX: message.key.participant || message.key.remoteJid,
            playerO: opponent,
            turn: "X", 
            status: "playing"
        };

        const boardView = renderBoard(global.ttt[chatId].board);
        await sock.sendMessage(chatId, { 
            text: `🛰️ *ＴＴＴ  ＳＴＡＲＴＥＤ* 🛰️\n\n❌: @${global.ttt[chatId].playerX.split('@')[0]}\n⭕: @${global.ttt[chatId].playerO.split('@')[0]}\n\n${boardView}\n\n*It's @${global.ttt[chatId].playerX.split('@')[0]}'s turn (X)*`,
            mentions: [global.ttt[chatId].playerX, global.ttt[chatId].playerO]
        }, { quoted: message });
    }
};

// --- 🛰️ THE EMOJI RENDERER ---
function renderBoard(b) {
    // Map of standard numbers to emoji numbers
    const numMap = {
        "1": "1️⃣", "2": "2️⃣", "3": "3️⃣",
        "4": "4️⃣", "5": "5️⃣", "6": "6️⃣",
        "7": "7️⃣", "8": "8️⃣", "9": "9️⃣"
    };

    const symbols = b.map(v => {
        if (v === "X") return "❌";
        if (v === "O") return "⭕";
        return numMap[v]; // Returns 1️⃣, 2️⃣, etc.
    });

    // Return the grid in a clean 3x3 emoji block
    return `${symbols[0]} ${symbols[1]} ${symbols[2]}\n` +
           `${symbols[3]} ${symbols[4]} ${symbols[5]}\n` +
           `${symbols[6]} ${symbols[7]} ${symbols[8]}`;
}
