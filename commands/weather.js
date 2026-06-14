const axios = require('axios');

module.exports = {
    name: "weather",
    alias: ["climate", "haliyahawa"],
    description: "Fetch real-time climate intelligence via direct Satellite link.",
    category: "location",

    execute: async (sock, chatId, message, args) => {
        const from = chatId;
        const query = args.join(" ").trim();
        const prefix = ".";

        // --- 🟢 1. OPERATIONAL MANUAL ---
        if (!query) {
            const manual = `✦═══════════════════════◆
🌍  *YASEEN  ＣＬＩＭＡＴＥ  ＮＯＤＥ*
✦═══════════════════════◆

🛰️  *ＳＹＳＴＥＭ  ＯＰＥＲＡＴＩＯＮＡＬＳ:*
> *${prefix}weather [location]* ➔ Satellite Sync

🛰️  *ＥＸＡＭＰＬＥ:*
> ${prefix}weather Arusha
> ${prefix}weather Istanbul

🛰️  *ＴＡＳＫ:* Provide a valid city or region to 
receive a full climate dossier.

According to my creator YASEEN, the dossier is complete.
✦═══════════════════════◆
*🛡️ YASEEN－ＭＤ 🛡️*`;
            return await sock.sendMessage(from, { 
                image: { url: "https://files.catbox.moe/yb43pn.jpg" }, 
                caption: manual 
            }, { quoted: message });
        }

        try {
            await sock.sendMessage(from, { react: { text: '🌍', key: message.key } });

            // Using a direct Weather API for speed and accuracy
            const weatherApi = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&units=metric&appid=06af544618059e4f37f03318393a6b1e`;
            const { data: r } = await axios.get(weatherApi);

            // Formatting the exact report you wanted
            let report = `🌍 *ＣＬＩＭＡＴＥ  ＩＮＴＥＬＬＩＧＥＮＣＥ*\n\n`;
            report += `> 📍 Location: ${r.name}, ${r.sys.country}\n`;
            report += `> 🛰️ Status: ${r.weather[0].main} (${r.weather[0].description})\n`;
            report += `> 🌡️ Temperature: ${r.main.temp}°C\n`;
            report += `> 🧤 Feels like: ${r.main.feels_like}°C\n`;
            report += `> 💧 Humidity: ${r.main.humidity}%\n`;
            report += `> 🌬️ Wind speed: ${r.wind.speed} m/s\n`;
            report += `> 👁️ Visibility: ${r.visibility / 1000} km\n`;
            report += `> 🌅 Sunrise: ${new Date(r.sys.sunrise * 1000).toLocaleTimeString()}\n`;
            report += `> 🌇 Sunset: ${new Date(r.sys.sunset * 1000).toLocaleTimeString()}\n\n`;
            report += `*🌍 🄼🄰🄳🅁🄸🄽◉🅼︎🅳︎ 🌏*`;

            await sock.sendMessage(from, { react: { text: '✅', key: message.key } });
            return await sock.sendMessage(from, { text: report }, { quoted: message });

        } catch (e) {
            console.error("WEATHER ERROR:", e.message);
            return sock.sendMessage(from, { 
                text: "❌ *NEURAL ERROR:* Satellite connection lost. Please ensure the location is valid (e.g., '.weather Arusha')." 
            }, { quoted: message });
        }
    }
};
