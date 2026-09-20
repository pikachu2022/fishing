// 註冊 Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
	// 注意：因為你的專案在 /Reader/ 底下，路徑要寫對
	navigator.serviceWorker.register('/Reader/sw.js')
	  .then(reg => console.log('Service Worker 註冊成功：', reg.scope))
	  .catch(err => console.log('Service Worker 註冊失敗：', err));
  });
}
let audioEnabled = true;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function playSound(type) {
      if (!audioEnabled) return;
      try {
        if (!audioCtx) audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === 'catch') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
        } else if (type === 'rare' || type === 'epic' || type === 'legendary') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.1);
          osc.frequency.setValueAtTime(783.99, now + 0.2);
          osc.frequency.setValueAtTime(1046.50, now + 0.3);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
          osc.start(now);
          osc.stop(now + 0.45);
        } else if (type === 'buy') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.12);
        } else if (type === 'achievement') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.12);
          osc.frequency.setValueAtTime(783.99, now + 0.24);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
        }
      } catch (e) {
        console.log("音效播放錯誤:", e);
      }
    }

    function toggleAudio() {
      audioEnabled = !audioEnabled;
      document.getElementById('audio-icon').innerText = audioEnabled ? '🔊' : '🔇';
      addLog(audioEnabled ? "🔊 音效已開啟" : "🔇 音效已靜音");
      
      if (!audioEnabled && archieve['hidden_mute'] && archieve['hidden_mute'][0] === 1) {
        archieve['hidden_mute'][0] = 0;
        const reward = archieve['hidden_mute'][2];
        coin += reward;
        playSound('achievement');
        addLog(`🏆 隱藏成就解鎖 [${archieve['hidden_mute'][3]}]！獎勵 +${reward} 金幣`);
      }
    }

    let coin = 600;
    let exp = 0;
    let speedMultiplier = 1;
    let activeBaitTimer = 0;
    let activeBaitKey = '0+';
    let fountainBuff = 0; 
    let totalCaughtCount = 0;
    let rareCaughtCount = 0;
    let playSeconds = 0;
    let kaomojiClickCount = 0;

    const fishMeta = {
      'tier0': { name: '劣質', color: 'text-slate-400 border-slate-700 bg-slate-900/60', val: 20, exp: 1 },
      'tier1': { name: '普通', color: 'text-sky-300 border-sky-600/40 bg-sky-950/30', val: 50, exp: 5 },
      'tier2': { name: '高級', color: 'text-emerald-300 border-emerald-600/40 bg-emerald-950/30', val: 120, exp: 10 },
      'tier3': { name: '稀有', color: 'text-amber-300 border-amber-600/50 bg-amber-950/40', val: 300, exp: 50 },
      'tier4': { name: '傳說', color: 'text-purple-300 border-purple-600/50 bg-purple-950/40', val: 800, exp: 100 },
      'tier5': { name: '史詩', color: 'text-rose-300 border-rose-600/50 bg-rose-950/40', val: 2000, exp: 400 }
    };

    const fishDataList = [
      { id: 'f1', name: '破鞋子', tier: 'tier0' },
      { id: 'f2', name: '水草', tier: 'tier0' },
      { id: 'f3', name: '木頭碎片', tier: 'tier0' },
      { id: 'f4', name: '空罐頭', tier: 'tier0' },
      { id: 'f5', name: '小金魚', tier: 'tier1' },
      { id: 'f6', name: '藍小魚', tier: 'tier1' },
      { id: 'f7', name: '草魚', tier: 'tier1' },
      { id: 'f8', name: '大口鱸', tier: 'tier1' },
      { id: 'f9', name: '鰻魚', tier: 'tier2' },
      { id: 'f10', name: '飛魚', tier: 'tier2' },
      { id: 'f11', name: '鮭魚', tier: 'tier2' },
      { id: 'f12', name: '海鱸魚', tier: 'tier2' },
      { id: 'f13', name: '鮟鱇魚', tier: 'tier3' },
      { id: 'f14', name: '水母', tier: 'tier3' },
      { id: 'f15', name: '錦鯉', tier: 'tier3' },
      { id: 'f16', name: '獅子魚', tier: 'tier3' },
      { id: 'f17', name: '翻車魚', tier: 'tier4' },
      { id: 'f18', name: '章魚', tier: 'tier4' },
      { id: 'f19', name: '鮪魚', tier: 'tier4' },
      { id: 'f20', name: '鯊魚', tier: 'tier4' },
      { id: 'f21', name: '鯨魚', tier: 'tier5' },
      { id: 'f22', name: '遠古利維坦', tier: 'tier5' }
    ];

    const fishNames = {};
    const a = {};
    const b = {};
    const fishTiers = {};

    fishDataList.forEach(item => {
      fishNames[item.id] = item.name;
      a[item.id] = fishMeta[item.tier].val;
      b[item.id] = 0;
      fishTiers[item.id] = item.tier;
    });

    const archieve = {
      'level_1': [1, 5, 250, '解鎖等級 Lv.1 (5 EXP)', false],
      'level_2': [1, 25, 600, '解鎖等級 Lv.2 (25 EXP)', false],
      'level_3': [1, 125, 1200, '解鎖等級 Lv.3 (125 EXP)', false],
      'level_4': [1, 625, 6000, '解鎖等級 Lv.4 (625 EXP)', false],
      'level_5': [1, 3125, 10000, '解鎖等級 Lv.5 (3125 EXP)', false],
      'tier3_unlocked': [1, 1, 500, '獲得首隻稀有魚', false],
      'tier4_unlocked': [1, 1, 1500, '獲得首隻傳說魚', false],
      'tier5_unlocked': [1, 1, 5000, '獲得首隻史詩魚', false],
      'hidden_kaomoji': [1, 1, 300, '點擊表情 (～￣▽￣)～', true],
      'hidden_speed8x': [1, 1, 300, '速度8x 三三＼(((￣(￣(￣▽￣)／', true],
      'hidden_coins86400': [1, 1, 8640, '金幣到86400 釣到天昏地暗(￣y▽￣)╭', true],
      'hidden_exp5': [1, 1, 3600, '經驗Lv.5 佬（￣︶￣）↗', true],
      'hidden_reset': [1, 1, 60, '刪除存檔重新開始 我重生了，這一世我要釣到魚！o((>ω< ))o', true],
      'hidden_fullphoto': [1, 1, 600, '全圖鑑 強迫症(‾◡◝)', true],
      'hidden_fullarch': [1, 1, 600, '全成就 非常強迫症( •̀ ω •́ )✧', true],
      'hidden_mute': [1, 1, 300, '靜音 請教我關音菩薩o(*￣︶￣*)o', true]
    };

    const weapon = {
      'trash':     [1, 'bamboo', 0.02, 0, 0, '竹竿'],
      'bamboo':    [0, 'trash', 0.05, 500, 5, '木製釣竿'],
      'normal':    [0, 'normal', 0.10, 1200, 25, '普通釣竿'],
      'great':     [0, 'great', 0.15, 3600, 125, '強力釣竿'],
      'excellent': [0, 'excellent', 0.20, 10800, 625, '精良釣竿'],
      'legent':    [0, 'legent', 0.25, 43200, 3125, '傳說釣竿']
    };

    const buff = {
      '0+': [1, '蚯蚓魚餌', 0.01, 0, 0],
      'a+': [0, '鮮蝦魚餌', 0.02, 50, 5],
      'b+': [0, '小魚魚餌', 0.03, 120, 25],
      'c+': [0, '螢光魚餌', 0.04, 300, 125],
      'd+': [0, '深海魚餌', 0.05, 800, 625],
      'e+': [0, '傳承星光魚餌', 0.06, 2000, 3125]
    };

    const SAVE_KEY = 'unknown_fishing_game_save_v23';

    function saveGame() {
      const saveData = {
        coin,
        exp,
        activeBaitTimer,
        activeBaitKey,
        fountainBuff,
        totalCaughtCount,
        rareCaughtCount,
        playSeconds,
        kaomojiClickCount,
        b,
        archieve,
        weapon,
        buff,
        timestamp: Date.now()
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    }

    function loadGame() {
      const saved = localStorage.getItem(SAVE_KEY);
      if (!saved) return;
      try {
        const data = JSON.parse(saved);
        if (data.coin !== undefined) coin = data.coin;
        if (data.exp !== undefined) exp = data.exp;
        if (data.activeBaitTimer !== undefined) activeBaitTimer = data.activeBaitTimer;
        if (data.activeBaitKey !== undefined) activeBaitKey = data.activeBaitKey;
        if (data.fountainBuff !== undefined) fountainBuff = data.fountainBuff;
        if (data.totalCaughtCount !== undefined) totalCaughtCount = data.totalCaughtCount;
        if (data.rareCaughtCount !== undefined) rareCaughtCount = data.rareCaughtCount;
        if (data.playSeconds !== undefined) playSeconds = data.playSeconds;
        if (data.kaomojiClickCount !== undefined) kaomojiClickCount = data.kaomojiClickCount;
        if (data.b) Object.assign(b, data.b);
        if (data.archieve) {
          for (const key of Object.keys(data.archieve)) {
            if (archieve[key]) {
              archieve[key][0] = data.archieve[key][0];
            }
          }
        }
        if (data.weapon) Object.assign(weapon, data.weapon);
        if (data.buff) Object.assign(buff, data.buff);

        if (data.timestamp) {
          const offlineSeconds = Math.floor((Date.now() - data.timestamp) / 1000);
          if (offlineSeconds > 10) {
            playSeconds += offlineSeconds;
            processOfflineEarnings(offlineSeconds);
          }
        }
      } catch (e) {
        console.error("載入存檔失敗:", e);
      }
    }

    function processOfflineEarnings(seconds) {
      const maxSeconds = Math.min(seconds, 28800);
      let offlineCoins = 0;
      let offlineExp = 0;

      let rodRate = 0.02;
      for (const k of Object.keys(weapon)) {
        if (weapon[k][0] === 1) rodRate = weapon[k][2];
      }
      const baitRate = buff[activeBaitKey] ? buff[activeBaitKey][2] : 0.01;
      const fountainRate = fountainBuff / 100;
      const combinedRate = rodRate + baitRate + fountainRate;

      for (let i = 0; i < maxSeconds; i++) {
        if (coin > 0) {
          coin -= 1;
          if (Math.random() < combinedRate) {
            if (Math.random() >= 0.5) {
              const weights = { 'tier0': 10000, 'tier1': 8000, 'tier2': 4000, 'tier3': 2000, 'tier4': 500, 'tier5': 1 };
              const totalWeight = Object.values(weights).reduce((acc, w) => acc + w, 0);
              let randWeight = Math.random() * totalWeight;
              let targetTier = 'tier0';
              for (const [tier, w] of Object.entries(weights)) {
                if (randWeight < w) { targetTier = tier; break; }
                randWeight -= w;
              }
              const availableFish = fishDataList.filter(f => f.tier === targetTier);
              const chosenFish = availableFish[Math.floor(Math.random() * availableFish.length)];
              offlineCoins += a[chosenFish.id];
              offlineExp += fishMeta[targetTier].exp;
            }
          }
        }
      }

      if (offlineCoins > 0 || offlineExp > 0) {
        coin += offlineCoins;
        exp += offlineExp;
        setTimeout(() => {
          addLog(`🌙 離線掛機 (${formatTime(maxSeconds)}): 獲得 +${offlineCoins} 金幣, +${offlineExp} EXP`);
        }, 500);
      }
    }

    function showResetConfirm() {
      document.getElementById('reset-confirm-box').classList.remove('hidden');
      document.getElementById('btn-show-reset').classList.add('hidden');
    }

    function cancelResetData() {
      document.getElementById('reset-confirm-box').classList.add('hidden');
      document.getElementById('btn-show-reset').classList.remove('hidden');
    }

    function confirmResetData() {
      if (archieve['hidden_reset'] && archieve['hidden_reset'][0] === 1) {
        archieve['hidden_reset'][0] = 0;
        const reward = archieve['hidden_reset'][2];
        addLog(`🏆 隱藏成就解鎖 [${archieve['hidden_reset'][3].split(' ')[0]}]！獎勵 +${reward} 金幣`);
      }

      const tempResetArch = archieve['hidden_reset'][0];

      localStorage.removeItem(SAVE_KEY);

      coin = 600 + (tempResetArch === 0 ? 60 : 0);
      exp = 0;
      speedMultiplier = 1;
      document.getElementById('speed-label').innerText = '1x';
      activeBaitTimer = 0;
      activeBaitKey = '0+';
      fountainBuff = 0;
      totalCaughtCount = 0;
      rareCaughtCount = 0;
      playSeconds = 0;
      kaomojiClickCount = 0;

      Object.keys(b).forEach(k => b[k] = 0);
      Object.keys(archieve).forEach(k => {
        if (k !== 'hidden_reset') archieve[k][0] = 1;
      });
      Object.keys(weapon).forEach(k => weapon[k][0] = (k === 'trash') ? 1 : 0);
      Object.keys(buff).forEach(k => buff[k][0] = (k === '0+') ? 1 : 0);

      cancelResetData();
      closeModals();

      document.getElementById('log-box').innerHTML = '';
      addLog("🔄 存檔已完全清除，遊戲進度已重新開始！");

      updateUI("　　　　　　︵\n（。＾▽＾）/　　\\");
      saveGame();
    }

    function handleKaomojiClick() {
      kaomojiClickCount++;
      showFloatText("✨ 點擊表情互動！", "#38bdf8");
      
      if (archieve['hidden_kaomoji'] && archieve['hidden_kaomoji'][0] === 1) {
        archieve['hidden_kaomoji'][0] = 0;
        const reward = archieve['hidden_kaomoji'][2];
        coin += reward;
        playSound('achievement');
        addLog(`🏆 隱藏成就解鎖 [${archieve['hidden_kaomoji'][3].split(' ')[0]}]！獎勵 +${reward} 金幣`);
      }
    }

    function getFountainCost() {
      return Math.pow(5, fountainBuff);
    }

    function makeAWish() {
      if (fountainBuff >= 50) {
        addLog("⛲ 許願池 Buff 已達到最大值 +50%！");
        return;
      }

      const cost = getFountainCost();
      if (coin < cost) {
        addLog(`❌ 金幣不足！許願需要 ${cost.toLocaleString()} 金幣 (目前金幣: ${Math.floor(coin)})`);
        return;
      }

      coin -= cost;
      playSound('buy');

      const success = Math.random() < 0.5;
      if (success) {
        fountainBuff += 1;
        playSound('rare');
        addLog(`✨ 許願成功！許願池 Buff 提升至 +${fountainBuff}% (花費 ${cost.toLocaleString()} 金幣)`);
        showFloatText(`⛲ 許願成功！\n+1% Buff`, '#ec4899');
      } else {
        fountainBuff = 0;
        playSound('catch');
        addLog(`💥 許願失敗！運氣不佳，許願池 Buff 歸零了... (花費 ${cost.toLocaleString()} 金幣)`);
        showFloatText(`💥 許願失敗\nBuff 歸零`, '#f43f5e');
      }

      saveGame();
      renderFountain();
      updateUI();
    }

    function renderFountain() {
      document.getElementById('fountain-buff-val').innerText = `+${fountainBuff}%`;
      const cost = getFountainCost();
      document.getElementById('fountain-cost').innerText = `${cost.toLocaleString()} 金幣`;

      const btn = document.getElementById('btn-wish');
      if (fountainBuff >= 50) {
        btn.disabled = true;
        btn.className = "w-full bg-slate-700 text-slate-500 font-bold py-3.5 rounded-xl cursor-not-allowed text-sm mt-2";
        btn.innerText = "已達到最高 +50% 上限";
      } else {
        btn.disabled = false;
        btn.className = "w-full bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-slate-950 font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 text-sm mt-2";
        btn.innerHTML = `<span>🪙</span> 投入金幣許願 (${cost.toLocaleString()}G)`;
      }
    }

    // Casino Minigames Logic
    function switchCasinoTab(tab) {
      document.getElementById('casino-bj').classList.add('hidden');
      document.getElementById('casino-slot').classList.add('hidden');
      document.getElementById('casino-dice').classList.add('hidden');

      document.getElementById('tab-bj').className = "py-2 px-1 font-bold text-xs bg-slate-900 text-slate-400 border border-slate-700 rounded-xl transition-colors";
      document.getElementById('tab-slot').className = "py-2 px-1 font-bold text-xs bg-slate-900 text-slate-400 border border-slate-700 rounded-xl transition-colors";
      document.getElementById('tab-dice').className = "py-2 px-1 font-bold text-xs bg-slate-900 text-slate-400 border border-slate-700 rounded-xl transition-colors";

      if (tab === 'bj') {
        document.getElementById('casino-bj').classList.remove('hidden');
        document.getElementById('tab-bj').className = "py-2 px-1 font-bold text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 rounded-xl transition-colors";
      } else if (tab === 'slot') {
        document.getElementById('casino-slot').classList.remove('hidden');
        document.getElementById('tab-slot').className = "py-2 px-1 font-bold text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 rounded-xl transition-colors";
      } else if (tab === 'dice') {
        document.getElementById('casino-dice').classList.remove('hidden');
        document.getElementById('tab-dice').className = "py-2 px-1 font-bold text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 rounded-xl transition-colors";
      }
    }

    // 21點 邏輯
    let bjState = { player: [], dealer: [], bet: 0, active: false };
    const suits = ['♠', '♥', '♦', '♣'];
    const cardValues = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    function getRandomCard() {
      const num = Math.floor(Math.random() * 13) + 1;
      const suit = suits[Math.floor(Math.random() * suits.length)];
      const rank = cardValues[num - 1];
      let value = num;
      if (value > 10) value = 10;
      return { num, value, suit, rank };
    }

    function calculateHand(cards) {
      let sum = 0;
      let aces = 0;
      for (let c of cards) {
        if (c.num === 1) { aces++; sum += 11; }
        else sum += c.value;
      }
      while (sum > 21 && aces > 0) {
        sum -= 10;
        aces--;
      }
      return sum;
    }

    function renderCardElement(card) {
      const isRed = card.suit === '♥' || card.suit === '♦';
      const colorClass = isRed ? 'text-rose-400 bg-rose-950/40 border-rose-500/40' : 'text-slate-100 bg-slate-900 border-slate-600/60';
      return `<span class="inline-flex flex-col items-center justify-center w-8 h-11 rounded-lg border ${colorClass} text-[11px] font-bold shadow-sm select-none">
        <span>${card.rank}</span>
        <span class="text-xs leading-none">${card.suit}</span>
      </span>`;
    }

    function bjStart() {
      const betInput = parseInt(document.getElementById('bj-bet').value) || 0;
      if (betInput <= 0 || coin < betInput) {
        addLog("❌ 21點下注金額大於目前擁有金幣！");
        return;
      }

      coin -= betInput;
      bjState.bet = betInput;
      bjState.player = [getRandomCard(), getRandomCard()];
      bjState.dealer = [getRandomCard(), getRandomCard()];
      bjState.active = true;

      document.getElementById('bj-btn-start').disabled = true;
      document.getElementById('bj-btn-start').className = "flex-1 bg-slate-800 text-slate-500 font-bold py-2.5 rounded-xl cursor-not-allowed";
      document.getElementById('bj-btn-hit').disabled = false;
      document.getElementById('bj-btn-hit').className = "flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl shadow active:scale-95 transition-all";
      document.getElementById('bj-btn-stand').disabled = false;
      document.getElementById('bj-btn-stand').className = "flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow active:scale-95 transition-all";

      updateBjUI(false);
      addLog(`🃏 21點開始，下注 ${betInput} 金幣`);
    }

    function updateBjUI(revealDealer) {
      document.getElementById('bj-player-cards').innerHTML = bjState.player.map(c => renderCardElement(c)).join('');
      document.getElementById('bj-player-score').innerText = calculateHand(bjState.player);

      if (revealDealer) {
        document.getElementById('bj-dealer-cards').innerHTML = bjState.dealer.map(c => renderCardElement(c)).join('');
        document.getElementById('bj-dealer-score').innerText = calculateHand(bjState.dealer);
      } else {
        document.getElementById('bj-dealer-cards').innerHTML = renderCardElement(bjState.dealer[0]) + `<span class="inline-flex items-center justify-center w-8 h-11 rounded-lg border border-slate-700 bg-slate-900 text-slate-500 text-xs font-bold shadow-sm">🂠</span>`;
        document.getElementById('bj-dealer-score').innerText = '?';
      }
    }

    function bjHit() {
      if (!bjState.active) return;
      bjState.player.push(getRandomCard());
      updateBjUI(false);

      const pScore = calculateHand(bjState.player);
      const pCount = bjState.player.length;

      if (pScore <= 21 && pCount >= 5) {
        bjEnd(`達成過五關！(5張牌未爆) 你贏得了 +${bjState.bet * 2} 金幣！`, bjState.bet * 2);
        playSound('rare');
        return;
      }

      if (pScore > 21) {
        bjEnd("爆牌！你輸了這局。", 0);
      } else if (pScore === 21) {
        bjStand();
      }
    }

    function bjStand() {
      if (!bjState.active) return;
      let dScore = calculateHand(bjState.dealer);
      while (dScore < 17) {
        bjState.dealer.push(getRandomCard());
        dScore = calculateHand(bjState.dealer);
      }
      updateBjUI(true);

      const pScore = calculateHand(bjState.player);
      const finalDealerScore = calculateHand(bjState.dealer);

      if (dScore > 21) {
        bjEnd(`莊家爆牌！你贏得了 +${bjState.bet * 2} 金幣！`, bjState.bet * 2);
      } else if (pScore > dScore) {
        bjEnd(`點數較大！你贏得了 +${bjState.bet * 2} 金幣！`, bjState.bet * 2);
      } else if (pScore === dScore) {
        bjEnd(`平手！退回下注金幣 (${bjState.bet})`, bjState.bet);
      } else {
        bjEnd(`莊家點數較高，你輸了！`, 0);
      }
    }

    function bjEnd(msg, payout) {
      bjState.active = false;
      coin += payout;
      document.getElementById('bj-status').innerText = msg;
      addLog(`🃏 21點結果: ${msg}`);

      document.getElementById('bj-btn-start').disabled = false;
      document.getElementById('bj-btn-start').className = "flex-1 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold py-2.5 rounded-xl shadow active:scale-95 transition-all";
      document.getElementById('bj-btn-hit').disabled = true;
      document.getElementById('bj-btn-hit').className = "flex-1 bg-slate-800 text-slate-500 font-bold py-2.5 rounded-xl cursor-not-allowed";
      document.getElementById('bj-btn-stand').disabled = true;
      document.getElementById('bj-btn-stand').className = "flex-1 bg-slate-800 text-slate-500 font-bold py-2.5 rounded-xl cursor-not-allowed";
      updateUI();
      saveGame();
    }

    // 老虎機 邏輯
    const slotEmojis = ['🐟', '🐙', '⭐', '🦈', '💎', '🐳'];
    let isSlotSpinning = false;

    function spinSlot() {
      if (isSlotSpinning) return;
      const bet = parseInt(document.getElementById('slot-bet').value) || 0;
      if (bet <= 0 || coin < bet) {
        addLog("❌ 老虎機下注金額不足！");
        return;
      }

      isSlotSpinning = true;
      coin -= bet;
      playSound('buy');
      document.getElementById('slot-btn').disabled = true;
      document.getElementById('slot-btn').className = "w-full bg-slate-700 text-slate-400 font-bold py-3 rounded-xl cursor-not-allowed";
      document.getElementById('slot-status').innerText = "🎰 拉霸轉動中...";

      const s1Final = slotEmojis[Math.floor(Math.random() * slotEmojis.length)];
      const s2Final = slotEmojis[Math.floor(Math.random() * slotEmojis.length)];
      const s3Final = slotEmojis[Math.floor(Math.random() * slotEmojis.length)];

      const el1 = document.getElementById('slot-1');
      const el2 = document.getElementById('slot-2');
      const el3 = document.getElementById('slot-3');

      let timer1, timer2, timer3;

      // 轉動特效動畫
      timer1 = setInterval(() => {
        el1.innerText = slotEmojis[Math.floor(Math.random() * slotEmojis.length)];
        el1.style.transform = "scale(0.85)";
        setTimeout(() => el1.style.transform = "scale(1)", 50);
      }, 70);

      timer2 = setInterval(() => {
        el2.innerText = slotEmojis[Math.floor(Math.random() * slotEmojis.length)];
        el2.style.transform = "scale(0.85)";
        setTimeout(() => el2.style.transform = "scale(1)", 50);
      }, 70);

      timer3 = setInterval(() => {
        el3.innerText = slotEmojis[Math.floor(Math.random() * slotEmojis.length)];
        el3.style.transform = "scale(0.85)";
        setTimeout(() => el3.style.transform = "scale(1)", 50);
      }, 70);

      // 第一輪停止 (左邊)
      setTimeout(() => {
        clearInterval(timer1);
        el1.innerText = s1Final;
        playSound('catch');
      }, 600);

      // 第二輪停止 (中間)
      setTimeout(() => {
        clearInterval(timer2);
        el2.innerText = s2Final;
        playSound('catch');
      }, 1100);

      // 第三輪停止 (右邊) 並結算
      setTimeout(() => {
        clearInterval(timer3);
        el3.innerText = s3Final;
        isSlotSpinning = false;
        document.getElementById('slot-btn').disabled = false;
        document.getElementById('slot-btn').className = "w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-slate-950 font-bold py-3 rounded-xl shadow active:scale-95 transition-all";

        let winMultiplier = 0;
        if (s1Final === s2Final && s2Final === s3Final) {
          winMultiplier = (s1Final === '💎' || s1Final === '🐳') ? 20 : 10;
        } else if (s1Final === s2Final || s2Final === s3Final || s1Final === s3Final) {
          winMultiplier = 3;
        }

        const payout = bet * winMultiplier;
        if (payout > 0) {
          coin += payout;
          playSound('rare');
          document.getElementById('slot-status').innerText = `🎉 中獎！獲得 +${payout} 金幣 (${winMultiplier}倍)`;
          addLog(`🎰 老虎機中獎！ (${s1Final} ${s2Final} ${s3Final}) 贏得 +${payout} 金幣`);
        } else {
          document.getElementById('slot-status').innerText = `😢 未中獎 (${s1Final} ${s2Final} ${s3Final})，再接再厲！`;
          addLog(`🎰 老虎機未中獎，損失 ${bet} 金幣`);
        }

        updateUI();
        saveGame();
      }, 1600);
    }

    // 骰子比大小 邏輯
    const diceIcons = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    function playDice(choice) {
      const bet = parseInt(document.getElementById('dice-bet').value) || 0;
      if (bet <= 0 || coin < bet) {
        addLog("❌ 骰子下注金額不足！");
        return;
      }

      coin -= bet;
      playSound('buy');

      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const d3 = Math.floor(Math.random() * 6) + 1;

      document.getElementById('dice-1').innerText = diceIcons[d1 - 1];
      document.getElementById('dice-2').innerText = diceIcons[d2 - 1];
      document.getElementById('dice-3').innerText = diceIcons[d3 - 1];

      const sum = d1 + d2 + d3;
      let result = '';
      if (d1 === d2 && d2 === d3) {
        result = 'triple';
      } else if (sum >= 4 && sum <= 10) {
        result = 'small';
      } else {
        result = 'big';
      }

      if (result === 'triple') {
        document.getElementById('dice-status').innerText = `💥 骰子總和 ${sum}點 (圍骰全吃)！您輸了。`;
        addLog(`🎲 骰子開出圍骰 (${sum}點)，通吃！損失 ${bet} 金幣`);
      } else if (result === choice) {
        coin += bet * 2;
        playSound('rare');
        document.getElementById('dice-status').innerText = `🎉 骰子總和 ${sum}點 (${result === 'big' ? '大' : '小'})！你贏了 +${bet * 2} 金幣！`;
        addLog(`🎲 骰子猜對！贏得 +${bet * 2} 金幣`);
      } else {
        document.getElementById('dice-status').innerText = `😢 骰子總和 ${sum}點 (${result === 'big' ? '大' : '小'})，你猜錯了！`;
        addLog(`🎲 骰子猜錯，損失 ${bet} 金幣`);
      }

      updateUI();
      saveGame();
    }

    function gameLoop() {
      let k = 0;
      if (coin > 0) {
        k = 1;
        coin -= 1;
      }

      playSeconds++;

      if (activeBaitKey !== '0+' && activeBaitTimer > 0) {
        activeBaitTimer--;
        if (activeBaitTimer <= 0) {
          activeBaitKey = '0+';
          addLog("⏳ 魚餌時效已結束，恢復為預設蚯蚓魚餌。");
        }
      }

      let currentWeaponRate = 0.02;
      for (const key of Object.keys(weapon)) {
        if (weapon[key][0] === 1) {
          currentWeaponRate = weapon[key][2];
        }
      }
      const baitRate = buff[activeBaitKey] ? buff[activeBaitKey][2] : 0.01;
      const fountainRate = fountainBuff / 100;
      const combinedRate = currentWeaponRate + baitRate + fountainRate;

      let face = "　　　　　　︵\n（。＾▽＾）/　　\\";

      if (k === 1) {
        if (Math.random() < combinedRate) {
          if (Math.random() < 0.5) {
            face = "/(ㄒoㄒ)/~~";
            showFloatText("🌊 啥都沒有 (落空)\n+0 金幣", "#94a3b8");
            addLog("🌊 啥都沒有 (落空) +0 金幣");
          } else {
            const weights = {
              'tier0': 10000,
              'tier1': 8000,
              'tier2': 4000,
              'tier3': 2000,
              'tier4': 500,
              'tier5': 1
            };
            const totalWeight = Object.values(weights).reduce((acc, w) => acc + w, 0);
            let randWeight = Math.random() * totalWeight;
            let targetTier = 'tier0';
            for (const [tier, w] of Object.entries(weights)) {
              if (randWeight < w) {
                targetTier = tier;
                break;
              }
              randWeight -= w;
            }

            const availableFish = fishDataList.filter(f => f.tier === targetTier);
            const chosenFish = availableFish[Math.floor(Math.random() * availableFish.length)];

            const fishKey = chosenFish.id;
            const fishName = chosenFish.name;
            const rewardCoin = a[fishKey];
            const fishExp = fishMeta[targetTier].exp;
            const tierName = fishMeta[targetTier].name;

            b[fishKey] += 1;
            coin += rewardCoin;
            exp += fishExp;
            totalCaughtCount++;

            if (targetTier === 'tier3' || targetTier === 'tier4' || targetTier === 'tier5') {
              rareCaughtCount++;
            }

            if (targetTier === 'tier3' && archieve['tier3_unlocked'] && archieve['tier3_unlocked'][0] === 1) {
              archieve['tier3_unlocked'][0] = 0;
              coin += archieve['tier3_unlocked'][2];
              addLog(`🏆 成就解鎖 [${archieve['tier3_unlocked'][3]}]！獎勵 +${archieve['tier3_unlocked'][2]} 金幣`);
            }
            if (targetTier === 'tier4' && archieve['tier4_unlocked'] && archieve['tier4_unlocked'][0] === 1) {
              archieve['tier4_unlocked'][0] = 0;
              coin += archieve['tier4_unlocked'][2];
              addLog(`🏆 成就解鎖 [${archieve['tier4_unlocked'][3]}]！獎勵 +${archieve['tier4_unlocked'][2]} 金幣`);
            }
            if (targetTier === 'tier5' && archieve['tier5_unlocked'] && archieve['tier5_unlocked'][0] === 1) {
              archieve['tier5_unlocked'][0] = 0;
              coin += archieve['tier5_unlocked'][2];
              addLog(`🏆 成就解鎖 [${archieve['tier5_unlocked'][3]}]！獎勵 +${archieve['tier5_unlocked'][2]} 金幣`);
            }

            if (targetTier === 'tier5') {
              face = "\n~\\(≧▽≦)/~";
              playSound('epic');
              showFloatText(`🌟 史詩【${fishName}】!\n+${rewardCoin}G  +${fishExp}EXP`, '#f43f5e');
              addLog(`🌟 釣中史詩級【${fishName}】! 獲得 +${rewardCoin} 金幣, +${fishExp} EXP`);
            } else if (targetTier === 'tier4') {
              face = "\n~\\(≧▽≦)/~";
              playSound('rare');
              showFloatText(`🔥 傳說【${fishName}】!\n+${rewardCoin}G  +${fishExp}EXP`, '#c084fc');
              addLog(`🔥 釣中傳說級【${fishName}】! 獲得 +${rewardCoin} 金幣, +${fishExp} EXP`);
            } else if (targetTier === 'tier3') {
              face = "\no(￣▽￣)ｄ";
              playSound('catch');
              showFloatText(`✨ 稀有【${fishName}】\n+${rewardCoin}G  +${fishExp}EXP`, '#fbbf24');
              addLog(`✨ 釣中稀有級【${fishName}】! 獲得 +${rewardCoin} 金幣, +${fishExp} EXP`);
            } else {
              face = "\no(￣▽￣)ｄ";
              playSound('catch');
              showFloatText(`🐟 【${fishName}】\n+${rewardCoin}G  +${fishExp}EXP`, '#38bdf8');
              addLog(`🐟 釣中【${fishName}】(${tierName})! 獲得 +${rewardCoin} 金幣, +${fishExp} EXP`);
            }
          }
        }

        coin += checkAchievements();
        updateUI(face);
      } else {
        face = "(；′⌒`)";
        updateUI(face);
      }

      if (Math.random() < 0.1) saveGame();

      setTimeout(gameLoop, 1000 / speedMultiplier);
    }

    function checkAchievements() {
      let reward = 0;
      for (const key of Object.keys(archieve)) {
        if (archieve[key][0] === 1) {
          const rewardAmount = archieve[key][2];
          const descName = archieve[key][3];
          let conditionMet = false;

          if (key === 'level_1' && exp >= 5) conditionMet = true;
          if (key === 'level_2' && exp >= 25) conditionMet = true;
          if (key === 'level_3' && exp >= 125) conditionMet = true;
          if (key === 'level_4' && exp >= 625) conditionMet = true;
          if (key === 'level_5' && exp >= 3125) {
            conditionMet = true;
            if (archieve['hidden_exp5'] && archieve['hidden_exp5'][0] === 1) {
              archieve['hidden_exp5'][0] = 0;
              const expReward = archieve['hidden_exp5'][2];
              coin += expReward;
              playSound('achievement');
              addLog(`🏆 隱藏成就解鎖 [${archieve['hidden_exp5'][3].split(' ')[0]}]！獎勵 +${expReward} 金幣`);
            }
          }

          if (key === 'hidden_coins86400' && coin >= 86400) {
            conditionMet = true;
            if (archieve['hidden_coins86400'][0] === 1) {
              archieve['hidden_coins86400'][0] = 0;
              coin += archieve['hidden_coins86400'][2];
              playSound('achievement');
              addLog(`🏆 隱藏成就解鎖 [${archieve['hidden_coins86400'][3].split(' ')[0]}]！獎勵 +${archieve['hidden_coins86400'][2]} 金幣`);
            }
          }

          if (key === 'hidden_fullphoto') {
            const allPhoto = fishDataList.every(fish => (b[fish.id] || 0) > 0);
            if (allPhoto) {
              conditionMet = true;
              if (archieve['hidden_fullphoto'][0] === 1) {
                archieve['hidden_fullphoto'][0] = 0;
                coin += archieve['hidden_fullphoto'][2];
                playSound('achievement');
                addLog(`🏆 隱藏成就解鎖 [${archieve['hidden_fullphoto'][3].split(' ')[0]}]！獎勵 +${archieve['hidden_fullphoto'][2]} 金幣`);
              }
            }
          }

          if (key === 'hidden_fullarch') {
            const otherArchKeys = Object.keys(archieve).filter(k => k !== 'hidden_fullarch');
            const allOtherUnlocked = otherArchKeys.every(k => archieve[k][0] === 0);
            if (allOtherUnlocked) {
              conditionMet = true;
              if (archieve['hidden_fullarch'][0] === 1) {
                archieve['hidden_fullarch'][0] = 0;
                coin += archieve['hidden_fullarch'][2];
                playSound('achievement');
                addLog(`🏆 隱藏成就解鎖 [${archieve['hidden_fullarch'][3].split(' ')[0]}]！獎勵 +${archieve['hidden_fullarch'][2]} 金幣`);
              }
            }
          }

          if (conditionMet) {
            archieve[key][0] = 0;
            reward += rewardAmount;
            playSound('achievement');
            const cleanTitle = descName.split(' ')[0];
            addLog(`🏆 解鎖成就 [${cleanTitle}]！獎勵 +${rewardAmount} 金幣`);
          }
        }
      }
      return reward;
    }

    function updateUI(faceText) {
      let currentWeaponName = '竹竿';
      let currentWeaponRate = 0.02;
      for (const key of Object.keys(weapon)) {
        if (weapon[key][0] === 1) {
          currentWeaponName = weapon[key][5];
          currentWeaponRate = weapon[key][2];
        }
      }

      const baitName = buff[activeBaitKey] ? buff[activeBaitKey][1] : '蚯蚓魚餌';
      const currentBaitRate = buff[activeBaitKey] ? buff[activeBaitKey][2] : 0.01;
      const fountainRate = fountainBuff / 100;
      const combinedRate = currentWeaponRate + currentBaitRate + fountainRate;

      document.getElementById('stat-coins').innerText = Math.floor(coin).toLocaleString();
      document.getElementById('stat-time-str').innerText = formatTime(Math.floor(coin));

      const expLevels = [5, 25, 125, 625, 3125];
      let currentLevel = 0;
      let nextExp = expLevels[0];

      for (let i = 0; i < expLevels.length; i++) {
        if (exp >= expLevels[i]) {
          currentLevel = i + 1;
          nextExp = expLevels[i + 1] || expLevels[i];
        } else {
          nextExp = expLevels[i];
          break;
        }
      }

      if (exp >= 3125) {
        document.getElementById('stat-exp').innerText = `Lv.5 (MAX)`;
      } else {
        document.getElementById('stat-exp').innerText = `Lv.${currentLevel} (${exp}/${nextExp})`;
      }

      document.getElementById('stat-rod').innerText = `${currentWeaponName} (${(currentWeaponRate * 100).toFixed(0)}%)`;

      let buffText = `${baitName}`;
      if (fountainBuff > 0) {
        buffText += ` +⛲+${fountainBuff}%`;
      }
      document.getElementById('stat-buff').innerText = `${buffText} (+${(combinedRate * 100).toFixed(1)}%)`;

      if (faceText) {
        document.getElementById('kaomoji-display').textContent = faceText;
      }
    }

    function showFloatText(text, colorHex) {
      const container = document.getElementById('float-container');
      const div = document.createElement('div');
      div.className = 'float-text text-sm sm:text-base text-center whitespace-pre-line';
      div.style.color = colorHex;
      div.innerText = text;

      const randomX = (Math.random() - 0.5) * 50;
      div.style.transform = `translateX(${randomX}px)`;

      container.appendChild(div);

      setTimeout(() => {
        if (div.parentNode) div.parentNode.removeChild(div);
      }, 1300);
    }

    function formatTime(totalSeconds) {
      let ss = "";
      let tt = Math.max(0, totalSeconds);
      if (Math.floor(tt / 3600) > 0) {
        ss += Math.floor(tt / 3600) + "時";
        tt %= 3600;
      }
      if (Math.floor(tt / 60) > 0) {
        ss += Math.floor(tt / 60) + "分";
        tt %= 60;
      }
      ss += tt + "秒";
      return ss || "0秒";
    }

    function addLog(msg) {
      const logBox = document.getElementById('log-box');
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const div = document.createElement('div');
      div.className = "hover:bg-slate-800/50 px-1 rounded transition-colors";
      div.innerText = `[${timeStr}] ${msg}`;
      logBox.appendChild(div);
      logBox.scrollTop = logBox.scrollHeight;
    }

    function toggleSpeed() {
      if (speedMultiplier === 1) speedMultiplier = 2;
      else if (speedMultiplier === 2) speedMultiplier = 4;
      else if (speedMultiplier === 4) speedMultiplier = 8;
      else speedMultiplier = 1;

      document.getElementById('speed-label').innerText = `${speedMultiplier}x`;
      addLog(`⚡ 遊戲速度已調整為 ${speedMultiplier}x`);

      if (speedMultiplier === 8 && archieve['hidden_speed8x'] && archieve['hidden_speed8x'][0] === 1) {
        archieve['hidden_speed8x'][0] = 0;
        const reward = archieve['hidden_speed8x'][2];
        coin += reward;
        playSound('achievement');
        addLog(`🏆 隱藏成就解鎖 [${archieve['hidden_speed8x'][3].split(' ')[0]}]！獎勵 +${reward} 金幣`);
      }
    }

    function openModal(id) {
      document.getElementById('modal-backdrop').classList.remove('hidden');
      document.getElementById(id).classList.remove('hidden');

      if (id === 'modal-shop') renderShop();
      if (id === 'modal-fountain') renderFountain();
      if (id === 'modal-photo') renderEncyclopedia();
      if (id === 'modal-archive') renderAchievements();
      if (id === 'modal-stats') renderStats();
    }

    function closeModals() {
      document.getElementById('modal-backdrop').classList.add('hidden');
      document.getElementById('modal-shop').classList.add('hidden');
      document.getElementById('modal-fountain').classList.add('hidden');
      document.getElementById('modal-casino').classList.add('hidden');
      document.getElementById('modal-photo').classList.add('hidden');
      document.getElementById('modal-archive').classList.add('hidden');
      document.getElementById('modal-stats').classList.add('hidden');
    }

    function switchShopTab(tab) {
      const rodList = document.getElementById('shop-rod-list');
      const baitList = document.getElementById('shop-bait-list');
      const tabRod = document.getElementById('tab-rod');
      const tabBait = document.getElementById('tab-bait');

      if (tab === 'rod') {
        rodList.classList.remove('hidden');
        baitList.classList.add('hidden');
        tabRod.className = "flex-1 py-2.5 font-bold text-xs sm:text-sm border-b-2 border-amber-400 text-amber-400 transition-colors";
        tabBait.className = "flex-1 py-2.5 font-bold text-xs sm:text-sm border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors";
      } else {
        rodList.classList.add('hidden');
        baitList.classList.remove('hidden');
        tabBait.className = "flex-1 py-2.5 font-bold text-xs sm:text-sm border-b-2 border-emerald-400 text-emerald-400 transition-colors";
        tabRod.className = "flex-1 py-2.5 font-bold text-xs sm:text-sm border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors";
      }
    }

    function renderShop() {
      const rodContainer = document.getElementById('shop-rod-list');
      rodContainer.innerHTML = '';

      const rodKeys = Object.keys(weapon);
      for (let i = 0; i < rodKeys.length; i++) {
        const key = rodKeys[i];
        const rod = weapon[key];
        const [isOwned, engName, rate, price, reqExp, name] = rod;
        const canAfford = coin >= price;
        const expReached = exp >= reqExp;

        let specialConditionMet = true;
        let conditionDesc = `需 EXP: ${reqExp}`;

        if (key === 'legent') {
          const allArchUnlocked = Object.values(archieve).every(item => item[0] === 0);
          specialConditionMet = allArchUnlocked;
          conditionDesc = allArchUnlocked ? '已達成全成就解鎖' : '需解鎖所有成就';
        } else if (key === 'excellent') {
          const allEncyclopediaUnlocked = fishDataList.every(fish => (b[fish.id] || 0) > 0);
          specialConditionMet = allEncyclopediaUnlocked;
          conditionDesc = allEncyclopediaUnlocked ? '已達成全圖鑑解鎖' : `需解鎖所有魚類圖鑑`;
        } else if (key === 'great') {
          const hasEpic = fishDataList.filter(f => f.tier === 'tier5').some(f => (b[f.id] || 0) > 0);
          specialConditionMet = hasEpic;
          conditionDesc = hasEpic ? '已釣過史詩魚' : '需釣到一隻史詩魚';
        } else if (key === 'normal') {
          const timeReached = playSeconds >= 600;
          specialConditionMet = timeReached;
          const minsLeft = Math.ceil((600 - playSeconds) / 60);
          conditionDesc = timeReached ? '遊玩時間已達10分鐘' : `需遊玩 10 分鐘 (剩餘約${minsLeft}分)`;
        }

        let displayConditionText = conditionDesc;
        if (!isOwned && !specialConditionMet && (key === 'legent' || key === 'excellent' || key === 'great' || key === 'normal')) {
          displayConditionText = '解鎖條件: ???';
        }
        if (isOwned || specialConditionMet) {
          displayConditionText = conditionDesc;
        }

        const card = document.createElement('div');
        card.className = "bg-slate-900/90 border border-slate-700/70 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5";

        card.innerHTML = `
          <div>
            <div class="font-bold text-amber-300 text-sm">${name}</div>
            <div class="text-[11px] text-slate-400">咬鉤率: ${(rate * 100).toFixed(0)}% | ${displayConditionText}</div>
          </div>
          <div class="w-full sm:w-auto flex justify-end">
            ${isOwned ? `
              <span class="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-lg">已擁有</span>
            ` : `
              <button onclick="buyRod('${key}')" ${(!canAfford || !expReached || !specialConditionMet) ? 'disabled' : ''} 
                class="w-full sm:w-auto text-xs font-bold px-3 py-2 rounded-lg transition-all ${
                  canAfford && expReached && specialConditionMet
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95' 
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }">
                ${!expReached ? `未達EXP` : (!specialConditionMet ? `條件未達` : `購買 (${price}G)`)}
              </button>
            `}
          </div>
        `;
        rodContainer.appendChild(card);
      }

      const baitContainer = document.getElementById('shop-bait-list');
      baitContainer.innerHTML = '';

      for (const [key, item] of Object.entries(buff)) {
        const [isUnlocked, name, rareRate, price, reqExp] = item;
        const canAfford = coin >= price;
        const expReached = exp >= reqExp;
        const isCurrentlyActive = activeBaitKey === key && (key === '0+' || activeBaitTimer > 0);

        const card = document.createElement('div');
        card.className = "bg-slate-900/90 border border-slate-700/70 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5";

        card.innerHTML = `
          <div>
            <div class="font-bold text-emerald-300 text-sm">${name}</div>
            <div class="text-[11px] text-slate-400">加成: +${(rareRate * 100).toFixed(1)}% ${key !== '0+' ? '| 5分鐘' : '| 預設'}</div>
          </div>
          <div class="w-full sm:w-auto flex justify-end">
            ${isCurrentlyActive ? `
              <span class="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-lg">使用中</span>
            ` : `
              <button onclick="buyBait('${key}')" ${(!canAfford || !expReached) ? 'disabled' : ''} 
                class="w-full sm:w-auto text-xs font-bold px-3 py-2 rounded-lg transition-all ${
                  canAfford && expReached 
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md active:scale-95' 
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }">
                ${!expReached ? `未達EXP (${reqExp})` : (key === '0+' ? '免費裝備' : `使用 (${price}G)`)}
              </button>
            `}
          </div>
        `;
        baitContainer.appendChild(card);
      }
    }

    function buyRod(key) {
      const rod = weapon[key];
      if (!rod) return;
      const [isOwned, engName, rate, price, reqExp, name] = rod;

      let specialConditionMet = true;
      if (key === 'legent') {
        specialConditionMet = Object.values(archieve).every(item => item[0] === 0);
      } else if (key === 'excellent') {
        specialConditionMet = fishDataList.every(fish => (b[fish.id] || 0) > 0);
      } else if (key === 'great') {
        specialConditionMet = fishDataList.filter(f => f.tier === 'tier5').some(f => (b[f.id] || 0) > 0);
      } else if (key === 'normal') {
        specialConditionMet = playSeconds >= 600;
      }

      if (isOwned || exp < reqExp || coin < price || !specialConditionMet) return;

      coin -= price;
      weapon[key][0] = 1;
      playSound('buy');
      addLog(`🎉 成功購買並裝備了 【${name}】！`);
      saveGame();
      renderShop();
      updateUI();
    }

    function buyBait(key) {
      const baitItem = buff[key];
      if (!baitItem) return;
      const [isUnlocked, name, rareRate, price, reqExp] = baitItem;

      if (exp < reqExp || coin < price) return;

      if (price > 0) coin -= price;

      activeBaitKey = key;
      if (key !== '0+') {
        activeBaitTimer = 300;
        addLog(`✨ 成功使用 【${name}】！機率提升 +${(rareRate * 100).toFixed(1)}%，持續 5 分鐘`);
      } else {
        activeBaitTimer = 0;
        addLog(`🪱 已更換為 【預設蚯蚓魚餌】`);
      }

      playSound('buy');
      saveGame();
      renderShop();
      updateUI();
    }

    function renderEncyclopedia() {
      const grid = document.getElementById('photo-grid');
      grid.innerHTML = '';
      let unlockedCount = 0;

      fishDataList.forEach(fish => {
        const key = fish.id;
        const count = b[key] || 0;
        if (count > 0) unlockedCount++;

        const tierMeta = fishMeta[fish.tier];
        const card = document.createElement('div');
        card.className = `p-2 rounded-xl border text-center transition-all flex flex-col justify-center items-center ${
          count > 0 
            ? `${tierMeta.color} shadow-sm`
            : 'bg-slate-900/40 border-slate-800/80 text-slate-600 opacity-60'
        }`;

        card.innerHTML = `
          <div class="text-[9px] px-1.5 py-0.5 rounded inline-block mb-1 bg-slate-900/60 border border-slate-700/50">${tierMeta.name}</div>
          <div class="text-xs font-bold truncate w-full">${count > 0 ? fish.name : '???'}</div>
          <div class="text-[9px] mt-0.5 text-slate-400">已捕捉: ${count}</div>
          <div class="text-[9px] text-amber-400/80">價值: ${a[key]}G</div>
        `;
        grid.appendChild(card);
      });

      document.getElementById('encyclopedia-count').innerText = `已解鎖: ${unlockedCount} / ${fishDataList.length}`;
    }

    function renderAchievements() {
      const list = document.getElementById('archive-list');
      list.innerHTML = '';

      for (const [key, item] of Object.entries(archieve)) {
        const [isLocked, target, rewardCoin, descName, isHidden] = item;
        let displayName = descName;
        if (isHidden && isLocked === 1) {
          displayName = '隱藏成就';
        }

        const card = document.createElement('div');
        card.className = "bg-slate-900/90 border border-slate-700/70 rounded-xl p-3 flex justify-between items-center";

        card.innerHTML = `
          <div>
            <div class="font-bold text-xs sm:text-sm ${isLocked === 0 ? 'text-emerald-400' : (isHidden ? 'text-purple-400' : 'text-slate-300')}">${displayName}</div>
            <div class="text-[11px] text-slate-400">獎勵: +${rewardCoin}G</div>
          </div>
          <div>
            ${isLocked === 0 ? `
              <span class="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-lg">✅ 達成</span>
            ` : `
              <span class="text-[11px] font-bold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-lg">🔒 未解鎖</span>
            `}
          </div>
        `;
        list.appendChild(card);
      }
    }

    function renderStats() {
      document.getElementById('stat-total-caught').innerText = `${totalCaughtCount} 尾`;
      document.getElementById('stat-rare-caught').innerText = `${rareCaughtCount} 尾`;
      document.getElementById('stat-total-exp').innerText = `${exp} EXP`;
      document.getElementById('stat-play-time').innerText = formatTime(playSeconds);
    }

    window.onload = function() {
      loadGame();
      addLog("🎣 海中賭場與掛機釣魚系統已成功載入！");
      updateUI();
      gameLoop();
    };
