module.exports = {
    name: "guess",
    alias: ["namba"],
    description: "Guess the secret number.",
    category: "games",

    execute: async (sock, chatId, message, args) => {
        if (!global.guessGame) global.guessGame = {};

        // MANUAL
        if (!args[0]) {
            const manual = `🔢 *Guess the Number Manual*

I am thinking of a secret number between 1 and 50. Can you find it?

✦═════════◆═════════✦

*How to Play:*
\`.guess start\`
> • _Action:_ Generates a new secret number.

*How to Win:*
Type your guess in the chat. I will tell you if the secret is *Higher* or *Lower*.

✦═════════◆═════════✦

«.guess start»`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        if (args[0] === 'start') {
            global.guessGame[chatId] = Math.floor(Math.random() * 50) + 1;
            return await sock.sendMessage(chatId, { text: "🔢 *New Game Started!*\nI'm thinking of a number between 1-50. Type your guess!" }, { quoted: message });
        }
    }
};
