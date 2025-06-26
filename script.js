const nameMap = {
  'Athletics':              '奧克蘭運動家',
  'Arizona Diamondbacks':   '亞利桑那響尾蛇',
  'Atlanta Braves':         '亞特蘭大勇士',
  'Baltimore Orioles':      '巴爾的摩金鷹',
  'Boston Red Sox':         '波士頓紅襪',
  'Chicago Cubs':           '芝加哥小熊',
  'Chicago White Sox':      '芝加哥白襪',
  'Cincinnati Reds':        '辛辛那提紅人',
  'Cleveland Guardians':    '克里夫蘭守護者',
  'Colorado Rockies':       '科羅拉多洛磯',
  'Detroit Tigers':         '底特律老虎',
  'Houston Astros':         '休士頓太空人',
  'Kansas City Royals':     '堪薩斯皇家',
  'Los Angeles Angels':     '洛杉磯天使',
  'Los Angeles Dodgers':    '洛杉磯道奇',
  'Miami Marlins':          '邁阿密馬林魚',
  'Milwaukee Brewers':      '密爾瓦基釀酒人',
  'Minnesota Twins':        '明尼蘇達雙城',
  'New York Mets':          '紐約大都會',
  'New York Yankees':       '紐約洋基',
  'Oakland Athletics':      '奧克蘭運動家',
  'Philadelphia Phillies':  '費城人',
  'Pittsburgh Pirates':     '匹茲堡海盜',
  'San Diego Padres':       '聖地牙哥教士',
  'San Francisco Giants':   '舊金山巨人',
  'Seattle Mariners':       '西雅圖水手',
  'St. Louis Cardinals':    '聖路易紅雀',
  'Tampa Bay Rays':         '坦帕灣光芒',
  'Texas Rangers':          '德州遊騎兵',
  'Toronto Blue Jays':      '多倫多藍鳥',
  'Washington Nationals':   '華盛頓國民'
};

const STATS_API  = ({ season, group, pool, limit }) =>
  `https://statsapi.mlb.com/api/v1/stats?stats=season&season=${season}` +
  `&group=${group}&sportId=1&playerPool=${pool}&limit=${limit}`;
const ROSTER_API = (teamId, season) =>
  `https://statsapi.mlb.com/api/v1/teams/${teamId}/roster?rosterType=activeRoster&season=${season}`;
const TEAMS_API  = 'https://statsapi.mlb.com/api/v1/teams?sportId=1';

const seasonSelect      = document.querySelector('#season-select');
const teamSelect        = document.querySelector('#team-select');
const typeSelect        = document.querySelector('#player-type-select');
const leaderSelect      = document.querySelector('#leader-select');
const favoritesCheckbox = document.querySelector('#favorites-checkbox');
const playerGrid        = document.querySelector('#player-grid');
const barChart          = document.querySelector('#bar-chart');
const modal             = document.querySelector('#modal');
const modalContent      = document.querySelector('#modal-content');

