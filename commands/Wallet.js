const fs = require('fs');
const path = require('path');

// File path to store user fake wallet data
const WALLET_DATA = path.join(__dirname, '../data/walletPrank.json');
const MIN_WITHDRAW_LIMIT = 1500000; // Minimum allowed to cash out (TSh 1,500,000)

// Function to format numbers with commas (e.g., 1,500,000)
function formatMoney(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = {
    name: "wallet",
    alias: ["money", "balance", "withdraw", "cashout"],
    description: "Check your digital wallet balance and simulate a cashout operation.",
    category: "games",

    execute: async (sock, chatId, msg, args) => {
        const from = chatId;
        const sender = msg.key.participant || msg.key.remoteJid;
        const senderName = msg.pushName || "User";

        // Ensure data directory exists
        if (!fs.existsSync(path.join(__dirname, '../data'))) {
            fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
        }

        // Read existing database
        let walletDB = {};
        if (fs.existsSync(WALLET_DATA)) {
            try {
                walletDB = JSON.parse(fs.readFileSync(WALLET_DATA));
            } catch (e) {
                walletDB = {};
            }
        }

        // If new user, assign a random starter balance
        if (!walletDB[sender]) {
            walletDB[sender] = {
                balance: Math.floor(Math.random() * (250000 - 100000 + 1)) + 100000, // Starts between 100k and 250k
                clicks: 0
            };
        }

        let userWallet = walletDB[sender];
        const action = args[0]?.toLowerCase();

        // ====================================================
        // MATUMIZI YA CASHOUT (.wallet cashout [amount])
        // ====================================================
        if (action === 'cashout' || action === 'withdraw' || action === 'toa') {
            const requestedAmountRaw = args[1]?.replace(/,/g, ''); // Inatoa koma kama mtu ameweka (mfano: 2,000,000)
            const requestedAmount = parseInt(requestedAmountRaw);

            // 1. Kama hajaandika kiasi kabisa mbele ya neno cashout
            if (!requestedAmount || isNaN(requestedAmount)) {
                return sock.sendMessage(from, { 
                    text: `⚠️ *CASH OUT ERROR*\n\nPlease specify the amount you want to withdraw.\n\n*Example:* \`.wallet cashout 1600000\`` 
                }, { quoted: msg });
            }

            // 2. Kagua kama kiasi alichokiomba ni chini ya 1,500,000
            if (requestedAmount < MIN_WITHDRAW_LIMIT) {
                const limitCaption = `┏━━━〔 *CASH OUT DENIED* 〕━━━┓\n┃\n` +
                    `┃ ❌ *Transaction Rule Violation!*\n` +
                    `┃\n` +
                    `┃ 👤 *Account:* ${senderName}\n` +
                    `┃ 💳 *Requested:* TSh ${formatMoney(requestedAmount)}\n` +
                    `┃ 🛑 *Minimum Allowed:* TSh ${formatMoney(MIN_WITHDRAW_LIMIT)}\n` +
                    `┃\n` +
                    `┃ _You can only cash out an amount_\n` +
                    `┃ _greater than TSh ${formatMoney(MIN_WITHDRAW_LIMIT)}!_\n` +
                    `┃\n` +
                    `┗━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                    `*© POWERED BY YASEEN-MD*`;
                return sock.sendMessage(from, { text: limitCaption }, { quoted: msg });
            }

            // 3. Kagua kama salio lake la sasa (Wallet Balance) limefika kiasi anachotaka kutoa au limefika 1.5M
            if (userWallet.balance < MIN_WITHDRAW_LIMIT || userWallet.balance < requestedAmount) {
                // BALANCE STATEMENT / INFO OF BALANCE SYSTEM
                const statementCaption = `┏━━━〔 *BALANCE STATEMENT* 〕━━━┓\n┃\n` +
                    `┃ ❌ *Insufficient Verification Funds!*\n` +
                    `┃\n` +
                    `┃ 👤 *Account Holder:* ${senderName}\n` +
                    `┃ 💰 *Available Balance:* TSh ${formatMoney(userWallet.balance)}\n` +
                    `┃ 💳 *Attempted Cashout:* TSh ${formatMoney(requestedAmount)}\n` +
                    `┃ 🔒 *Required Threshold:* TSh ${formatMoney(MIN_WITHDRAW_LIMIT)}\n` +
                    `┃ 📊 *Status:* Locked (Below Target)\n` +
                    `┃\n` +
                    `┃ _You need a total balance of at least_\n` +
                    `┃ _TSh ${formatMoney(MIN_WITHDRAW_LIMIT)} to enable server release._\n` +
                    `┃\n` +
                    `┗━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                    `*© POWERED BY YASEEN-MD*`;
                return sock.sendMessage(from, { text: statementCaption }, { quoted: msg });
            }

            // 4. UKITIMIZA VYOTE - THE ULTIMATE PRANK BURST!
            const prankCaption = `┏━━━〔 *⚡ TRANSACTION SUCCESS ⚡* 〕━━━┓\n┃\n` +
                `┃ 🎉 *Congratulations ${senderName}!*\n` +
                `┃ Your cashout request of *TSh ${formatMoney(requestedAmount)}* \n` +
                `┃ has been routed to the local banking network.\n` +
                `┃\n` +
                `┃ ⚠️ *FINAL VERIFICATION STEP REQUIRED:* \n` +
                `┃ In order for the funds to hit your mobile wallet,\n` +
                `┃ please go drink a glass of water, stand up, and say:\n` +
                `┃ *"I am a good kid, I just got fooled by Yaseen's bot."*\n` +
                `┃\n` +
                `┃ 😂🏃‍♂️ *Gotcha! You've been Pranked!* There is no money here,\n` +
                `┃ this is just a fun simulation game. Got your hopes up, huh?!\n` +
                `┃\n` +
                `┗━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                `*© YASEEN-MD • THE JOKE IS ON YOU!*`;
            
            // Reset account balance so they start over
            userWallet.balance = 115000;
            fs.writeFileSync(WALLET_DATA, JSON.stringify(walletDB, null, 2));

            return sock.sendMessage(from, { text: prankCaption }, { quoted: msg });
        }

        // ====================================================
        // MATUMIZI YA KAWAIDA (.wallet ya kawaida)
        // ====================================================
        const bonus = Math.floor(Math.random() * (120000 - 45000 + 1)) + 45000; 
        userWallet.balance += bonus;
        userWallet.clicks += 1;

        // Save data back to JSON
        fs.writeFileSync(WALLET_DATA, JSON.stringify(walletDB, null, 2));

        // Money emoji reaction
        await sock.sendMessage(from, { react: { text: '💸', key: msg.key } });

        // Standard Wallet Info Frame
        const caption = `┏━━━〔 *YAS-TECH DIGITAL WALLET* 〕━━━┓\n┃\n` +
            `┃ 👤 *Account Holder:* ${senderName}\n` +
            `┃ 💳 *Wallet Status:* Active (Verified)\n` +
            `┃\n` +
            `┃ 💰 *Current Balance:* TSh ${formatMoney(userWallet.balance)}\n` +
            `┃ 📈 *Last Transaction:* +TSh ${formatMoney(bonus)} (Bonus Node)\n` +
            `┃\n` +
            `┃ 📝 *How to Cash Out:* \n` +
            `┃ _To withdraw your funds, you must type:_\n` +
            `┃ *.wallet cashout [amount]*\n` +
            `┃\n` +
            `┗━━━━━━━━━━━━━━━━━━━━┛\n\n` +
            `*© POWERED BY YASEEN-MD*`;

        await sock.sendMessage(from, { text: caption }, { quoted: msg });
    }
};