const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
    name: 'countdown',
    alias: ['count', 'cd', 'down'],
    category: 'utility',
    desc: 'Counts down from a specified number to 0.',
    async execute(sock, chatId, msg, args, { prefix }) {
        // Check if the user provided a number
        if (!args[0]) {
            return sock.sendMessage(chatId, {
                text: `Usage: *${prefix}countdown [number]*\nExample: *${prefix}countdown 5*`
            }, { quoted: msg });
        }

        // Validate that the input is a valid positive number
        const startNumber = parseInt(args[0]);
        if (isNaN(startNumber) || startNumber <= 0) {
            return sock.sendMessage(chatId, {
                text: 'Please provide a valid positive number (e.g., 5, 10).'
            }, { quoted: msg });
        }

        if (startNumber > 60) {
            return sock.sendMessage(chatId, {
                text: 'Max countdown is 60 to avoid spam.'
            }, { quoted: msg });
        }

        await sock.sendMessage(chatId, {
            text: `Countdown started from *${startNumber}*...`
        }, { quoted: msg });

        // Loop to execute the countdown
        for (let i = startNumber; i >= 0; i--) {
            // Send the current countdown number
            if (i === 0) {
                await sock.sendMessage(chatId, { text: '🚀 *Time is up! (0)*' }, { quoted: msg });
            } else {
                await sock.sendMessage(chatId, { text: `⏱️ *${i}*` }, { quoted: msg });
            }

            // Wait for 1 second before the next message
            if (i > 0) await delay(1000);
        }
    }
};