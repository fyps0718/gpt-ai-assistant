const cells = [
  "START","QUIZ","BONUS","EVENT","QUIZ",
  "REST","PENALTY","QUIZ","EVENT","BONUS",
  "QUIZ","REST","EVENT","QUIZ","PENALTY",
  "BONUS","QUIZ","EVENT","REST","QUIZ"
];

let state = { players: [], current: 0, round: 1, started: false };

const boardEl = document.querySelector("#board");
const playersEl = document.querySelector("#players");
const statusEl = document.querySelector("#status");
const logEl = document.querySelector("#log");
const rollBtn = document.querySelector("#rollBtn");

function typeLabel(type) {
  return { START:"起點", QUIZ:"題目", EVENT:"事件", BONUS:"獎勵", PENALTY:"扣分", REST:"休息" }[type] || type;
}

function createPlayers(count) {
  return Array.from({ length: count }, (_, i) => ({ id: i + 1, name: `第 ${i + 1} 組`, position: 0, score: 0, coins: 0 }));
}

function render() {
  boardEl.innerHTML = "";
  cells.forEach((type, index) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    const here = state.players.filter(p => p.position === index);
    cell.innerHTML = `<div><div class="cell-title">${index + 1}. ${typeLabel(type)}</div><small>${type}</small></div><div class="tokens">${here.map(p => `<span class="token">${p.id}</span>`).join("")}</div>`;
    boardEl.appendChild(cell);
  });

  playersEl.innerHTML = state.players.map((p, i) => `<div class="player-card ${i === state.current ? "active" : ""}"><strong>${p.name}</strong><br>位置：${p.position + 1}<br>分數：${p.score}<br>金幣：${p.coins}</div>`).join("");
  if (state.started) statusEl.textContent = `第 ${state.round} 回合｜現在：${state.players[state.current].name}`;
}

function startGame() {
  const count = Number(document.querySelector("#playerCount").value);
  state = { players: createPlayers(count), current: 0, round: 1, started: true };
  rollBtn.disabled = false;
  logEl.textContent = "遊戲開始！";
  render();
}

function applyCell(player, type) {
  if (type === "BONUS") { player.score += 10; player.coins += 20; return "獎勵格：+10 分、+20 金幣。"; }
  if (type === "PENALTY") { player.score = Math.max(0, player.score - 5); return "扣分格：-5 分。"; }
  if (type === "EVENT") { const delta = Math.random() < 0.5 ? 10 : -5; player.score = Math.max(0, player.score + delta); return `事件格：${delta >= 0 ? "+" : ""}${delta} 分。`; }
  if (type === "QUIZ") { player.score += 5; return "題目格（Starter）：暫時自動 +5 分。"; }
  if (type === "START") { player.coins += 10; return "經過／停在起點：+10 金幣。"; }
  return "休息格：本回合沒有額外效果。";
}

function nextTurn() {
  state.current += 1;
  if (state.current >= state.players.length) { state.current = 0; state.round += 1; }
}

function rollDice() {
  if (!state.started) return;
  const player = state.players[state.current];
  const roll = Math.floor(Math.random() * 6) + 1;
  player.position = (player.position + roll) % cells.length;
  const type = cells[player.position];
  const result = applyCell(player, type);
  logEl.textContent = `${player.name} 擲到 ${roll}，移動到第 ${player.position + 1} 格。${result}`;
  nextTurn();
  render();
}

document.querySelector("#startBtn").addEventListener("click", startGame);
rollBtn.addEventListener("click", rollDice);
render();
