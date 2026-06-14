const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

module.exports = {
    name: "file",
    alias: ["getfile", "export"],
    description: "List or archive bot files into a ZIP.",
    category: "owner",

    execute: async (sock, chatId, message, args, { isOwner }) => {
        if (!isOwner) return;

        const rootDir = './';
        const files = fs.readdirSync(rootDir).filter(f => !['node_modules', '.git', '.npm', 'YASEEN_Export.zip'].includes(f));

        // --- 🟢 THE LIST & MANUAL ---
        if (!args[0] || args[0] === 'list' || args[0] === 'help' || args[0] === 'manual') {
            let manual = `📂 *YASEEN-ＭＤ ＦＩＬＥ ＳＹＳＴＥＭ*\n\n`;
            
            files.forEach((file, i) => {
                manual += `> ${i + 1}. ${file}\n`;
            });

            manual += `\n✦═════════════════════✦
1️⃣ *List:* .file list
> *Usage:* Displays indexed directory.

2️⃣ *Select:* .file [numbers]
> *Example:* .file 1,2,5

3️⃣ *Full:* .file all
> *Example:* .file all
✦═════════════════════✦

📂 *Field intel:*
> Select multiple files by comma to create a combined ZIP. The archive is automatically wiped after delivery.

_© 2026 YASEEN Laporte_`;
            
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        // --- 📦 ZIPPING LOGIC ---
        await sock.sendMessage(chatId, { react: { text: '📦', key: message.key } });

        const zipPath = path.join(__dirname, '../YASEEN_Export.zip');
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', async () => {
            try {
                await sock.sendMessage(chatId, { 
                    document: fs.readFileSync(zipPath), 
                    mimetype: 'application/zip', 
                    fileName: 'YASEEN_Export.zip',
                    caption: `✅ *YASEEN ＢＡＣＫＵＰ ＣＯＭＰＬＥＴＥ*\n\n> *Target:* ${args[0] === 'all' ? 'Full Project' : 'Selected Indices'}`
                }, { quoted: message });
                
                if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
            } catch (err) {
                console.error("ZIP Send Error:", err);
            }
        });

        archive.on('error', (err) => { throw err; });
        archive.pipe(output);

        if (args[0].toLowerCase() === 'all') {
            files.forEach(file => {
                const filePath = path.join(rootDir, file);
                if (fs.lstatSync(filePath).isDirectory()) {
                    archive.directory(filePath, file);
                } else {
                    archive.file(filePath, { name: file });
                }
            });
        } else {
            // Processing numeric selection
            const indices = args[0].split(',').map(n => parseInt(n.trim()) - 1);
            indices.forEach(index => {
                if (files[index]) {
                    const filePath = path.join(rootDir, files[index]);
                    if (fs.lstatSync(filePath).isDirectory()) {
                        archive.directory(filePath, files[index]);
                    } else {
                        archive.file(filePath, { name: files[index] });
                    }
                }
            });
        }

        await archive.finalize();
    }
};
