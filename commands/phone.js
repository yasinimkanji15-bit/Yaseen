module.exports = {
    name: "device",
    alias: ["phone", "specs", "mobile"],
    description: "Get detailed phone specifications.",
    category: "tools",

    execute: async (sock, chatId, m, args) => {
        const query = args.join(" ");
        if (!query) return sock.sendMessage(chatId, { text: "❌ Please provide a phone name!\nExample: *.device iPhone 13*" }, { quoted: m });

        await sock.sendMessage(chatId, { text: `🔍 Searching for *${query}* specifications...` }, { quoted: m });

        try {
            // Using a more stable and direct mobile specs search endpoint
            const searchRes = await axios.get(`https://api-mobilespecs.azharimm.site/v2/search?query=${encodeURIComponent(query)}`);
            
            if (!searchRes.data.status || searchRes.data.data.phones.length === 0) {
                return sock.sendMessage(chatId, { text: "❌ Device not found. Please try another model name." }, { quoted: m });
            }

            const phoneSlug = searchRes.data.data.phones[0].slug;
            const detailRes = await axios.get(`https://api-mobilespecs.azharimm.site/v2/${phoneSlug}`);
            const phone = detailRes.data.data;

            let specsMsg = `📱 *${phone.phone_name}*\n`;
            specsMsg += `🏢 *Brand:* ${phone.brand}\n`;
            specsMsg += `📅 *Released:* ${phone.release_date || "N/A"}\n\n`;
            
            // Loop through some main specs
            phone.specifications.forEach(spec => {
                if (["Display", "Platform", "Memory", "Main Camera", "Battery"].includes(spec.title)) {
                    specsMsg += `*${spec.title.toUpperCase()}*\n`;
                    spec.specs.slice(0, 2).forEach(s => {
                        specsMsg += `• ${s.key}: _${s.val[0]}_\n`;
                    });
                    specsMsg += `\n`;
                }
            });

            specsMsg += `✨━━━━━━━━━━━━━━━━━━━━✨\n🛡️ *YASEEN—MD* 🛡️`;

            if (phone.phone_images && phone.phone_images.length > 0) {
                await sock.sendMessage(chatId, { 
                    image: { url: phone.phone_images[0] }, 
                    caption: specsMsg 
                }, { quoted: m });
            } else {
                await sock.sendMessage(chatId, { text: specsMsg }, { quoted: m });
            }

        } catch (err) {
            console.error(err);
            await sock.sendMessage(chatId, { text: "❌ Connection error. The specs server is currently busy. Please try again later." }, { quoted: m });
        }
    }
};