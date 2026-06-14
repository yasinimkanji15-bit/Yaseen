const axios = require('axios');

module.exports = {
    name: "git",
    alias: ["github", "gh", "developer", "gitdl"],
    description: "Fetch profile stats or download a full GitHub repository ZIP.",
    category: "search",

    execute: async (sock, chatId, msg, args) => {
        const from = chatId;
        const input = args[0];

        // 1. Check for missing target parameter
        if (!input) {
            const usageText = `┌◽▫️ ❖ *GITHUB MAINFRAME* ❖ ▫️◽\n` +
                `│ ❌ *Error:* Missing Profile or Repo Target!\n` +
                `│\n` +
                `│ 📝 *Usage Instructions:* \n` +
                `│ ⏩ *Profile Stats:* \`git Morido\`\n` +
                `│ ⏩ *Repo Downloader:* \`git Morido/YASEEN-PAIR\`\n` +
                `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n\n` +
                `*© YASEEN-MD CORE SYSTEM*`;
            return sock.sendMessage(from, { text: usageText }, { quoted: msg });
        }

        // ====================================================
        // OPTION A: REPOSITORY DOWNLOADER SYSTEM (username/repo)
        // ====================================================
        if (input.includes('/')) {
            const [username, repo] = input.split('/');

            try {
                // Set heavy loading terminal reaction
                await sock.sendMessage(from, { react: { text: '📥', key: msg.key } });

                // Construct official GitHub ZIP archive payload uplink
                const zipUrl = `https://github.com/${username}/${repo}/archive/refs/heads/main.zip`;
                
                // Secondary backup URL fallback for older repositories using 'master' branch layout
                const fallbackZipUrl = `https://github.com/${username}/${repo}/archive/refs/heads/master.zip`;

                const docCaption = `┌◽▫️ ❖ *GITHUB REPOSITORY ZIP* ❖ ▫️◽\n` +
                    `│ 📦 *Repository:* ${repo}\n` +
                    `│ 👑 *Developer:* ${username}\n` +
                    `│ 🗂️ *Format:* Compressed Archive (.zip)\n` +
                    `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n\n` +
                    `*© 2026 YASEEN LAPORTE • INJECTED*`;

                // Try downloading using the 'main' branch template first
                try {
                    await sock.sendMessage(from, {
                        document: { url: zipUrl },
                        mimetype: 'application/zip',
                        fileName: `${repo}-main.zip`,
                        caption: docCaption
                    }, { quoted: msg });
                } catch (mainBranchError) {
                    // If 'main' fails, drop to 'master' branch matrix pipeline
                    await sock.sendMessage(from, {
                        document: { url: fallbackZipUrl },
                        mimetype: 'application/zip',
                        fileName: `${repo}-master.zip`,
                        caption: docCaption
                    }, { quoted: msg });
                }

                return await sock.sendMessage(from, { react: { text: '📦', key: msg.key } });

            } catch (error) {
                console.error("GitHub Download Error:", error.message);
                await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
                
                const downloadErrorBox = `┌◽▫️ ❖ *DOWNLOAD SYSTEM FAILURE* ❖ ▫️◽\n` +
                    `│ ❌ *Status:* Archive Fetch Aborted\n` +
                    `│ ⚠️ *Reason:* Target repository does not exist or branch is private.\n` +
                    `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽`;
                return sock.sendMessage(from, { text: downloadErrorBox }, { quoted: msg });
            }
        }

        // ====================================================
        // OPTION B: STANDARD PROFILE INTELLIGENCE (username)
        // ====================================================
        try {
            await sock.sendMessage(from, { react: { text: '🔍', key: msg.key } });

            const apiUrl = `https://api.github.com/users/${encodeURIComponent(input)}`;
            const response = await axios.get(apiUrl);
            const data = response.data;

            const name = data.name || "Not Specified";
            const bio = data.bio || "No biological status signature written.";
            const company = data.company || "Independent Operator";
            const location = data.location || "Unknown Grid Coordinate";

            const finalPayload = `┌◽▫️ ❖ *GITHUB INTELLIGENCE INTERFACE* ❖ ▫️◽\n` +
                `│ 🖥️ *Username:* ${data.login}\n` +
                `│ 👑 *Real Name:* ${name}\n` +
                `│ 🏢 *Organization:* ${company}\n` +
                `│ 🗺️ *Location:* ${location}\n` +
                `├◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n` +
                `│ 🗂️ *Public Repositories:* ${data.public_repos}\n` +
                `│ 👥 *Followers:* ${data.followers} | *Following:* ${data.following}\n` +
                `├◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n` +
                `│ 📜 *Bio Core:* ${bio}\n` +
                `│ 🌐 *Profile Matrix:* ${data.html_url}\n` +
                `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n\n` +
                `*💡 Tip:* Type \`git ${data.login}/repo_name\` to download a project.`;

            await sock.sendMessage(from, { 
                image: { url: data.avatar_url }, 
                caption: finalPayload 
            }, { quoted: msg });
            
            await sock.sendMessage(from, { react: { text: '🟢', key: msg.key } });

        } catch (error) {
            console.error("GitHub Profile Error:", error.message);
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
            
            if (error.response && error.response.status === 404) {
                const notFoundBox = `┌◽▫️ ❖ *GITHUB SEARCH FAILURE* ❖ ▫️◽\n` +
                    `│ ❌ *Status:* Target Not Found\n` +
                    `│ ⚠️ *Reason:* Profile \`${input}\` does not exist on GitHub.\n` +
                    `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽`;
                return sock.sendMessage(from, { text: notFoundBox }, { quoted: msg });
            }

            const errorCaption = `┌◽▫️ ❖ *GITHUB SYSTEM OVERLOAD* ❖ ▫️◽\n` +
                `│ ❌ *Status:* Request Aborted\n` +
                `│ ⚠️ *Reason:* Rate limit exceeded or uplink network timeout.\n` +
                `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽`;
            return sock.sendMessage(from, { text: errorCaption }, { quoted: msg });
        }
    }
};