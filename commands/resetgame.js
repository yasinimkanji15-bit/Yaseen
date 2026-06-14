module.exports = {
    name: "resetgame",
    alias: ["cleargame", "rgame", "stoptictactoe"],
    description: "Force stop any active games (Scramble, Guess, Tic-Tac-Toe) in the current chat.",
    category: "games",

    execute: async (sock, chatId, message, args, { isOwner }) => {
        // Check if any games are actually running
        const hasScramble = global.scrambleAnswer && global.scrambleAnswer[chatId];
        const hasGuess = global.guessGame && global.guessGame[chatId];
        const hasTTT = global.ttt && global.ttt[chatId];

        if (!hasScramble && !hasGuess && !hasTTT) {
            return await sock.sendMessage(chatId, { text: "❌ There are no active games to reset in this chat." }, { quoted: message });
        }

        // Reset the global variables for this specific chat
        if (hasScramble) delete global.scrambleAnswer[chatId];
        if (hasGuess) delete global.guessGame[chatId];
        if (hasTTT) delete global.ttt[chatId];

        await sock.sendMessage(chatId, { 
            text: "🧹 *GAME MEMORY CLEARED*\n\nAll active game sessions (Scramble, Guess, and Tic-Tac-Toe) have been terminated for this chat." 
        }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: '🧹', key: message.key } });
    }
};
