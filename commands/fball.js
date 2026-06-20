const axios = require('axios');

module.exports = {
    name: "fball",
    alias: [
        "football", "ball", "uefa", 
        "fball_menu", "fball_standings", "fball_scorers",
        "fball_cat_int_t", "fball_cat_top_t", "fball_cat_oth_t",
        "fball_cat_int_s", "fball_cat_top_s", "fball_cat_oth_s",
        "fball_pl_t", "fball_pd_t", "fball_sa_t", "fball_bl1_t", "fball_fl1_t", "fball_cl_t",
        "fball_wc_t", "fball_ded_t", "fball_bsa_t", "fball_elc_t", "fball_ppl_t", "fball_ec_t",
        "fball_pl_s", "fball_pd_s", "fball_sa_s", "fball_bl1_s", "fball_fl1_s", "fball_cl_s",
        "fball_wc_s", "fball_ded_s", "fball_bsa_s", "fball_elc_s", "fball_ppl_s", "fball_ec_s"
    ],
    description: "Get live football tables and top scorers for ALL 12 available leagues via structured buttons.",
    category: "sports",

    execute: async (sock, chatId, message, args, { pushname }) => {
        const from = chatId;
        const msgStructure = message.message;
        const { sendButtons } = require('gifted-btns');

        // --- 🔑 TOKENI YAKO TOKA SCREENSHOT ---
        const API_KEY = '7c2a0852e6374782b9cb4235fef15bb4'; 
        const apiHeaders = { 'X-Auth-Token': API_KEY };

        // Database ya ligi zote 12 zilizopo kwenye picha yako
        const LEAGUE_IDS = {
            wc: 'WC',       // FIFA World Cup
            cl: 'CL',       // UEFA Champions League
            bl1: 'BL1',     // Bundesliga
            ded: 'DED',     // Eredivisie
            bsa: 'BSA',     // Campeonato Brasileiro Série A
            pd: 'PD',       // La Liga
            fl1: 'FL1',     // Ligue 1
            elc: 'ELC',     // Championship
            ppl: 'PPL',     // Primeira Liga
            ec: 'EC',       // European Championship
            sa: 'SA',       // Serie A
            pl: 'PL'        // Premier League
        };

        // Nyakua maandishi kutoka kwenye vitufe kwa usalama
        const incomingText = (
            msgStructure?.conversation || 
            msgStructure?.extendedTextMessage?.text || 
            msgStructure?.buttonsResponseMessage?.selectedButtonId || 
            msgStructure?.templateButtonReplyMessage?.selectedId ||
            msgStructure?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson ||
            ""
        ).trim().toLowerCase();

        let arg = args[0] ? args[0].toLowerCase() : "";

        // Kupanga upya 'arg' kulingana na kitufe kilichobofya
        if (/standings/i.test(incomingText)) arg = 'standings';
        else if (/scorers/i.test(incomingText)) arg = 'scorers';
        // Kutambua makundi (Categories)
        else if (/cat_int_t/i.test(incomingText)) arg = 'cat_int_t';
        else if (/cat_top_t/i.test(incomingText)) arg = 'cat_top_t';
        else if (/cat_oth_t/i.test(incomingText)) arg = 'cat_oth_t';
        else if (/cat_int_s/i.test(incomingText)) arg = 'cat_int_s';
        else if (/cat_top_s/i.test(incomingText)) arg = 'cat_top_s';
        else if (/cat_oth_s/i.test(incomingText)) arg = 'cat_oth_s';
        // Kutambua ligi maalum zilizobofywa
        const shortCodes = Object.keys(LEAGUE_IDS);
        for (const code of shortCodes) {
            if (new RegExp(`${code}_t`, 'i').test(incomingText)) arg = `${code}_t`;
            if (new RegExp(`${code}_s`, 'i').test(incomingText)) arg = `${code}_s`;
        }

        // ====================================================
        // LEVEL 1: MENU KUU (STANDINGS / TOP SCORERS)
        // ====================================================
        if (!arg || arg === 'menu' || arg === 'help') {
            await sock.sendMessage(from, { react: { text: '⚽', key: message.key } });
            const mainMenuText = `*⚽ YASEEN-MD FOOTBALL ZONE 2026*\n\nHello *${pushname}*, select an option below to access the full football database:`;
            return await sendButtons(sock, from, {
                title: '┏━━━〔 YASEEN FOOTBALL MENU 〕━━━┓',
                text: mainMenuText,
                footer: '© POWERED BY YASEEN-MD',
                aimode: false,
                buttons: [
                    { id: 'fball_standings', text: '📊 Live Standings' },
                    { id: 'fball_scorers', text: '🔥 Top Scorers' }
                ]
            });
        }

        // ====================================================
        // LEVEL 2(A): SUB-MENU KWA AJILI YA STANDINGS
        // ====================================================
        if (arg === 'standings') {
            await sock.sendMessage(from, { react: { text: '📊', key: message.key } });
            return await sendButtons(sock, from, {
                title: '┏━━━〔 STANDINGS CATEGORIES 〕━━━┓',
                text: `*📊 LIVE STANDINGS ROUTER*\n\nSelect the zone of leagues you want to view:`,
                footer: '© POWERED BY YASEEN-MD',
                aimode: false,
                buttons: [
                    { id: 'fball_cat_int_t', text: '🌍 International & Cups' },
                    { id: 'fball_cat_top_t', text: '⭐ Top Euro Leagues' },
                    { id: 'fball_cat_oth_t', text: '🔮 Other Elite Leagues' }
                ]
            });
        }

        // ====================================================
        // LEVEL 2(B): SUB-MENU KWA AJILI YA TOP SCORERS
        // ====================================================
        if (arg === 'scorers') {
            await sock.sendMessage(from, { react: { text: '🔥', key: message.key } });
            return await sendButtons(sock, from, {
                title: '┏━━━〔 SCORERS CATEGORIES 〕━━━┓',
                text: `*🔥 LIVE SCORERS ROUTER*\n\nSelect the zone to view top goal scorers:`,
                footer: '© POWERED BY YASEEN-MD',
                aimode: false,
                buttons: [
                    { id: 'fball_cat_int_s', text: '🌍 International & Cups' },
                    { id: 'fball_cat_top_s', text: '⭐ Top Euro Leagues' },
                    { id: 'fball_cat_oth_s', text: '🔮 Other Elite Leagues' }
                ]
            });
        }

        // ====================================================
        // LEVEL 3: KUGANGAWANYA VIFUNGO VYA LIGI KULINGANA NA MAKUNDI
        // ====================================================
        
        // --- TABLES CATEGORIES ---
        if (arg === 'cat_int_t') {
            return await sendButtons(sock, from, {
                title: '🌍 INTERNATIONAL TABLES',
                text: 'Select an international cup tournament table:',
                footer: '© YASEEN-MD', buttons: [
                    { id: 'fball_wc_t', text: '🏆 World Cup' },
                    { id: 'fball_cl_t', text: '🇪🇺 Champions League' },
                    { id: 'fball_ec_t', text: '🇪🇺 Euro Championship' }
                ]
            });
        }
        if (arg === 'cat_top_t') {
            return await sendButtons(sock, from, {
                title: '⭐ TOP EUROPE TABLES',
                text: 'Select a top tier European league table:',
                footer: '© YASEEN-MD', buttons: [
                    { id: 'fball_pl_t', text: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League' },
                    { id: 'fball_pd_t', text: '🇪🇸 La Liga' },
                    { id: 'fball_sa_t', text: '🇮🇹 Serie A' },
                    { id: 'fball_bl1_t', text: '🇩🇪 Bundesliga' },
                    { id: 'fball_fl1_t', text: '🇫🇷 Ligue 1' }
                ]
            });
        }
        if (arg === 'cat_oth_t') {
            return await sendButtons(sock, from, {
                title: '🔮 OTHER LEAGUE TABLES',
                text: 'Select other elite league tables available:',
                footer: '© YASEEN-MD', buttons: [
                    { id: 'fball_ded_t', text: '🇳🇱 Eredivisie' },
                    { id: 'fball_bsa_t', text: '🇧🇷 Série A (Brazil)' },
                    { id: 'fball_elc_t', text: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Championship' },
                    { id: 'fball_ppl_t', text: '🇵🇹 Primeira Liga' }
                ]
            });
        }

        // --- SCORERS CATEGORIES ---
        if (arg === 'cat_int_s') {
            return await sendButtons(sock, from, {
                title: '🌍 INTERNATIONAL SCORERS',
                text: 'Select an international cup tournament to view scorers:',
                footer: '© YASEEN-MD', buttons: [
                    { id: 'fball_wc_s', text: '🏆 World Cup' },
                    { id: 'fball_cl_s', text: '🇪🇺 Champions League' },
                    { id: 'fball_ec_s', text: '🇪🇺 Euro Championship' }
                ]
            });
        }
        if (arg === 'cat_top_s') {
            return await sendButtons(sock, from, {
                title: '⭐ TOP EUROPE SCORERS',
                text: 'Select a top tier European league to view scorers:',
                footer: '© YASEEN-MD', buttons: [
                    { id: 'fball_pl_s', text: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League' },
                    { id: 'fball_pd_s', text: '🇪🇸 La Liga' },
                    { id: 'fball_sa_s', text: '🇮🇹 Serie A' },
                    { id: 'fball_bl1_s', text: '🇩🇪 Bundesliga' },
                    { id: 'fball_fl1_s', text: '🇫🇷 Ligue 1' }
                ]
            });
        }
        if (arg === 'cat_oth_s') {
            return await sendButtons(sock, from, {
                title: '🔮 OTHER LEAGUE SCORERS',
                text: 'Select other elite leagues to view scorers:',
                footer: '© YASEEN-MD', buttons: [
                    { id: 'fball_ded_s', text: '🇳🇱 Eredivisie' },
                    { id: 'fball_bsa_s', text: '🇧🇷 Série A (Brazil)' },
                    { id: 'fball_elc_s', text: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Championship' },
                    { id: 'fball_ppl_s', text: '🇵🇹 Primeira Liga' }
                ]
            });
        }

        // ====================================================
        // LEVEL 4(A): FETCH LIVE STANDINGS FROM API
        // ====================================================
        if (arg.endsWith('_t')) {
            await sock.sendMessage(from, { react: { text: '⏳', key: message.key } });
            const leagueKey = arg.replace('_t', ''); 
            const leagueCode = LEAGUE_IDS[leagueKey];

            try {
                const response = await axios.get(`https://api.football-data.org/v4/competitions/${leagueCode}/standings`, { headers: apiHeaders });
                
                // Kushughulikia mfumo wa mashindano ya makundi kama CL au WC
                let standingsData;
                if (response.data.standings[0]?.table) {
                    standingsData = response.data.standings[0].table;
                } else if (response.data.standings[0]?.group) {
                    // Kama ni hatua ya makundi, tunachukua tu mchanganyiko wa kwanza kurahisisha ujumbe
                    standingsData = response.data.standings[0].table;
                }

                if (!standingsData) return await sock.sendMessage(from, { text: "❌ Standings data is currently not available for this league stage." });

                const leagueName = response.data.competition.name.toUpperCase();
                let tableRows = "";
                
                standingsData.slice(0, 12).forEach((row) => {
                    tableRows += `${row.position}. ${row.team.shortName || row.team.name} - ${row.points} pts (W:${row.won} D:${row.draw} L:${row.lost})\n`;
                });

                let msg = `📊 *${leagueName} STANDINGS*\n`;
                msg += `_Real-time Live API Data 2026_\n\n`;
                msg += `> ${tableRows.replace(/\n/g, "\n> ")}\n\n`;
                msg += `_ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʏᴀꜱᴇᴇɴ-ᴍᴅ_`;

                return await sock.sendMessage(from, { text: msg }, { quoted: message });
            } catch (e) {
                console.error(e);
                return await sock.sendMessage(from, { text: "❌ API Server Error: Ensure request limit is not exceeded or competition has active standings." });
            }
        }

        // ====================================================
        // LEVEL 4(B): FETCH LIVE SCORERS FROM API
        // ====================================================
        if (arg.endsWith('_s')) {
            await sock.sendMessage(from, { react: { text: '🎯', key: message.key } });
            const leagueKey = arg.replace('_s', ''); 
            const leagueCode = LEAGUE_IDS[leagueKey];

            try {
                const response = await axios.get(`https://api.football-data.org/v4/competitions/${leagueCode}/scorers`, { headers: apiHeaders });
                const scorers = response.data.scorers;
                const leagueName = response.data.competition.name.toUpperCase();

                if (!scorers || scorers.length === 0) {
                    return await sock.sendMessage(from, { text: `❌ No live scorers data recorded for ${leagueName} right now.` });
                }

                let scorersRows = "";
                scorers.slice(0, 10).forEach((row, index) => {
                    const teamName = row.team?.shortName || row.team?.name || "Unknown";
                    scorersRows += `${index + 1}. ${row.player.name} (${teamName}) - ${row.goals} Goals\n`;
                });

                let msg = `🔥 *${leagueName} TOP SCORERS*\n`;
                msg += `_Live API Golden Boot Race 2026_\n\n`;
                msg += `> ${scorersRows.replace(/\n/g, "\n> ")}\n\n`;
                msg += `_ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʏᴀꜱᴇᴇɴ-ᴍᴅ_`;

                return await sock.sendMessage(from, { text: msg }, { quoted: message });
            } catch (e) {
                console.error(e);
                return await sock.sendMessage(from, { text: "❌ API Server Error: Failed to fetch live scorers." });
            }
        }
    }
};