const FAVORITES_KEY = 'favoritePlayers';
function getFavorites() {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []; }
  catch { return []; }
}
function toggleFavorite(id) {
  const favs = getFavorites();
  const idx  = favs.indexOf(id);
  if (idx === -1) favs.push(id);
  else            favs.splice(idx, 1);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

for (let y = 2000; y <= 2025; y++) seasonSelect.add(new Option(y, y));
seasonSelect.value = new Date().getFullYear();

function PlayerCard(player, classification, season, isFav, index) {
  this.player = player;
  this.id     = player.person.id;
  this.name   = player.person.fullName;
  this.position = player.position.name;
  this.jersey = player.jerseyNumber || 'N/A';
  this.classification = classification;
  this.season = season;
  this.isFav  = isFav;
  this.index  = index;
  this.el     = document.createElement('div');
  this.el.className = 'player-card';
}
PlayerCard.prototype.init = function() {
  this.el.style.animationDelay = `${this.index * 0.05}s`;
  const favBtn = document.createElement('span');
  favBtn.className   = 'fav-btn';
  favBtn.textContent = this.isFav ? '★' : '☆';
  favBtn.title       = this.isFav ? '取消最愛' : '加入最愛';
  favBtn.addEventListener('click', e => {
    e.stopPropagation();
    toggleFavorite(this.id);
    this.isFav = getFavorites().includes(this.id);
    favBtn.textContent = this.isFav ? '★' : '☆';
    favBtn.title       = this.isFav ? '取消最愛' : '加入最愛';
  });

  const img = document.createElement('img');
  img.alt    = this.name;
  img.onerror = () => (img.src = 'placeholder.png');
  img.src    = `https://midfield.mlbstatic.com/v1/people/${this.id}/headshot/67/current`;

  const nameEl   = document.createElement('h2'); nameEl.textContent = this.name;
  const posEl    = document.createElement('p');  posEl.textContent = `位置：${this.position}`;
  const jerseyEl = document.createElement('p');  jerseyEl.textContent = `背號：${this.jersey}`;
  const roleEl   = document.createElement('p');  roleEl.className = 'role-el';
  if (this.classification) roleEl.textContent = `角色：${this.classification}`;

  this.el.append(favBtn, img, nameEl, posEl, jerseyEl, roleEl);
  this.el.addEventListener('click', () => showModal(this.player, this.classification, this.season));
  return this.el;
};

function BarItem(playerId, name, teamEng, value, label, rank) {
  this.playerId = playerId;
  this.name     = name;
  this.teamEng  = teamEng;
  this.value    = value;
  this.label    = label;
  this.rank     = rank;
  this.el       = document.createElement('div');
  this.el.className = 'bar-item';
}
BarItem.prototype.init = function(maxValue) {
  const lbl = document.createElement('div');
  lbl.className = 'bar-label';
  lbl.textContent = `${this.rank}. ${this.name}`;
  lbl.title = this.name;
  const bar = document.createElement('div');
  bar.className = 'bar-value';
  bar.dataset.value = this.value;
  bar.style.width = '0%';
  bar.addEventListener('click', e => {
    e.stopPropagation();
    document.querySelectorAll('.bar-value.active').forEach(b => b.classList.remove('active'));
    bar.classList.toggle('active');
    showBarModal(this.playerId, this.name, this.teamEng, this.value, this.label);
  });
  this.el.append(lbl, bar);
  requestAnimationFrame(() => bar.style.width = `${(this.value / maxValue) * 100}%`);
  return this.el;
};

async function getPitcherRole(id, season) {
  try {
    const sr = await axios.get(
      `https://statsapi.mlb.com/api/v1/people/${id}/stats?stats=season&season=${season}&group=pitching`
    );
    const stat = sr.data.stats[0]?.splits[0]?.stat;
    return stat?.gamesStarted > 0 ? '先發投手' : '後援投手';
  } catch {
    return '';
  }
}

async function loadTeams() {
  try {
    const res = await axios.get(TEAMS_API);
    res.data.teams.sort((a, b) => a.name.localeCompare(b.name))
      .forEach(t => teamSelect.add(new Option(nameMap[t.name] || t.name, t.id)));
    teamSelect.value = teamSelect.options[0].value;
    await loadPlayers();
  } catch (err) {
    console.error('載入球隊失敗：', err);
  }
}

async function loadPlayers() {
  playerGrid.style.display = ''; barChart.style.display = 'none'; leaderSelect.value = '';
  const season = seasonSelect.value, teamId = teamSelect.value;
  const onlyFavs = favoritesCheckbox.checked, favs = getFavorites();
  try {
    const res = await axios.get(ROSTER_API(teamId, season));
    playerGrid.innerHTML = '';
    for (let i = 0; i < res.data.roster.length; i++) {
      const p = res.data.roster[i], id = p.person.id;
      const isPitcher = p.position.type.toLowerCase().includes('pitcher');
      const isHitter  = !isPitcher;
      const isFav     = favs.includes(id);
      if ((onlyFavs && !isFav) ||
          (typeSelect.value === 'pitcher' && !(isPitcher || p.person.fullName === 'Shohei Ohtani')) ||
          (typeSelect.value === 'hitter'  && !(isHitter  || p.person.fullName === 'Shohei Ohtani'))) continue;
      const classification = isPitcher ? await getPitcherRole(id, season) : '';
      const card = new PlayerCard(p, classification, season, isFav, i);
      playerGrid.appendChild(card.init());
    }
  } catch (err) {
    console.error('載入球員列表失敗：', err);
  }
}

async function showModal(p, cls, season) {
  const isPitcher = p.position.type.toLowerCase().includes('pitcher');
  const group = isPitcher ? 'pitching' : 'hitting';
  let statsHtml = '';
  try {
    const sr   = await axios.get(
      `https://statsapi.mlb.com/api/v1/people/${p.person.id}/stats?stats=season&season=${season}&group=${group}`
    );
    const stat = sr.data.stats[0]?.splits[0]?.stat;
    if (stat) {
      if (isPitcher) statsHtml = `\n<h3>投球數據</h3>\n<p>ERA：${stat.era||'N/A'}</p>\n<p>勝投：${stat.wins||'N/A'}</p>\n<p>三振：${stat.strikeOuts||'N/A'}</p>\n<p>救援：${stat.saves||'N/A'}</p>\n`;
      else            statsHtml = `\n<h3>打擊數據</h3>\n<p>打擊率：${stat.avg||'N/A'}</p>\n<p>全壘打：${stat.homeRuns||'N/A'}</p>\n<p>安打：${stat.hits||'N/A'}</p>\n`;
    } else statsHtml = '<p>查無統計資料</p>';
  } catch { statsHtml = '<p>讀取統計失敗</p>'; }
  modalContent.innerHTML = `\n<h2>${p.person.fullName}</h2>\n<p>位置：${p.position.name}</p>\n<p>背號：${p.jerseyNumber||'N/A'}</p>${cls?`<p>角色：${cls}</p>`:''}${statsHtml}\n<button id="video-btn">觀看高光</button>\n<button id="close-btn">關閉</button>`;
  modal.classList.remove('hidden');
  document.querySelector('#close-btn').onclick = () => modal.classList.add('hidden');
  document.querySelector('#video-btn').onclick = () => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(p.person.fullName+' highlights')}`);
}

leaderSelect.addEventListener('change', () => {
  if (!leaderSelect.value) { playerGrid.style.display=''; barChart.style.display='none'; loadPlayers(); }
  else {
    playerGrid.style.display='none'; barChart.style.display='';
    const [stat,label,group] = leaderSelect.value.split('|');
    loadLeaders(stat,label,group);
  }
});
async function loadLeaders(stat,label,group) {
  const season = seasonSelect.value;
  const url    = STATS_API({season,group,pool:'all',limit:5000});
  try {
    const res    = await fetch(url);
    const data   = (await res.json()).stats[0]?.splits||[];
    const list = data.map(d=>({playerId:d.player.id,name:d.player.fullName,team:d.team.name,value:+d.stat[stat]||0}))
                     .filter(d=>d.value>0);
    list.sort((a,b)=>stat==='era'?a.value-b.value:b.value-a.value);
    const top = list.slice(0,20).map((d,i)=>new BarItem(d.playerId,d.name,d.team,d.value,label,i+1));
    barChart.innerHTML='';
    const max = Math.max(...top.map(b=>b.value),1);
    top.forEach(b=>barChart.appendChild(b.init(max)));
  } catch(err) {
    console.error('載入排行失敗：',err);
    barChart.innerHTML='<p class="error-msg">無法取得排行資料</p>';
  }
}

window.addEventListener('click', e=>{ if(e.target===modal) modal.classList.add('hidden'); });
[favoritesCheckbox,typeSelect,seasonSelect,teamSelect].forEach(el=>el.addEventListener('change',loadPlayers));

loadTeams();
