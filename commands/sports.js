const axios = require('axios');

// 🔑 Your API-KEY from the dashboard
const API_KEY = 'cfbc9f7ec25c7d17a1a9f140eec1477c'; 
const BASE_URL = 'https://v3.football.api-sports.io';

const headers = {
    'x-apisports-key': API_KEY,
    'x-rapidapi-host': 'v3.football.api-sports.io'
};

module.exports = {
    name: "sports",
    alias: ["soccer", "football"],
    description: "All-in-one sports command for YAS-TECH",
    category: "sports",

    execute: async (sock, chatId, message, args) => {
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
        const prefix = body.charAt(0);
        const subCommand = args[0]?.toLowerCase();
        const query = args.slice(1).join(" ");

        // 📜 --- MANUAL --- 📜
        if (!subCommand) {
            const manual = `✦═════════◆═════════✦
⚽  *ＳＰＯＲＴＳ  ＨＵＢ* ⚽
✦═════════◆═════════✦

🛰️  *ＣＯＭＭＡＮＤＳ:*
> 1️⃣  *${prefix}sports livescore*
_Live matches happening right now._

> 2️⃣  *${prefix}sports fixture [league_id]*
_Upcoming matches (use 39 for EPL)._

> 3️⃣  *${prefix}sports team [name]*
_Team info, stadium, and founded date._

> 4️⃣  *${prefix}sports matchinfo [team_name]*
_Next match details for your team._

> 5️⃣  *${prefix}sports transfer [player_name]*
_Latest transfer history for a player._

✦═════════◆═════════✦
_© 2026 YAS-TECH • Sports Node_`;
            return await sock.sendMessage(chatId, { text: manual }, { quoted: message });
        }

        try {
            await sock.sendMessage(chatId, { react: { text: '⚽', key: message.key } });

            // 1. LIVESCORE
            if (subCommand === 'livescore') {
                const res = await axios.get(`${BASE_URL}/fixtures?live=all`, { headers });
                const matches = res.data.response.slice(0, 10); 
                if (!matches.length) return await sock.sendMessage(chatId, { text: "No matches live currently." });

                let text = "🏟️  *ＬＩＶＥ  ＳＣＯＲＥＳ*\n\n";
                matches.forEach(m => {
                    text += `• ${m.teams.home.name} *${m.goals.home}-${m.goals.away}* ${m.teams.away.name}\n🕒 ${m.fixture.status.elapsed}' (${m.league.name})\n\n`;
                });
                return await sock.sendMessage(chatId, { text }, { quoted: message });
            }

            // 2. FIXTURE (Example: .sports fixture 39 for Premier League)
            if (subCommand === 'fixture') {
                const leagueId = args[1] || 39; 
                const res = await axios.get(`${BASE_URL}/fixtures?league=${leagueId}&next=10`, { headers });
                let text = `📅  *ＵＰＣＯＭＩＮＧ  ＭＡＴＣＨＥＳ*\n\n`;
                res.data.response.forEach(f => {
                    text += `• ${f.teams.home.name} vs ${f.teams.away.name}\n⏰ ${new Date(f.fixture.date).toLocaleString()}\n\n`;
                });
                return await sock.sendMessage(chatId, { text }, { quoted: message });
            }

            // 3. TEAM INFO
            if (subCommand === 'team') {
                if (!query) return await sock.sendMessage(chatId, { text: "Provide a team name." });
                const res = await axios.get(`${BASE_URL}/teams?search=${query}`, { headers });
                const t = res.data.response[0];
                if (!t) return await sock.sendMessage(chatId, { text: "Team not found." });

                const text = `🛡️  *ＴＥＡＭ: ${t.team.name.toUpperCase()}*\n\n• Founded: ${t.team.founded}\n• Country: ${t.team.country}\n• Stadium: ${t.venue.name}\n• Capacity: ${t.venue.capacity}`;
                return await sock.sendMessage(chatId, { image: { url: t.team.logo }, caption: text }, { quoted: message });
            }

            // 4. MATCHINFO (Next match for a specific team)
            if (subCommand === 'matchinfo') {
                if (!query) return await sock.sendMessage(chatId, { text: "Provide a team name." });
                const teamRes = await axios.get(`${BASE_URL}/teams?search=${query}`, { headers });
                const teamId = teamRes.data.response[0]?.team.id;
                if (!teamId) return await sock.sendMessage(chatId, { text: "Team not found." });

                const res = await axios.get(`${BASE_URL}/fixtures?team=${teamId}&next=1`, { headers });
                const f = res.data.response[0];
                if (!f) return await sock.sendMessage(chatId, { text: "No upcoming matches found for this team." });
                
                const text = `🏁  *ＮＥＸＴ  ＭＡＴＣＨ*\n\n⚽ ${f.teams.home.name} vs ${f.teams.away.name}\n🏆 ${f.league.name}\n📅 ${new Date(f.fixture.date).toUTCString()}\n🏟️ ${f.fixture.venue.name}`;
                return await sock.sendMessage(chatId, { text }, { quoted: message });
            }

            // 5. TRANSFER
            if (subCommand === 'transfer') {
                if (!query) return await sock.sendMessage(chatId, { text: "Provide a player name." });
                const pRes = await axios.get(`${BASE_URL}/players/profiles?search=${query}`, { headers });
                const playerId = pRes.data.response[0]?.player.id;
                if (!playerId) return await sock.sendMessage(chatId, { text: "Player not found." });

                const res = await axios.get(`${BASE_URL}/transfers?player=${playerId}`, { headers });
                if (!res.data.response.length) return await sock.sendMessage(chatId, { text: "No transfer data available." });
                
                const trans = res.data.response[0].transfers[0];
                const text = `🔄  *ＬＡＴＥＳＴ  ＴＲＡＮＳＦＥＲ*\n\n👤 Player: ${query.toUpperCase()}\n📅 Date: ${trans.date}\n⬅️ From: ${trans.teams.out.name}\n➡️ To: ${trans.teams.in.name}\n💰 Type: ${trans.type || 'N/A'}`;
                return await sock.sendMessage(chatId, { text }, { quoted: message });
            }

        } catch (err) {
            return await sock.sendMessage(chatId, { text: "⚠️ API Error. Please check your connection or key status." });
        }
    }
};
