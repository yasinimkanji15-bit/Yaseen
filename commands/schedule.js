const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/schedules.json');
if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// --- ⚙️ SELF-BOOTING ENGINE ---
const bootSchedules = async (sock) => {
    if (global.schedulesLoaded || !fs.existsSync(dbPath)) return;
    try {
        const tasks = JSON.parse(fs.readFileSync(dbPath));
        tasks.forEach(task => {
            const [hour, minute] = task.time.split(":");
            const cronTime = task.type === 'daily' ? `${minute} ${hour} * * *` : `${minute} ${hour} ${new Date().getDate()} ${new Date().getMonth() + 1} *`;
            
            cron.schedule(cronTime, async () => {
                const target = task.target.includes('@') ? task.target : `${task.target}@s.whatsapp.net`;
                await sock.sendMessage(target, { text: task.text });
                if (task.type === 'once') deleteFromDb(task.id);
            }, { timezone: "Africa/Nairobi" });
        });
        global.schedulesLoaded = true;
    } catch (e) { console.error(e); }
};

const deleteFromDb = (id) => {
    if (!fs.existsSync(dbPath)) return;
    let tasks = JSON.parse(fs.readFileSync(dbPath));
    tasks = tasks.filter(t => t.id !== id);
    fs.writeFileSync(dbPath, JSON.stringify(tasks, null, 2));
};

module.exports = {
    name: "schedule",
    alias: ["plan", "tasks", "timer"],
    description: "Advanced tactical scheduler with live time sync.",
    category: "automation",

    execute: async (sock, chatId, message, args) => {
        await bootSchedules(sock);

        // 🕒 LIVE TIME FEED GENERATOR
        const now = new Date();
        const options = { timeZone: "Africa/Nairobi", hour12: false, hour: '2-digit', minute: '2-digit' };
        const dateOptions = { timeZone: "Africa/Nairobi", day: '2-digit', month: 'long', year: 'numeric' };
        
        const currentTime = now.toLocaleTimeString('en-GB', options);
        const currentDate = now.toLocaleDateString('en-GB', dateOptions);
        const currentDay = now.toLocaleDateString('en-GB', { timeZone: "Africa/Nairobi", weekday: 'long' });

        const manual = `📅 *YASEEN-ＭＤ ＳＣＨＥＤＵＬＥＲ*
\`\`\`
  _______ _____ __  __ ______ 
 |__   __|_   _|  \\/  |  ____|
    | |    | | | \\  / | |__   
    | |    | | | |\\/| |  __|  
    | |   _| |_| |  | | |____ 
    |_|  |_____|_|  |_|______|
\`\`\`
✦═════════════════════════════════✦
> 🌍 *Region:* Arusha Node (EAT)
> 🕒 *Time:* ${currentTime}
> 📅 *Date:* ${currentDay}, ${currentDate}
✦═════════════════════════════════✦

1️⃣ *SET:* .schedule set HH:MM, Msg, Target, once/daily
2️⃣ *LIST:* .schedule list
3️⃣ *DELETE:* .schedule del <number>

📂 *Field intel:*
> Target: Number (255...) or Group ID.
> Example: .schedule set 08:30, Morning, 2557..., daily

_© 2026 YAS-TECH • Operational_`;

        if (!args[0]) return sock.sendMessage(chatId, { text: manual }, { quoted: message });

        const subCommand = args[0].toLowerCase();

        if (subCommand === 'set') {
            const rawData = args.slice(1).join(" ");
            const parts = rawData.split(",");
            if (parts.length < 4) return sock.sendMessage(chatId, { text: "❌ *Error:* Use commas to separate data." });

            const time = parts[0].trim();
            const text = parts[1].trim();
            const target = parts[2].trim().replace(/[^0-9@.-]/g, '');
            const freq = parts[3].trim().toLowerCase();
            const [hour, minute] = time.split(":");

            if (isNaN(hour) || isNaN(minute) || (freq !== 'once' && freq !== 'daily')) {
                return sock.sendMessage(chatId, { text: "❌ *Invalid Logic.*" });
            }

            const newTask = { id: Date.now(), time, text, target, type: freq, from: chatId };
            let tasks = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : [];
            tasks.push(newTask);
            fs.writeFileSync(dbPath, JSON.stringify(tasks, null, 2));

            const cronTime = freq === 'daily' ? `${minute} ${hour} * * *` : `${minute} ${hour} ${new Date().getDate()} ${new Date().getMonth() + 1} *`;
            cron.schedule(cronTime, async () => {
                const finalTarget = target.includes('@') ? target : `${target}@s.whatsapp.net`;
                await sock.sendMessage(finalTarget, { text: text });
                if (freq === 'once') deleteFromDb(newTask.id);
            }, { timezone: "Africa/Nairobi" });

            return sock.sendMessage(chatId, { text: `✅ *TASK LOCKED*\n> Syncing for ${time} (${freq})` });
        }

        if (subCommand === 'list') {
            if (!fs.existsSync(dbPath)) return sock.sendMessage(chatId, { text: "📂 *No active tasks.*" });
            const tasks = JSON.parse(fs.readFileSync(dbPath));
            let report = `📋 *YASEEN-ＭＤ ＡＣＴＩＶＥ ＴＡＳＫＳ*\n\n`;
            tasks.forEach((t, i) => {
                report += `${i + 1}. ⏰ *[${t.time}]* (${t.type})\n   👤 *To:* ${t.target}\n   💬 ${t.text}\n\n`;
            });
            return sock.sendMessage(chatId, { text: report });
        }

        if (subCommand === 'del') {
            const index = parseInt(args[1]) - 1;
            if (!fs.existsSync(dbPath)) return;
            let tasks = JSON.parse(fs.readFileSync(dbPath));
            if (isNaN(index) || !tasks[index]) return sock.sendMessage(chatId, { text: "❌ *Usage:* .schedule del <number>" });
            tasks.splice(index, 1);
            fs.writeFileSync(dbPath, JSON.stringify(tasks, null, 2));
            return sock.sendMessage(chatId, { text: "🗑️ *Task Purged.*" });
        }

        return sock.sendMessage(chatId, { text: manual });
    }
};
