const axios = require('axios');

// Initialize a global memory cache if it doesn't exist yet
if (!global.apiSearchCache) {
    global.apiSearchCache = {};
}

module.exports = {
    name: "apisearch",
    alias: ["apis", "findapi", "freeapi"],
    description: "Search open-source public APIs or view detailed specifications.",
    category: "search",

    execute: async (sock, chatId, msg, args) => {
        const from = chatId;
        const input = args.join(" ").trim();

        if (!input) {
            const usageText = `┌◽▫️ ❖ *PUBLIC API SEARCH MATRIX* ❖ ▫️◽\n` +
                `│ ❌ *Error:* Missing Query or Index Input!\n` +
                `│\n` +
                `│ 📝 *How to Search:* \n` +
                `│ ⏩ \`apisearch image\`\n` +
                `│ ⏩ \`apisearch anime\`\n` +
                `│\n` +
                `│ 🔢 *How to View Details:* \n` +
                `│ If you already searched, type the number:\n` +
                `│ ⏩ \`apisearch 3\`\n` +
                `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n\n` +
                `*© YASEEN-MD DEVELOPER CORE*`;
            return sock.sendMessage(from, { text: usageText }, { quoted: msg });
        }

        // ====================================================
        // STEP 2: IF THE OPERATOR INPUTS A NUMBER (SELECTING FROM CACHE)
        // ====================================================
        if (!isNaN(input)) {
            const index = parseInt(input) - 1;
            const userCache = global.apiSearchCache[from];

            if (!userCache || !userCache[index]) {
                const noCacheBox = `┌◽▫️ ❖ *MATRIX CACHE MISS* ❖ ▫️◽\n` +
                    `│ ❌ *Error:* Invalid selection or session expired.\n` +
                    `│ 💡 *Fix:* Perform a new search first (e.g., \`apisearch music\`).\n` +
                    `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽`;
                return sock.sendMessage(from, { text: noCacheBox }, { quoted: msg });
            }

            const targetApi = userCache[index];
            
            // Build the comprehensive intelligence breakdown for the selected API
            const detailsPayload = `┌◽▫️ ❖ *API SPECIFICATION MANIFEST* ❖ ▫️◽\n` +
                `│ 📡 *NAME:* ${targetApi.API}\n` +
                `│ 📝 *DESCRIPTION:* ${targetApi.Description}\n` +
                `├◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n` +
                `│ 🔐 *AUTH TYPE:* ${targetApi.Auth || "None (Open-Access)"}\n` +
                `│ 🛡️ *HTTPS SECURE:* ${targetApi.HTTPS ? "Verified (Yes)" : "Unsecured (No)"}\n` +
                `│ 🔄 *CORS POLICY:* ${targetApi.Cors || "Unknown"}\n` +
                `│ 🗂️ *SECTOR CATEGORY:* ${targetApi.Category}\n` +
                `├◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n` +
                `│ 🌐 *ENDPOINT LINK:* \n` +
                `│ ${targetApi.Link}\n` +
                `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n\n` +
                `*© 2026 YASEEN LAPORTE • OPERATIONAL*`;

            await sock.sendMessage(from, { react: { text: '📑', key: msg.key } });
            return sock.sendMessage(from, { text: detailsPayload }, { quoted: msg });
        }

        // ====================================================
        // STEP 1: SPARK NEW SEARCH QUERY PIPELINE
        // ====================================================
        try {
            await sock.sendMessage(from, { react: { text: '🔍', key: msg.key } });

            // Fetching a highly maintained static archive matrix of public APIs
            const response = await axios.get("https://raw.githubusercontent.com/public-apis/public-apis/master/json/public-apis.json");
            
            if (!response.data || !response.data.entries) throw new Error("Central registry cluster offline.");

            const allEntries = response.data.entries;
            
            // Filter entries by matching name, description, or category
            const filteredApis = allEntries.filter(item => 
                item.API.toLowerCase().includes(input.toLowerCase()) || 
                item.Description.toLowerCase().includes(input.toLowerCase()) ||
                item.Category.toLowerCase().includes(input.toLowerCase())
            ).slice(0, 15); // Limit to top 15 records to prevent heavy cluttering

            if (filteredApis.length === 0) {
                const noResultBox = `┌◽▫️ ❖ *REGISTRY SEARCH BLANK* ❖ ▫️◽\n` +
                    `│ ❌ *No Match:* No public APIs found matching "${input}".\n` +
                    `│ 💡 *Tip:* Try using broader terms like \`video\`, \`auth\`, \`data\`, \`weather\`.\n` +
                    `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽`;
                return sock.sendMessage(from, { text: noResultBox }, { quoted: msg });
            }

            // Save the filtered data into global memory specific to this chat interface
            global.apiSearchCache[from] = filteredApis;

            // Compile the visual listing
            let listPayload = `┌◽▫️ ❖ *API INDEX SEARCH ARCHIVE* ❖ ▫️◽\n` +
                `│ 📡 *QUERY TARGET:* ${input}\n` +
                `│ 📊 *MATCHES RETRIEVED:* ${filteredApis.length} Records\n` +
                `├◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n`;

            filteredApis.forEach((api, index) => {
                listPayload += `│ 🔢 *[${index + 1}]* ${api.API}\n` +
                               `│ 📜 _${api.Description.substring(0, 50)}..._\n` +
                               `│\n`;
            });

            listPayload += `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽\n\n` +
                `*💡 Next Step:* Type \`apisearch <number>\` (e.g., \`apisearch 1\`) to decrypt the selected API config block.\n\n` +
                `*© POWERED BY YASEEN-MD*`;

            await sock.sendMessage(from, { text: listPayload }, { quoted: msg });
            await sock.sendMessage(from, { react: { text: '🟢', key: msg.key } });

        } catch (error) {
            console.error("API Search Engine Error:", error.message);
            await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
            
            const errorCaption = `┌◽▫️ ❖ *REGISTRY SYSTEM FAILURE* ❖ ▫️◽\n` +
                `│ ❌ *Status:* Pipeline Blocked\n` +
                `│ ⚠️ *Reason:* Failed to pull metadata from the open-source git source cluster.\n` +
                `└◽▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️◽`;
            return sock.sendMessage(from, { text: errorCaption }, { quoted: msg });
        }
    }
};