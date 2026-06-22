const fs = require('fs');
const path = require('path');
const axios = require('axios'); 
const settings = require('./settings');
const commands = new Map();
const aliases = new Map();


// --- 🟡 RUNTIME CONFIG & GLOBAL STATES ---
if (!global.botConfig) {
    global.botConfig = {
        prefix: settings.PREFIX || ".",
        isPublic: false,           
        antiDelete: true,          
        antiDeletePath: "group",    
        repeatCount: 1,            
        autoRead: false,
        alwaysOnline: true,
        autoRecording: { 
            dm: false, 
            gc: false 
        },
        autoTyping: { 
            dm: false, 
            gc: false 
        },
        autoReactGC: false,        
        autoReactDM: false,       
        reactEmojis: ["🤡", "😎", "😅"] 
    };
}




// --- 🔵 ALWAYS-ONLINE HEARTBEAT ---
setInterval(async () => {
    if (global.botConfig.alwaysOnline && global.sock) {
        await global.sock.sendPresenceUpdate('available');
    }
}, 15000);

// --- ANTI-DELETE MEMORY CACHE ---
if (!global.msgStore) global.msgStore = new Map();

// --- 1🔵. COMMAND LOADER ---
const loadCommands = () => {
    const dir = path.join(__dirname, 'commands');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    const commandFiles = fs.readdirSync(dir).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        try {
            delete require.cache[require.resolve(path.join(dir, file))];
            const module = require(path.join(dir, file));
            if (module.name) {
                commands.set(module.name.toLowerCase(), module);              
                if (module.alias && Array.isArray(module.alias)) {
                    module.alias.forEach(a => aliases.set(a.toLowerCase(), module.name.toLowerCase()));
                }
            }
        } catch (e) {
            console.error(`❌ Error loading ${file}:`, e.message);
        }
    }
    console.log(`✅ YAS-TECH: Loaded ${commands.size} commands`);
};

loadCommands();

// ---🔵 HELPER FOR TIC-TAC-TOE ---
function renderBoard(b) {
    // Map numbers to their blue emoji square counterparts
    const numMap = {
        "1": "1️⃣", "2": "2️⃣", "3": "3️⃣",
        "4": "4️⃣", "5": "5️⃣", "6": "6️⃣",
        "7": "7️⃣", "8": "8️⃣", "9": "9️⃣"
    };

    const symbols = b.map(v => {
        if (v === "X") return "❌";
        if (v === "O") return "⭕";
        return numMap[v] || v; // Returns emoji if number, else original
    });

    // Returns a clean 3x3 emoji grid without ASCII lines
    return `${symbols[0]} ${symbols[1]} ${symbols[2]}\n` +
           `${symbols[3]} ${symbols[4]} ${symbols[5]}\n` +
           `${symbols[6]} ${symbols[7]} ${symbols[8]}`;
}


