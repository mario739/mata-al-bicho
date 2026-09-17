const GAME_DURATION = 30,
    MAX_INSECTS_ON_SCREEN = 3,
    RANKING_KEY = "mataAlBichoRanking";
const INSECTS = [
    {
        id: "mosca-blanca",
        name: "Mosca blanca",
        emoji: "🪰",
        image: "assets/insects/mosca-blanca.jpg",
        type: "harmful",
        points: 10,
        description:
            "Pequeño insecto que succiona savia y puede debilitar las plantas. También puede transmitir enfermedades virales.",
        control:
            "Monitoreo, trampas, manejo integrado y protección de insectos beneficiosos.",
    },
    {
        id: "trips",
        name: "Trips",
        emoji: "🦟",
        image: "assets/insects/trip2.jpg",
        type: "harmful",
        points: 10,
        description:
            "Insecto pequeño que raspa y succiona tejidos. Puede causar manchas, deformaciones y daños en flores y hojas.",
        control:
            "Monitoreo frecuente, trampas adhesivas y manejo integrado según el cultivo.",
    },
    {
        id: "aranuela-roja",
        name: "Arañuela roja",
        emoji: "🕷️",
        image: "assets/insects/aranuela2.png",
        type: "harmful",
        points: 10,
        description:
            "Ácaro que se alimenta de las hojas y puede producir punteado, amarillamiento y pérdida de vigor.",
        control:
            "Revisar el envés de las hojas y favorecer enemigos naturales; aplicar control autorizado cuando corresponda.",
    },
    {
        id: "pulgon",
        name: "Pulgón",
        emoji: "🪲",
        image: "assets/insects/pulgon2.jpg",
        type: "harmful",
        points: 10,
        description:
            "Insecto que succiona savia, puede deformar brotes y hojas y producir melaza que favorece la fumagina.",
        control:
            "Monitoreo, eliminación de focos y conservación de enemigos naturales.",
    },
    {
        id: "mariquita",
        name: "Mariquita",
        emoji: "🐞",
        image: "assets/insects/mariquita.jpg",
        type: "beneficial",
        points: -10,
        description:
            "Muchas mariquitas depredan pulgones y otros pequeños insectos. Son aliadas importantes del control biológico.",
        control:
            "Evitar eliminarlas innecesariamente y conservar refugios y fuentes de alimento.",
    },
    {
        id: "abeja",
        name: "Abeja",
        emoji: "🐝",
        image: "assets/insects/abeja.jpg",
        type: "beneficial",
        points: -10,
        description:
            "Polinizadora importante para numerosos cultivos y plantas. Ayuda a la formación de frutos y semillas.",
        control:
            "Protegerlas y evitar aplicaciones de productos durante la actividad de los polinizadores.",
    },
    {
        id: "escarabajo",
        name: "Escarabajo beneficioso",
        emoji: "🪲",
        image: "assets/insects/escarbajo2.jpg",
        infoImage: "assets/insects/escarbajo2.jpg",
        type: "beneficial",
        points: -10,
        description:
            "Algunos escarabajos son depredadores de plagas y participan en el equilibrio del agroecosistema.",
        control:
            "Identificar antes de eliminar: no todos los escarabajos son plagas.",
    },
    {
        id: "crisopa",
        name: "Crisopa",
        emoji: "🦋",
        image: "assets/insects/crisopa2.jpg",
        type: "beneficial",
        points: -10,
        description:
            "Sus larvas son depredadoras y pueden consumir pulgones, mosca blanca, trips y otros pequeños artrópodos.",
        control:
            "Conservar poblaciones y evitar tratamientos indiscriminados que dañen enemigos naturales.",
    },
];
let score = 0,
    combo = 0,
    bestCombo = 0,
    hits = 0,
    mistakes = 0,
    timeLeft = GAME_DURATION,
    running = false,
    playerName = "",
    timerInterval = null,
    spawnInterval = null,
    audioCtx = null,
    musicGain = null,
    musicInterval = null,
    musicNoteIndex = 0,
    musicEnabled = false;
const $ = (id) => document.getElementById(id),
    startScreen = $("startScreen"),
    gameScreen = $("gameScreen"),
    resultScreen = $("resultScreen"),
    playerNameInput = $("playerName"),
    gameBoard = $("gameBoard"),
    feedback = $("feedback"),
    musicBtn = $("musicBtn");
function ensureAudioContext() {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    if (!audioCtx) audioCtx = new AudioCtor();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
}
function playTone({
    frequency = 440,
    duration = 0.12,
    type = "sine",
    gain = 0.04,
    slideTo = null,
    delay = 0,
}) {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const startAt = ctx.currentTime + delay;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    if (slideTo)
        oscillator.frequency.exponentialRampToValueAtTime(
            Math.max(40, slideTo),
            startAt + duration,
        );

    gainNode.gain.setValueAtTime(0.0001, startAt);
    gainNode.gain.exponentialRampToValueAtTime(gain, startAt + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.04);
}
function playMusicNote() {
    const ctx = ensureAudioContext();
    if (!ctx || !musicGain || !musicEnabled) return;
    const melody = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23];
    const frequency = melody[musicNoteIndex % melody.length];
    const startAt = ctx.currentTime + 0.02;
    const oscillator = ctx.createOscillator();
    const noteGain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, startAt);
    noteGain.gain.setValueAtTime(0.0001, startAt);
    noteGain.gain.exponentialRampToValueAtTime(0.018, startAt + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.42);
    oscillator.connect(noteGain);
    noteGain.connect(musicGain);
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.46);
    musicNoteIndex++;
}
function startBackgroundMusic() {
    const ctx = ensureAudioContext();
    if (!ctx || musicEnabled) return;
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.7;
    musicGain.connect(ctx.destination);
    musicEnabled = true;
    musicNoteIndex = 0;
    playMusicNote();
    musicInterval = setInterval(playMusicNote, 480);
    musicBtn.textContent = "🎵 Música: encendida";
    musicBtn.setAttribute("aria-pressed", "true");
}
function stopBackgroundMusic() {
    musicEnabled = false;
    clearInterval(musicInterval);
    musicInterval = null;
    if (musicGain) {
        musicGain.gain.setTargetAtTime(
            0,
            ensureAudioContext().currentTime,
            0.04,
        );
        musicGain = null;
    }
    musicBtn.textContent = "🎵 Música: apagada";
    musicBtn.setAttribute("aria-pressed", "false");
}
function toggleBackgroundMusic() {
    if (musicEnabled) stopBackgroundMusic();
    else startBackgroundMusic();
}
function playStartSound() {
    playTone({
        frequency: 440,
        duration: 0.12,
        type: "triangle",
        gain: 0.05,
        slideTo: 660,
    });
    setTimeout(
        () =>
            playTone({
                frequency: 660,
                duration: 0.18,
                type: "triangle",
                gain: 0.04,
                slideTo: 880,
            }),
        90,
    );
}
function playHitSound() {
    playTone({
        frequency: 590,
        duration: 0.1,
        type: "square",
        gain: 0.05,
        slideTo: 820,
    });
    setTimeout(
        () =>
            playTone({
                frequency: 820,
                duration: 0.14,
                type: "triangle",
                gain: 0.04,
                slideTo: 960,
            }),
        70,
    );
}
function playMistakeSound() {
    playTone({
        frequency: 220,
        duration: 0.2,
        type: "sawtooth",
        gain: 0.04,
        slideTo: 140,
    });
}
function playEndSound() {
    playTone({
        frequency: 520,
        duration: 0.12,
        type: "triangle",
        gain: 0.05,
        slideTo: 400,
    });
    setTimeout(
        () =>
            playTone({
                frequency: 400,
                duration: 0.18,
                type: "triangle",
                gain: 0.05,
                slideTo: 260,
            }),
        120,
    );
    setTimeout(
        () =>
            playTone({
                frequency: 260,
                duration: 0.22,
                type: "sine",
                gain: 0.04,
                slideTo: 180,
            }),
        240,
    );
}
function showScreen(s) {
    [startScreen, gameScreen, resultScreen].forEach((x) =>
        x.classList.remove("active"),
    );
    ({ start: startScreen, game: gameScreen, result: resultScreen })[
        s
    ].classList.add("active");
    if (s === "start") renderRanking();
}
function updateHUD() {
    $("score").textContent = score;
    $("combo").textContent = combo;
    $("time").textContent = Math.ceil(timeLeft);
    const p = Math.max(0, (timeLeft / GAME_DURATION) * 100);
    $("timeBar").style.width = p + "%";
    $("timeBar").style.background =
        timeLeft <= 8 ? "#e53935" : timeLeft <= 15 ? "#f9a825" : "#43a047";
}
function randomItem(a) {
    return a[Math.floor(Math.random() * a.length)];
}
function getRandomPosition() {
    const width = gameBoard.clientWidth;
    const height = gameBoard.clientHeight;
    const insectWidth = 110;
    const insectHeight = 96;
    const paddingX = Math.max(12, Math.min(70, width * 0.06));
    const paddingY = Math.max(12, Math.min(55, height * 0.08));
    const minX = insectWidth / 2 + paddingX;
    const maxX = Math.max(minX, width - insectWidth / 2 - paddingX);
    const minY = insectHeight / 2 + paddingY;
    const maxY = Math.max(minY, height - insectHeight / 2 - paddingY);
    return {
        x: minX + Math.random() * Math.max(0, maxX - minX),
        y: minY + Math.random() * Math.max(0, maxY - minY),
    };
}
function spawnInsect() {
    if (
        !running ||
        gameBoard.querySelectorAll(".insect").length >= MAX_INSECTS_ON_SCREEN
    )
        return;
    const i = randomItem(INSECTS),
        p = getRandomPosition(),
        e = document.createElement("button");
    e.className = "insect";
    e.type = "button";
    e.setAttribute("aria-label", i.name);
    e.style.left = p.x + "px";
    e.style.top = p.y + "px";
    const visual = i.image
        ? document.createElement("img")
        : document.createElement("span");
    if (i.image) {
        visual.className = "insect-game-image";
        visual.src = i.image;
        visual.alt = i.name;
        visual.onerror = () => {
            const fallback = document.createElement("span");
            fallback.textContent = i.emoji;
            visual.replaceWith(fallback);
        };
    } else {
        visual.textContent = i.emoji;
    }
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = i.name;
    e.append(visual, name);
    e.addEventListener(
        "pointerdown",
        (ev) => {
            ev.preventDefault();
            handleInsect(i, e);
        },
        { once: true },
    );
    gameBoard.appendChild(e);
    setTimeout(() => {
        if (e.isConnected) e.remove();
    }, 2300);
}
function handleInsect(i, e) {
    if (!running) return;
    e.remove();
    if (i.type === "harmful") {
        hits++;
        combo++;
        bestCombo = Math.max(bestCombo, combo);
        let pts = i.points;
        if (combo >= 3) pts += 5;
        if (combo >= 5) pts += 5;
        score += pts;
        showFeedback(`+${pts} 🌱`, "good");
        playHitSound();
    } else {
        mistakes++;
        combo = 0;
        score = Math.max(0, score + i.points);
        showFeedback("¡No lo mates! 🐞", "bad");
        playMistakeSound();
    }
    updateHUD();
}
function showFeedback(t, type) {
    feedback.textContent = t;
    feedback.className = `feedback ${type}`;
    void feedback.offsetWidth;
    feedback.classList.add("show");
}
function startGame() {
    playerName = playerNameInput.value.trim() || "Jugador";
    score = combo = bestCombo = hits = mistakes = 0;
    timeLeft = GAME_DURATION;
    running = true;
    gameBoard.innerHTML = "";
    updateHUD();
    showScreen("game");
    ensureAudioContext();
    startBackgroundMusic();
    playStartSound();
    requestFullscreen();
    requestAnimationFrame(() => {
        spawnInsect();
        spawnInsect();
    });
    clearInterval(timerInterval);
    clearInterval(spawnInterval);
    const start = performance.now();
    timerInterval = setInterval(() => {
        timeLeft = Math.max(
            0,
            GAME_DURATION - (performance.now() - start) / 1000,
        );
        updateHUD();
        if (timeLeft <= 0) endGame();
    }, 100);
    spawnInterval = setInterval(() => {
        if (running) {
            spawnInsect();
            if (Math.random() > 0.45) spawnInsect();
        }
    }, 850);
}
function endGame() {
    if (!running) return;
    running = false;
    clearInterval(timerInterval);
    clearInterval(spawnInterval);
    gameBoard.innerHTML = "";
    playEndSound();
    $("finalScore").textContent = score;
    $("hits").textContent = hits;
    $("mistakes").textContent = mistakes;
    $("bestCombo").textContent = bestCombo;
    const box = $("educationBox"),
        emoji = $("resultEmoji");
    if (score >= 250) {
        emoji.textContent = "🏆";
        box.innerHTML = `🌟 <strong>¡Excelente trabajo, ${escapeHTML(playerName)}!</strong><br><br>Identificaste muy bien las plagas. Recuerda que el manejo integrado busca controlar las plagas protegiendo a los organismos beneficiosos.`;
    } else if (score >= 120) {
        emoji.textContent = "🌱";
        box.innerHTML = `🌱 <strong>¡Buen trabajo, ${escapeHTML(playerName)}!</strong><br><br>Sigue practicando. Antes de controlar un insecto, aprende a reconocer si es plaga o beneficioso.`;
    } else {
        emoji.textContent = "🐞";
        box.innerHTML = `🐞 <strong>¡Sigue aprendiendo, ${escapeHTML(playerName)}!</strong><br><br>Recuerda: no todos los insectos deben eliminarse. Las mariquitas, abejas y crisopas pueden ayudar al agroecosistema.`;
    }
    saveScore();
    showScreen("result");
    exitFullscreen();
}
function escapeHTML(t) {
    const d = document.createElement("div");
    d.textContent = t;
    return d.innerHTML;
}
function requestFullscreen() {
    document.documentElement.requestFullscreen?.().catch(() => {});
}
function exitFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
}
function insectCard(i) {
    const imageSource = i.infoImage || i.image;
    const image = imageSource
        ? `<img class="insect-image" src="${imageSource}" alt="Fotografía de ${i.name}" />`
        : `<span class="insect-icon">${i.emoji}</span>`;
    return `<article class="insect-info ${i.type}"><div class="insect-head">${image}<div><h3>${i.name}</h3><span class="badge ${i.type}">${i.type === "harmful" ? "🐛 PLAGA" : "🌱 BENEFICIOSO"}</span></div></div><p><strong>¿Qué hace?</strong> ${i.description}</p><p><strong>¿Qué hacer?</strong> ${i.control}</p></article>`;
}
function renderInsectInfo() {
    const html = INSECTS.map(insectCard).join("");
    $("insectInfo").innerHTML = html;
    $("resultInsectInfo").innerHTML = html;
}
function getRanking() {
    try {
        return JSON.parse(localStorage.getItem(RANKING_KEY) || "[]");
    } catch {
        return [];
    }
}
function saveScore() {
    const ranking = getRanking();
    ranking.push({
        name: playerName,
        score,
        hits,
        mistakes,
        bestCombo,
        date: new Date().toISOString(),
    });
    ranking.sort((a, b) => b.score - a.score);
    localStorage.setItem(RANKING_KEY, JSON.stringify(ranking.slice(0, 10)));
}
function rankingHTML() {
    const r = getRanking();
    if (!r.length)
        return `<div class="empty-ranking">Todavía no hay partidas. ¡Sé el primero en jugar!</div>`;
    return r
        .map(
            (x, n) =>
                `<div class="ranking-row"><span class="rank-number">${n + 1}</span><span class="rank-name">${escapeHTML(x.name)}</span><span class="rank-score">${x.score} pts</span></div>`,
        )
        .join("");
}
function renderRanking() {
    $("rankingList").innerHTML = rankingHTML();
    $("resultRankingList").innerHTML = rankingHTML();
}
function openStartTab(tab) {
    document
        .querySelectorAll(".top-nav .nav-btn")
        .forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.toggle("active", c.id === tab));
    if (tab === "rankingTab") renderRanking();
}
$("startBtn").addEventListener("click", startGame);
$("againBtn").addEventListener("click", startGame);
musicBtn.addEventListener("click", toggleBackgroundMusic);
$("homeBtn").addEventListener("click", () => {
    playerNameInput.value = playerName;
    showScreen("start");
    openStartTab("homeTab");
});
$("howBtn").addEventListener("click", () =>
    $("howModal").classList.remove("hidden"),
);
$("closeHow").addEventListener("click", () =>
    $("howModal").classList.add("hidden"),
);
$("howModal").addEventListener("pointerdown", (e) => {
    if (e.target === $("howModal")) $("howModal").classList.add("hidden");
});
playerNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") startGame();
});
document.addEventListener(
    "dblclick",
    (e) => {
        if (running) e.preventDefault();
    },
    { passive: false },
);
document
    .querySelectorAll(".top-nav .nav-btn")
    .forEach((b) =>
        b.addEventListener("click", () => openStartTab(b.dataset.tab)),
    );
$("resultLearnBtn").addEventListener("click", () => {
    resultScreen.classList.toggle("learn-open");
    resultScreen.classList.remove("ranking-open");
});
$("resultRankingBtn").addEventListener("click", () => {
    renderRanking();
    resultScreen.classList.toggle("ranking-open");
    resultScreen.classList.remove("learn-open");
});
$("clearRankingBtn").addEventListener("click", () => {
    if (confirm("¿Borrar todas las puntuaciones de este dispositivo?")) {
        localStorage.removeItem(RANKING_KEY);
        renderRanking();
    }
});
renderInsectInfo();
renderRanking();
showScreen("start");