// --- 2. MESSAGE HANDLER ---
const handleMessages = async (sock, m) => {
    global.sock = sock;

    try {
        const msg = m.messages[0];
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const senderNumber = sender.replace(/[^0-9]/g, ''); 
        const ownerNumber = settings.OWNER_NUMBER.replace(/[^0-9]/g, '');
        const isOwner = msg.key.fromMe || senderNumber === ownerNumber;
        const ownerJid = ownerNumber + '@s.whatsapp.net';

             

        const body = msg.message?.conversation || 
                     msg.message?.extendedTextMessage?.text || 
                     msg.message?.imageMessage?.caption || "";
        const textLower = body.trim().toLowerCase();

            
                
            // --- 🔵 AUTO FEATURES ---
const isGroup = chatId.endsWith('@g.us');
const isDm = chatId.endsWith('@s.whatsapp.net');
const isStatus = chatId === 'status@broadcast';

// 1. Auto Read
if (global.botConfig.autoRead) await sock.readMessages([msg.key]);

// 2. ⌨️ Auto-Typing (Split Logic)
if (global.botConfig.autoTyping) {
    const shouldType = isGroup 
        ? global.botConfig.autoTyping.gc 
        : global.botConfig.autoTyping.dm;

    if (shouldType && !isStatus) {
        await sock.sendPresenceUpdate('composing', chatId);
    }
}

// 3. 🎙️ Auto-Recording (Split Logic)
if (global.botConfig.autoRecording) {
    const shouldRecord = isGroup 
        ? global.botConfig.autoRecording.gc 
        : global.botConfig.autoRecording.dm;

    if (shouldRecord && !isStatus) {
        await sock.sendPresenceUpdate('recording', chatId);
    }
}

// 4. 🎭 ENHANCED AUTO-REACT ENGINE
const shouldReact = isGroup 
    ? global.botConfig.autoReactGC 
    : global.botConfig.autoReactDM;

if (shouldReact && !msg.key.fromMe && !isStatus) {
    const emojis = global.botConfig.reactEmojis || ["😅"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    await sock.sendMessage(chatId, { 
        react: { text: randomEmoji, key: msg.key } 
    });
}

// 🔵--- 📊 GROUP ACTIVITY TRACKER ---
if (isGroup) {
    const statsPath = path.join(__dirname, 'database/group_stats.json');
    if (!fs.existsSync(path.join(__dirname, 'database'))) fs.mkdirSync(path.join(__dirname, 'database'));
    
    let stats = {};
    if (fs.existsSync(statsPath)) {
        stats = JSON.parse(fs.readFileSync(statsPath));
    }

    if (!stats[chatId]) stats[chatId] = {};
  if (!stats[chatId][sender]) {
        stats[chatId][sender] = { 
            msgCount: 0, 
            name: msg.pushName || "user" 
        };
    }

    // Huu mstari unaongeza hesabu ya meseji kwa kila mtu (ikiwemo wewe)
    stats[chatId][sender].msgCount += 1;
    stats[chatId][sender].name = msg.pushName || "user";

    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
}


        // --- 🔵 ANTI-BADWORD (ADMIN AWARE) ---
        const badPath = path.join(__dirname, 'database/badwords.json');
        if (fs.existsSync(badPath) && !isOwner && chatId.endsWith('@g.us')) {
            const bConf = JSON.parse(fs.readFileSync(badPath));
            if (bConf.active && bConf.words.length > 0) {
                const triggeredWord = bConf.words.find(word => textLower.includes(word.trim().toLowerCase()));
                if (triggeredWord) {
                    const groupMetadata = await sock.groupMetadata(chatId);
                    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                    const botData = groupMetadata.participants.find(p => p.id === botId);
                    const isBotAdmin = botData?.admin || false;

                    if (isBotAdmin) await sock.sendMessage(chatId, { delete: msg.key });

                    const warnMsg = `⚠️ *［ YASEEN-ＭＤ ＳＥＣＵＲＩＴＹ ］*\n\n` +
                                   `> *User:* @${senderNumber}\n` +
                                   `> *Violated Term:* 「 ${triggeredWord.toUpperCase()} 」\n\n` +
                                   `_Maintain respect in the group. Suggested by thunder and developed by YASEEN Node._`;
                    return await sock.sendMessage(chatId, { text: warnMsg, mentions: [sender] });
                }
            }
        }

                         
        // --- 🔵 AUTO RESPONDER ---
        if (!global.respondMemory) global.respondMemory = new Set();
        const respPath = path.join(__dirname, 'database/respond_config.json');
        if (fs.existsSync(respPath) && !isOwner && !chatId.includes('@g.us')) {
            const rConf = JSON.parse(fs.readFileSync(respPath));
            if (rConf.active && !global.respondMemory.has(sender)) {
                await sock.sendMessage(chatId, { text: rConf.msg });
                global.respondMemory.add(sender);
            }
        }



       // --- 🔵 ANTI-DELETE ENGINE ---
const msgId = msg.key.id;

// 1. Detect Protocol Message (Type 0 = Delete)
if (msg.message?.protocolMessage?.type === 0 || msg.messageStubType === 68) {
    
    // 🛡️ OWNER SHIELD: Stop the bot from "snitching" on you
    if (msg.key.fromMe) return; 

    const deletedId = msg.message?.protocolMessage?.key?.id || msg.key.id;
    const oldMsg = global.msgStore.get(deletedId);

    // Only proceed if feature is ON and we have the message in memory
    if (oldMsg && global.botConfig.antiDelete) {
        
        let targetPath = ownerJid; // Default fallback to your DM

        // 📍 PATH SELECTION LOGIC
        const pathMode = global.botConfig.antiDeletePath;

        if (pathMode === 'gc') {
            targetPath = chatId;
        } 
        else if (pathMode === 'group') {
            try {
                const groups = await sock.groupFetchAllParticipating();
                const logGroup = Object.values(groups).find(g => g.subject === "Antidelete");
                if (logGroup) targetPath = logGroup.id;
            } catch (e) {
                console.error("Group fetch error:", e);
            }
        }

        // 📝 GENERATE LOG REPORT
        const report = `🛡️ *ANTI-DELETE LOG*\n\n` +
                       `👤 *From:* @${oldMsg.sender.split('@')[0]}\n` +
                       `💬 *Content:* ${oldMsg.body || 'Media File'}\n` +
                       `📍 *Source:* ${isGroup ? 'Group Chat' : 'Private DM'}\n\n` +
                       `_© 2026 YAS-TECH • Ghost Recovery_`;

        await sock.sendMessage(targetPath, { 
            text: report, 
            mentions: [oldMsg.sender] 
        });

        // 🖼️ RECOVER MEDIA (Photos, Videos, Stickers, Audio)
        if (oldMsg.isMedia) {
            await sock.copyNForward(targetPath, oldMsg.raw, true);
        }
    }
    return; // Exit delete protocol handling
}

// --- 📥 MESSAGE STORAGE (Saves incoming messages to memory) ---
// We only store the basic info to keep RAM usage low on KataBump
global.msgStore.set(msgId, {
    body: body,
    sender: sender,
    raw: msg,
    isMedia: !!(msg.message?.imageMessage || msg.message?.videoMessage || msg.message?.stickerMessage || msg.message?.audioMessage)
});

// Memory Cleanup: Keep only the last 200 messages
if (global.msgStore.size > 200) {
    const firstKey = global.msgStore.keys().next().value;
    global.msgStore.delete(firstKey);
}

            
   
        // --- 🎮 WORD CHAIN ENGLISH LISTENER ---
if (global.wordchain && global.wordchain[chatId]?.active) {
    const game = global.wordchain[chatId];
    const userWord = body.trim().toLowerCase();

    // 1. Basic check: Doesn't start with command prefix and is the right letter
    if (!body.startsWith('.') && userWord.length > 1 && userWord.startsWith(game.lastLetter)) {
        
        // 2. Deep check: Is it a real English word?
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${userWord}`);
            if (response.ok) {
                game.lastWord = userWord;
                game.lastLetter = userWord.slice(-1);
                await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });
            } else {
                // Not a real word
                await sock.sendMessage(chatId, { react: { text: '🚫', key: msg.key } });
            }
        } catch (err) {
            // API down? Fallback to just letting it pass
            console.log("Dictionary API Error");
        }
    } else if (!body.startsWith('.') && userWord.length > 1) {
        // Wrong starting letter
        await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
    }
}

       

        // --- 🔵 AYAT AUDIO LISTENER ---
if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.conversation?.includes("ＡＹＡＴ  ＡＬ－ＫＵＲＳＩ  ＡＵＤＩＯ")) {
    const choice = body.trim();
    const raadUrl = "https://files.catbox.moe/h4pli0.mp3";
    const menkUrl = "https://files.catbox.moe/s673oa.mp3";

    if (choice === '1') {
        await sock.sendMessage(chatId, { audio: { url: raadUrl }, mimetype: 'audio/mp4', ptt: true }, { quoted: msg });
    } else if (choice === '2') {
        await sock.sendMessage(chatId, { audio: { url: menkUrl }, mimetype: 'audio/mp4', ptt: true }, { quoted: msg });
    }
}



        // --- 🔵 GAME ENGINE (SCRAMBLE/GUESS/TTT) ---
        if (global.scrambleAnswer?.[chatId] && textLower === global.scrambleAnswer[chatId]) {
            delete global.scrambleAnswer[chatId];
            return await sock.sendMessage(chatId, { text: `🎉 *CONGRATULATIONS!* \n\n@${senderNumber} unscrambled it!`, mentions: [sender] });
        }

        if (global.guessGame?.[chatId] && !isNaN(textLower) && textLower.length > 0) {
            const secret = global.guessGame[chatId];
            const num = parseInt(textLower);
            if (num === secret) {
                delete global.guessGame[chatId];
                return await sock.sendMessage(chatId, { text: `🎊 *BINGO!* ${num} was the secret number!`, mentions: [sender] });
            } else if (num < 51) {
                return await sock.sendMessage(chatId, { text: num > secret ? "Find Lower number! 👇" : "Find Higher Number! 👆" });
            }
        }

        // --- 🔵 PUZZLE/QUIZ ENGINE ---
        if (global.gameCache?.[chatId]) {
            const game = global.gameCache[chatId];
            const userAnswer = textLower.trim();

            if (userAnswer === game.answer) {
                clearTimeout(game.timeout); // Kill the pending timeout message
                delete global.gameCache[chatId]; // Wipe the state
                
                await sock.sendMessage(chatId, { react: { text: '🏆', key: message.key } });
                return await sock.sendMessage(chatId, { 
                    text: `🎉 *CORRECT IDENTIFICATION!* \n\n@${senderNumber} solved the puzzle! \n\n*Target:* ${userAnswer.toUpperCase()}`, 
                    mentions: [sender] 
                }, { quoted: message });
            }
        }

        // --- 🟢 TIC-TAC-TOE ---
        const ttt = global.ttt?.[chatId];
        if (ttt && !isNaN(textLower) && textLower.length === 1) {
            const move = parseInt(textLower) - 1;
            const currentPlayer = ttt.turn === "X" ? ttt.playerX : ttt.playerO;
            if (sender === currentPlayer && ttt.board[move] !== "X" && ttt.board[move] !== "O") {
                ttt.board[move] = ttt.turn;
                const winPatterns = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
                const isWin = winPatterns.some(p => p.every(i => ttt.board[i] === ttt.turn));
                const isDraw = ttt.board.every(v => v === "X" || v === "O");

                if (isWin) {
                    await sock.sendMessage(chatId, { text: `${renderBoard(ttt.board)}\n\n🎉 *GAME OVER!* @${senderNumber} WON!`, mentions: [sender] });
                    delete global.ttt[chatId];
                } else if (isDraw) {
                    await sock.sendMessage(chatId, { text: `${renderBoard(ttt.board)}\n\n🤝 *IT'S A DRAW!*` });
                    delete global.ttt[chatId];
                } else {
                    ttt.turn = ttt.turn === "X" ? "O" : "X";
                    const nextPlayer = ttt.turn === "X" ? ttt.playerX : ttt.playerO;
                    await sock.sendMessage(chatId, { text: `${renderBoard(ttt.board)}\n\nNext: @${nextPlayer.split('@')[0]} (${ttt.turn})`, mentions: [nextPlayer] });
                }
                return;
            }
        }
        // ==========================================
        // 🎮 FOOTBALL QUIZ OPTION LISTENER
        // ==========================================
        if (body.startsWith('fquiz_ans_opt_')) {
                const contextInfo = msg.message.interactiveResponseMessage.contextInfo;
                const originalMsgId = contextInfo?.stanzaId;
                const sessionKey = `${chatId}_${originalMsgId}`;
                const activeQuiz = global.footballQuizSessions?.[sessionKey];

                if (activeQuiz && !activeQuiz.answered) {
                    activeQuiz.answered = true;

                    try {
                        await sock.sendMessage(chatId, { delete: activeQuiz.quizMessageKey });
                    } catch (err) { console.error("Failed to delete button quiz card:", err); }

                    const chosenIndex = parseInt(body.replace('fquiz_ans_opt_', ''));
                    const chosenAnswer = activeQuiz.options[chosenIndex];
                    const mentionTag = `@${sender.split('@')[0]}`;

                    if (chosenAnswer === activeQuiz.correctAnswer) {
                        await sock.sendMessage(chatId, { react: { text: '🎉', key: msg.key } });
                        const successMsg = `🎉 *CONGRATULATIONS ${mentionTag}!* \n\nExcellent football knowledge! You got it right.\n\n*Question:* _${activeQuiz.question}_\n*Your Answer:* ${chosenAnswer.toUpperCase()} (CORRECT!)`;
                        await sock.sendMessage(chatId, { text: successMsg, mentions: [sender] });
                    } else {
                        await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
                        const formattedAnswer = activeQuiz.correctAnswer.charAt(0).toUpperCase() + activeQuiz.correctAnswer.slice(1);
                        const failedMsg = `❌ *Incorrect choice!* ${mentionTag}\n\nThe answer to the question: _"${activeQuiz.question}"_ is *${formattedAnswer}*`;
                        await sock.sendMessage(chatId, { text: failedMsg, mentions: [sender] });
                    }

                    delete global.footballQuizSessions[sessionKey];
                    return;
                }
            }
        }
        
        // --- 🟢 COMMANDS ---
        const isPublic = global.botConfig.isPublic === true;
        if (!isPublic && !isOwner) return;

        // 1. Chota prefix kutoka memory kwa usahihi (bila kuangusha ikiwa string tupu)
        const prefix = global.botConfig?.prefix !== undefined ? global.botConfig.prefix : ".";
        
        // 2. Kagua kama bot ina prefix au haina (null)
        let isCmd = false;
        let commandInput = "";

        if (prefix === "") {
            // Mfumo wa NO PREFIX: Meseji lazima ianze na neno halisi la command iliyopo kwenye mfumo
            const firstWord = body.trim().split(/ +/)[0].toLowerCase();
            if (commands.has(firstWord) || aliases.has(firstWord)) {
                isCmd = true;
                commandInput = firstWord;
            }
        } else {
            // Mfumo wa KAWAIDA: Lazima ianze na ile alama ya prefix (mfano: .)
            if (body.startsWith(prefix)) {
                isCmd = true;
                commandInput = body.slice(prefix.length).trim().split(/ +/)[0].toLowerCase();
            }
        }

        // Kama sio amri halali, temea chini meseji
        if (!isCmd) return;

        // 3. Tenganisha Args na utafute jina la Command halisi
        const args = body.slice(prefix === "" ? commandInput.length : prefix.length + commandInput.length).trim().split(/ +/);
        if (args[0] === "") args.shift(); // Safisha nafasi zilizoachwa mbele
        
        const cmdName = aliases.get(commandInput) || commandInput;
        const command = commands.get(cmdName);

        if (command) {
            await command.execute(sock, chatId, msg, args, { 
                pushname: msg.pushName || "User", 
                isOwner, 
                sender, 
                body 
            });
        }


    } catch (err) {
        console.error("Critical Handler Error:", err);
    }
};

module.exports = { handleMessages };