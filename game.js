
/**
 * ==========================================================
 * HERO DASH: CYBER OBBY
 * Hak Cipta Resmi: © 2026 ELPADRI. All Rights Reserved.
 * ==========================================================
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ukuran Kanvas Responsif
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ==================== DATA KARAKTER & PET ====================
const CHARACTERS = [
    { id: 'cyber', name: 'Budi Cyber', icon: '🤖', color: '#38bdf8', hat: 'visor', price: 0, desc: 'Pahlawan Cyber Modern' },
    { id: 'cat', name: 'Mecha Cat', icon: '🐱', color: '#f472b6', hat: 'ears', price: 100, desc: 'Kucing Robot Lincah' },
    { id: 'ninja', name: 'Shadow Ninja', icon: '🥷', color: '#ef4444', hat: 'bandana', price: 200, desc: 'Ninja Cepat Bayangan' },
    { id: 'astro', name: 'Astro Boy', icon: '👨‍🚀', color: '#e2e8f0', hat: 'helmet', price: 350, desc: 'Penjelajah Galaksi' },
    { id: 'dino', name: 'Dino Gamer', icon: '🦖', color: '#22c55e', hat: 'headset', price: 500, desc: 'Dino Pro Player' },
    { id: 'unicorn', name: 'Unicorn Magic', icon: '🦄', color: '#c084fc', hat: 'horn', price: 700, desc: 'Keajaiban Pelangi' },
    { id: 'sigma', name: 'Sigma Mecha', icon: '🦾', color: '#f97316', hat: 'visor', price: 1000, desc: 'Robot Baja Raksasa' },
    { id: 'elpadri', name: 'Sultan ELPADRI', icon: '👑', color: '#fbbf24', hat: 'crown', price: 1500, desc: 'Karakter VIP +1 Hati!' }
];

const PETS = [
    { id: 'none', name: 'Tanpa Pet', icon: '❌', price: 0, desc: 'Bermain sendiri' },
    { id: 'drone', name: 'Drone Cyber', icon: '🛸', price: 150, desc: 'Menembak lebih cepat' },
    { id: 'dragon', name: 'Naga Api', icon: '🐉', price: 350, desc: 'Bantu serang Boss' },
    { id: 'fairy', name: 'Peri Bintang', icon: '🧚', price: 600, desc: 'Tarik koin sekitar' },
    { id: 'goldcat', name: 'Kucing Sultan', icon: '😺', price: 1000, desc: 'Bonus Koin +50%' }
];

const BIOMES = [
    { name: 'NEON CITY', sky1: '#0f172a', sky2: '#1e3a8a', ground: '#334155', top: '#38bdf8' },
    { name: 'CANDY LAND', sky1: '#4a044e', sky2: '#be185d', ground: '#831843', top: '#f472b6' },
    { name: 'LAVA VOLCANO', sky1: '#450a0a', sky2: '#991b1b', ground: '#27272a', top: '#f97316' },
    { name: 'CYBER SPACE', sky1: '#090d16', sky2: '#311042', ground: '#1e1b4b', top: '#a855f7' },
    { name: 'ISTANA ELPADRI', sky1: '#1c1917', sky2: '#78350f', ground: '#292524', top: '#fbbf24' }
];

// ==================== SAVE DATA (LOCAL STORAGE) ====================
let saveData = JSON.parse(localStorage.getItem('ELPADRI_HERO_SAVE')) || {
    coins: 50,
    level: 1,
    unlockedChars: ['cyber'],
    selectedChar: 'cyber',
    unlockedPets: ['none'],
    selectedPet: 'none',
    stats: { jumps: 0, coinsCollected: 0, bossesDefeated: 0 },
    claimedMissions: []
};

function saveGame() {
    localStorage.setItem('ELPADRI_HERO_SAVE', JSON.stringify(saveData));
    updateMenuUI();
}

// ==================== SISTEM SUara (WEB AUDIO SYNTHESIZER) ====================
let soundEnabled = true;
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function playSound(type) {
    if (!soundEnabled) return;
    if (!audioCtx) audioCtx = new AudioCtx();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'jump') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'coin') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(1200, now + 0.07);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
        osc.start(now); osc.stop(now + 0.18);
    } else if (type === 'dash') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
        osc.start(now); osc.stop(now + 0.18);
    } else if (type === 'hit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now); osc.stop(now + 0.25);
    } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(600, now + 0.1);
        osc.frequency.setValueAtTime(900, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.45);
        osc.start(now); osc.stop(now + 0.45);
    }
}

// ==================== VARIABEL GAME ENGINE ====================
let gameState = 'MENU'; // MENU, PLAYING, PAUSED, OVER
let gameSpeed = 6;
let distance = 0;
let targetDistance = 1200;
let sessionCoins = 0;
let bgStars = [];
let particles = [];
let floatingTexts = [];
let obstacles = [];
let coinsList = [];
let powerups = [];
let projectiles = [];

// Objek Pemain
const player = {
    x: 90,
    y: 0,
    w: 52,
    h: 52,
    vy: 0,
    gravity: 0.75,
    jumpPower: -14.5,
    jumps: 0,
    maxJumps: 2,
    hearts: 3,
    invincibleTimer: 0,
    dashTimer: 0,
    shieldTimer: 0,
    magnetTimer: 0,
    jetpackTimer: 0
};

// Objek Boss Level
const boss = {
    active: false,
    x: 0,
    y: 0,
    w: 95,
    h: 95,
    hp: 100,
    maxHp: 100,
    attackTimer: 0,
    dir: 1
};

// Inisialisasi Bintang Latar
for (let i = 0; i < 45; i++) {
    bgStars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * (window.innerHeight * 0.7),
        size: Math.random() * 3 + 1,
        speed: Math.random() * 1.5 + 0.5
    });
}

function getGroundY() {
    return canvas.height - 110;
}

// ==================== FUNGSI MULAI & KONTROL ====================
function startGame() {
    gameState = 'PLAYING';
    const charObj = CHARACTERS.find(c => c.id === saveData.selectedChar);
    player.hearts = (charObj && charObj.id === 'elpadri') ? 4 : 3;
    player.y = getGroundY() - player.h;
    player.vy = 0;
    player.jumps = 0;
    player.invincibleTimer = 0;
    player.dashTimer = 0;
    player.shieldTimer = 0;
    player.magnetTimer = 0;
    player.jetpackTimer = 0;

    distance = 0;
    targetDistance = 900 + (saveData.level * 250);
    gameSpeed = Math.min(6 + (saveData.level * 0.35), 11);
    sessionCoins = 0;

    obstacles = [];
    coinsList = [];
    powerups = [];
    projectiles = [];
    particles = [];
    floatingTexts = [];

    boss.active = false;
    boss.maxHp = 80 + (saveData.level * 35);
    boss.hp = boss.maxHp;

    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('result-modal').classList.add('hidden');
    document.getElementById('pause-modal').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');

    updateHUD();
}

function doJump() {
    if (gameState !== 'PLAYING') return;
    if (player.jumps < player.maxJumps) {
        player.vy = player.jumpPower;
        player.jumps++;
        saveData.stats.jumps++;
        playSound('jump');
        spawnParticles(player.x + player.w / 2, player.y + player.h, '#38bdf8', 8);
    }
}

function doDash() {
    if (gameState !== 'PLAYING') return;
    if (player.dashTimer <= 0) {
        player.dashTimer = 22;
        playSound('dash');
        spawnParticles(player.x, player.y + player.h / 2, '#f43f5e', 12);

        // Tembak Peluru Energi ke depan (Bisa menghancurkan rintangan & Boss!)
        projectiles.push({
            x: player.x + player.w,
            y: player.y + player.h / 2 - 8,
            w: 28,
            h: 16,
            vx: 14,
            fromPlayer: true,
            color: '#fbbf24'
        });
    }
}

// Input Keyboard & Layar Sentuh
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') doJump();
    if (e.code === 'KeyZ' || e.code === 'KeyX' || e.code === 'ArrowRight' || e.code === 'KeyD') doDash();
});

document.getElementById('btn-jump').addEventListener('touchstart', (e) => { e.preventDefault(); doJump(); });
document.getElementById('btn-jump').addEventListener('mousedown', doJump);
document.getElementById('btn-dash').addEventListener('touchstart', (e) => { e.preventDefault(); doDash(); });
document.getElementById('btn-dash').addEventListener('mousedown', doDash);

// ==================== LOGIKA UPDATE GAME ====================
let spawnTick = 0;

function updateGame() {
    if (gameState !== 'PLAYING') return;

    const groundY = getGroundY();
    const currentSpeed = player.dashTimer > 0 ? gameSpeed * 1.45 : gameSpeed;

    // Timer Powerups
    if (player.invincibleTimer > 0) player.invincibleTimer--;
    if (player.dashTimer > 0) player.dashTimer--;
    if (player.shieldTimer > 0) player.shieldTimer--;
    if (player.magnetTimer > 0) player.magnetTimer--;
    if (player.jetpackTimer > 0) {
        player.jetpackTimer--;
        player.y += (groundY - 210 - player.y) * 0.12;
        player.vy = 0;
        spawnParticles(player.x + 10, player.y + player.h, '#f97316', 1);
    } else {
        // Fisika Gravitasi Normal
        player.y += player.vy;
        player.vy += player.gravity;
        if (player.y >= groundY - player.h) {
            player.y = groundY - player.h;
            player.vy = 0;
            player.jumps = 0;
        }
    }

    // Kemajuan Jarak & Munculkan Boss
    if (!boss.active) {
        distance += currentSpeed * 0.4;
        if (distance >= targetDistance) {
            boss.active = true;
            boss.x = canvas.width - 130;
            boss.y = groundY - boss.h - 40;
            addFloatingText(canvas.width / 2, canvas.height / 3, "⚠️ BOSS MUNCUL! SERANG! ⚠️", "#ef4444");
        }
    } else {
        // Gerakan Boss
        boss.y += boss.dir * 2.5;
        if (boss.y < 120) boss.dir = 1;
        if (boss.y > groundY - boss.h - 10) boss.dir = -1;

        boss.attackTimer++;
        // Pet Naga otomatis membantu menyerang Boss
        if (saveData.selectedPet === 'dragon' && boss.attackTimer % 75 === 0) {
            projectiles.push({
                x: player.x + 40, y: player.y - 20, w: 22, h: 14, vx: 12, fromPlayer: true, color: '#f97316'
            });
        }
        // Serangan Boss
        if (boss.attackTimer % 95 === 0) {
            projectiles.push({
                x: boss.x,
                y: boss.y + boss.h / 2,
                w: 26,
                h: 26,
                vx: -7.5,
                fromPlayer: false,
                color: '#ef4444'
            });
        }
    }

    // Spawn Koin, Rintangan, Powerup
    spawnTick++;
    if (spawnTick % 35 === 0) {
        const coinY = Math.random() < 0.5 ? groundY - 45 : groundY - 135;
        for (let i = 0; i < 3; i++) {
            coinsList.push({ x: canvas.width + (i * 40), y: coinY, r: 14 });
        }
    }

    if (!boss.active && spawnTick % Math.max(55, 95 - saveData.level * 3) === 0) {
        const types = ['spike', 'drone', 'slime'];
        const type = types[Math.floor(Math.random() * types.length)];
        obstacles.push({
            x: canvas.width + 40,
            y: type === 'drone' ? groundY - 115 : groundY - 46,
            w: 44,
            h: 46,
            type: type
        });
    }

    if (spawnTick % 260 === 0) {
        const puTypes = ['shield', 'magnet', 'jetpack', 'rocket'];
        const pType = puTypes[Math.floor(Math.random() * puTypes.length)];
        powerups.push({
            x: canvas.width + 40,
            y: groundY - 125,
            w: 36,
            h: 36,
            type: pType
        });
    }

    // Update Koin + Magnet
    for (let i = coinsList.length - 1; i >= 0; i--) {
        let c = coinsList[i];
        c.x -= currentSpeed;

        // Efek Magnet atau Pet Peri
        const hasMagnet = player.magnetTimer > 0 || saveData.selectedPet === 'fairy';
        const magnetRange = player.magnetTimer > 0 ? 280 : (saveData.selectedPet === 'fairy' ? 140 : 0);
        const dx = (player.x + player.w / 2) - c.x;
        const dy = (player.y + player.h / 2) - c.y;
        const dist = Math.hypot(dx, dy);

        if (hasMagnet && dist < magnetRange) {
            c.x += (dx / dist) * 10;
            c.y += (dy / dist) * 10;
        }

        if (dist < player.w / 2 + c.r) {
            const bonus = saveData.selectedPet === 'goldcat' ? 2 : 1;
            sessionCoins += bonus;
            saveData.coins += bonus;
            saveData.stats.coinsCollected += bonus;
            playSound('coin');
            coinsList.splice(i, 1);
            continue;
        }
        if (c.x < -40) coinsList.splice(i, 1);
    }

    // Update Powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
        let p = powerups[i];
        p.x -= currentSpeed;
        if (rectIntersect(player, p)) {
            playSound('win');
            if (p.type === 'shield') {
                player.shieldTimer = 350;
                addFloatingText(player.x, player.y, "🛡️ PERISAI AKTIF!", "#38bdf8");
            } else if (p.type === 'magnet') {
                player.magnetTimer = 400;
                addFloatingText(player.x, player.y, "🧲 MAGNET KOIN!", "#eab308");
            } else if (p.type === 'jetpack') {
                player.jetpackTimer = 240;
                addFloatingText(player.x, player.y, "🚀 JETPACK TERBANG!", "#f97316");
            } else if (p.type === 'rocket') {
                if (boss.active) {
                    boss.hp -= 30;
                    addFloatingText(boss.x, boss.y, "💥 -30 HP!", "#fbbf24");
                    checkBossDefeated();
                } else {
                    distance += 150;
                    addFloatingText(player.x, player.y, "⚡ BOOST JARAK!", "#22c55e");
                }
            }
            powerups.splice(i, 1);
            continue;
        }
        if (p.x < -50) powerups.splice(i, 1);
    }

    // Update Rintangan
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let o = obstacles[i];
        o.x -= currentSpeed;

        if (rectIntersect(player, o)) {
            if (player.dashTimer > 0 || player.shieldTimer > 0 || player.jetpackTimer > 0) {
                spawnParticles(o.x + 20, o.y + 20, '#fbbf24', 12);
                addFloatingText(o.x, o.y, "💥 HANCUR!", "#fde047");
                obstacles.splice(i, 1);
                continue;
            } else if (player.invincibleTimer <= 0) {
                damagePlayer();
                obstacles.splice(i, 1);
                continue;
            }
        }
        if (o.x < -60) obstacles.splice(i, 1);
    }

    // Update Peluru (Player & Boss)
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let pr = projectiles[i];
        pr.x += pr.vx;

        if (pr.fromPlayer) {
            // Kena Rintangan
            let hitObs = false;
            for (let j = obstacles.length - 1; j >= 0; j--) {
                if (rectIntersect(pr, obstacles[j])) {
                    spawnParticles(obstacles[j].x, obstacles[j].y, '#f97316', 10);
                    obstacles.splice(j, 1);
                    hitObs = true;
                    break;
                }
            }
            if (hitObs) { projectiles.splice(i, 1); continue; }

            // Kena Boss
            if (boss.active && rectIntersect(pr, boss)) {
                const dmg = saveData.selectedPet === 'drone' ? 14 : 10;
                boss.hp -= dmg;
                spawnParticles(boss.x, pr.y, '#fbbf24', 8);
                addFloatingText(boss.x, boss.y, `-${dmg}`, "#fde047");
                projectiles.splice(i, 1);
                checkBossDefeated();
                continue;
            }
        } else {
            // Peluru Boss Kena Player
            if (rectIntersect(pr, player)) {
                if (player.shieldTimer <= 0 && player.dashTimer <= 0 && player.invincibleTimer <= 0) {
                    damagePlayer();
                }
                projectiles.splice(i, 1);
                continue;
            }
        }

        if (pr.x < -50 || pr.x > canvas.width + 50) projectiles.splice(i, 1);
    }

    updateHUD();
}

function damagePlayer() {
    player.hearts--;
    player.invincibleTimer = 70;
    playSound('hit');
    spawnParticles(player.x + 20, player.y + 20, '#ef4444', 15);
    addFloatingText(player.x, player.y, "💔 ADUH!", "#ef4444");

    if (player.hearts <= 0) {
        endGame(false);
    }
}

function checkBossDefeated() {
    if (boss.hp <= 0) {
        boss.hp = 0;
        boss.active = false;
        saveData.stats.bossesDefeated++;
        const bonusWin = 30 + (saveData.level * 10);
        sessionCoins += bonusWin;
        saveData.coins += bonusWin;
        saveData.level++;
        playSound('win');
        endGame(true);
    }
}

function endGame(isWin) {
    gameState = 'OVER';
    saveGame();

    document.getElementById('hud').classList.add('hidden');
    const modal = document.getElementById('result-modal');
    modal.classList.remove('hidden');

    document.getElementById('result-icon').textContent = isWin ? '🏆' : '💪';
    document.getElementById('result-title').textContent = isWin ? 'LEVEL SELESAI!' : 'JANGAN MENYERAH!';
    document.getElementById('result-desc').textContent = isWin
        ? `Hebat! Kamu naik ke Level ${saveData.level}!`
        : 'Ayo coba lagi atau beli karakter baru di Toko!';
    document.getElementById('result-coins').textContent = sessionCoins;
    document.getElementById('btn-next').textContent = isWin
        ? `🚀 LANJUT LEVEL ${saveData.level}`
        : '🔄 COBA LAGI';
}

function rectIntersect(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// ==================== RENDER VISUAL KANVAS ====================
function drawGame() {
    const biome = BIOMES[(saveData.level - 1) % BIOMES.length];
    const groundY = getGroundY();

    // 1. Langit Gradien sesuai Dunia/Biome
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, biome.sky1);
    grad.addColorStop(1, biome.sky2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Bintang & Watermark ELPADRI di Langit
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    bgStars.forEach(s => {
        if (gameState === 'PLAYING') s.x -= s.speed;
        if (s.x < 0) s.x = canvas.width;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Watermark Hak Cipta ELPADRI di Latar Belakang
    ctx.save();
    ctx.font = 'bold 14px Fredoka, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.textAlign = 'right';
    ctx.fillText(`DUNIA: ${biome.name} | © ELPADRI`, canvas.width - 16, groundY + 95);
    ctx.restore();

    // 3. Lantai / Ground
    ctx.fillStyle = biome.ground;
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    ctx.fillStyle = biome.top;
    ctx.fillRect(0, groundY, canvas.width, 10);

    if (gameState === 'MENU') return;

    // 4. Gambar Koin
    coinsList.forEach(c => {
        ctx.save();
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★', c.x, c.y + 4);
        ctx.restore();
    });

    // 5. Gambar Powerups
    powerups.forEach(p => {
        ctx.save();
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        const icons = { shield: '🛡️', magnet: '🧲', jetpack: '🚀', rocket: '💣' };
        ctx.fillText(icons[p.type] || '⭐', p.x + p.w / 2, p.y + 28);
        ctx.restore();
    });

    // 6. Gambar Rintangan
    obstacles.forEach(o => {
        ctx.save();
        ctx.font = '36px sans-serif';
        ctx.textAlign = 'center';
        const obsIcon = o.type === 'drone' ? '👾' : (o.type === 'slime' ? '🟢' : '🔺');
        ctx.fillText(obsIcon, o.x + o.w / 2, o.y + 36);
        ctx.restore();
    });

    // 7. Gambar Karakter Pemain & Pet
    drawPlayer();

    // 8. Gambar Boss Monster
    if (boss.active) {
        ctx.save();
        ctx.fillStyle = '#dc2626';
        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(boss.x, boss.y, boss.w, boss.h, 20);
        ctx.fill();
        ctx.stroke();

        ctx.font = '56px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👹', boss.x + boss.w / 2, boss.y + 66);
        ctx.restore();
    }

    // 9. Gambar Peluru Energi
    projectiles.forEach(pr => {
        ctx.fillStyle = pr.color;
        ctx.beginPath();
        ctx.roundRect(pr.x, pr.y, pr.w, pr.h, 8);
        ctx.fill();
    });

    // 10. Partikel & Teks Melayang
    for (let i = particles.length - 1; i >= 0; i--) {
        let pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
        if (pt.life <= 0) particles.splice(i, 1);
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        let ft = floatingTexts[i];
        ft.y -= 1.2;
        ft.life--;
        ctx.font = 'bold 16px Fredoka, sans-serif';
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
}

function drawPlayer() {
    const charObj = CHARACTERS.find(c => c.id === saveData.selectedChar) || CHARACTERS[0];
    const petObj = PETS.find(p => p.id === saveData.selectedPet);

    ctx.save();
    if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer / 4) % 2 === 0) {
        ctx.globalAlpha = 0.45;
    }

    // Aura Perisai
    if (player.shieldTimer > 0) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(player.x + player.w / 2, player.y + player.h / 2, 38, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Badan Karakter
    ctx.fillStyle = charObj.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(player.x, player.y, player.w, player.h, 14);
    ctx.fill();
    ctx.stroke();

    // Ikon Karakter di Tengah
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(charObj.icon, player.x + player.w / 2, player.y + 37);

    // Gambar Pet Terbang di Belakang Pemain
    if (petObj && petObj.id !== 'none') {
        const floatY = Math.sin(Date.now() * 0.008) * 6;
        ctx.font = '26px sans-serif';
        ctx.fillText(petObj.icon, player.x - 24, player.y + 10 + floatY);
    }

    ctx.restore();
}

function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            size: Math.random() * 5 + 3,
            color,
            life: 22
        });
    }
}

function addFloatingText(x, y, text, color) {
    floatingTexts.push({ x, y, text, color, life: 45 });
}

// ==================== UI & MENU MANAGER ====================
function updateHUD() {
    document.getElementById('hud-coins').textContent = saveData.coins;
    document.getElementById('hud-level').textContent = saveData.level;
    document.getElementById('hud-hearts').textContent = '❤️'.repeat(Math.max(0, player.hearts));

    const fill = document.getElementById('progress-fill');
    const label = document.getElementById('progress-label');

    if (!boss.active) {
        const pct = Math.min(100, Math.floor((distance / targetDistance) * 100));
        fill.style.width = pct + '%';
        fill.style.background = 'linear-gradient(90deg, #22c55e, #eab308)';
        label.textContent = `Perjalanan Level ${saveData.level}: ${pct}%`;
    } else {
        const hpPct = Math.max(0, Math.floor((boss.hp / boss.maxHp) * 100));
        fill.style.width = hpPct + '%';
        fill.style.background = 'linear-gradient(90deg, #ef4444, #f97316)';
        label.textContent = `👹 DARAH BOSS: ${boss.hp} / ${boss.maxHp} (Tekan SERANG!)`;
    }

    // Powerup Badges
    const puContainer = document.getElementById('powerup-indicators');
    puContainer.innerHTML = '';
    if (player.shieldTimer > 0) puContainer.innerHTML += `<div class="pu-badge">🛡️ Perisai (${Math.ceil(player.shieldTimer/60)}s)</div>`;
    if (player.magnetTimer > 0) puContainer.innerHTML += `<div class="pu-badge">🧲 Magnet (${Math.ceil(player.magnetTimer/60)}s)</div>`;
    if (player.jetpackTimer > 0) puContainer.innerHTML += `<div class="pu-badge">🚀 Jetpack (${Math.ceil(player.jetpackTimer/60)}s)</div>`;
}

function updateMenuUI() {
    document.getElementById('menu-coins').textContent = saveData.coins;
    document.getElementById('shop-coins').textContent = saveData.coins;
    document.getElementById('gacha-coins').textContent = saveData.coins;
    document.getElementById('menu-level').textContent = saveData.level;
    document.getElementById('btn-lvl-num').textContent = saveData.level;

    const charObj = CHARACTERS.find(c => c.id === saveData.selectedChar) || CHARACTERS[0];
    const petObj = PETS.find(p => p.id === saveData.selectedPet) || PETS[0];

    document.getElementById('preview-avatar').textContent = charObj.icon;
    document.getElementById('preview-name').textContent = charObj.name;
    document.getElementById('preview-pet').textContent = `Pet: ${petObj.icon} ${petObj.name}`;
}

// Render Toko Karakter & Pet
let currentShopTab = 'chars';
function renderShop() {
    const container = document.getElementById('shop-items');
    container.innerHTML = '';
    const list = currentShopTab === 'chars' ? CHARACTERS : PETS;
    const unlockedList = currentShopTab === 'chars' ? saveData.unlockedChars : saveData.unlockedPets;
    const selectedId = currentShopTab === 'chars' ? saveData.selectedChar : saveData.selectedPet;

    list.forEach(item => {
        const isUnlocked = unlockedList.includes(item.id);
        const isSelected = selectedId === item.id;

        const card = document.createElement('div');
        card.className = `shop-card ${isSelected ? 'selected' : ''}`;
        card.innerHTML = `
            <div class="shop-icon">${item.icon}</div>
            <div class="shop-name"><strong>${item.name}</strong></div>
            <div class="shop-desc">${item.desc}</div>
            <button class="shop-btn ${isSelected ? 'active' : (isUnlocked ? 'use' : 'buy')}">
                ${isSelected ? '✅ DIPAKAI' : (isUnlocked ? 'PAKAI' : `🪙 ${item.price}`)}
            </button>
        `;

        card.querySelector('button').addEventListener('click', () => {
            if (isSelected) return;
            if (isUnlocked) {
                if (currentShopTab === 'chars') saveData.selectedChar = item.id;
                else saveData.selectedPet = item.id;
                playSound('coin');
                saveGame();
                renderShop();
            } else if (saveData.coins >= item.price) {
                saveData.coins -= item.price;
                unlockedList.push(item.id);
                if (currentShopTab === 'chars') saveData.selectedChar = item.id;
                else saveData.selectedPet = item.id;
                playSound('win');
                saveGame();
                renderShop();
            } else {
                playSound('hit');
                alert('Koin belum cukup! Ayo main atau buka Kotak Kejutan!');
            }
        });

        container.appendChild(card);
    });
}

// Render Misi & Tantangan
const MISSIONS = [
    { id: 'm1', title: 'Pelompat Handal', desc: 'Lompat sebanyak 30 kali', target: 30, stat: 'jumps', reward: 100 },
    { id: 'm2', title: 'Pemburu Koin', desc: 'Kumpulkan total 100 Koin', target: 100, stat: 'coinsCollected', reward: 150 },
    { id: 'm3', title: 'Penakluk Boss', desc: 'Kalahkan 2 Boss Level', target: 2, stat: 'bossesDefeated', reward: 250 },
    { id: 'm4', title: 'Sultan Koin', desc: 'Kumpulkan total 500 Koin', target: 500, stat: 'coinsCollected', reward: 400 }
];

function renderMissions() {
    const listEl = document.getElementById('missions-list');
    listEl.innerHTML = '';

    MISSIONS.forEach(m => {
        const progress = saveData.stats[m.stat] || 0;
        const claimed = saveData.claimedMissions.includes(m.id);
        const canClaim = progress >= m.target && !claimed;

        const row = document.createElement('div');
        row.className = 'mission-item';
        row.innerHTML = `
            <div class="mission-info">
                <h4>${m.title} (+${m.reward} 🪙)</h4>
                <p>${m.desc} (${Math.min(progress, m.target)}/${m.target})</p>
            </div>
            <button class="shop-btn ${claimed ? 'active' : (canClaim ? 'buy' : 'use')}" style="width:110px;">
                ${claimed ? 'SELESAI' : (canClaim ? 'KLAIM 🪙' : 'BELUM')}
            </button>
        `;

        if (canClaim) {
            row.querySelector('button').addEventListener('click', () => {
                saveData.coins += m.reward;
                saveData.claimedMissions.push(m.id);
                playSound('win');
                saveGame();
                renderMissions();
            });
        }
        listEl.appendChild(row);
    });
}

// Event Listener Tombol Menu
document.getElementById('btn-play').addEventListener('click', startGame);
document.getElementById('btn-next').addEventListener('click', startGame);
document.getElementById('btn-result-menu').addEventListener('click', () => {
    gameState = 'MENU';
    document.getElementById('result-modal').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    updateMenuUI();
});

document.getElementById('btn-pause').addEventListener('click', () => {
    if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        document.getElementById('pause-modal').classList.remove('hidden');
    }
});
document.getElementById('btn-resume').addEventListener('click', () => {
    gameState = 'PLAYING';
    document.getElementById('pause-modal').classList.add('hidden');
});
document.getElementById('btn-quit').addEventListener('click', () => {
    gameState = 'MENU';
    document.getElementById('pause-modal').classList.add('hidden');
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    saveGame();
});

document.getElementById('btn-sound').addEventListener('click', (e) => {
    soundEnabled = !soundEnabled;
    e.target.textContent = soundEnabled ? '🔊' : '🔇';
});

document.getElementById('btn-shop').addEventListener('click', () => {
    renderShop();
    document.getElementById('shop-modal').classList.remove('hidden');
});
document.getElementById('tab-chars').addEventListener('click', (e) => {
    currentShopTab = 'chars';
    e.target.classList.add('active');
    document.getElementById('tab-pets').classList.remove('active');
    renderShop();
});
document.getElementById('tab-pets').addEventListener('click', (e) => {
    currentShopTab = 'pets';
    e.target.classList.add('active');
    document.getElementById('tab-chars').classList.remove('active');
    renderShop();
});

document.getElementById('btn-gacha').addEventListener('click', () => {
    document.getElementById('gacha-modal').classList.remove('hidden');
});
document.getElementById('btn-spin-gacha').addEventListener('click', () => {
    if (saveData.coins < 50) {
        playSound('hit');
        document.getElementById('gacha-result-text').textContent = '❌ Koin kurang dari 50! Ayo main dulu!';
        return;
    }
    saveData.coins -= 50;
    const prizes = [30, 60, 80, 120, 250];
    const winAmount = prizes[Math.floor(Math.random() * prizes.length)];
    saveData.coins += winAmount;
    playSound('win');
    document.getElementById('gacha-box-icon').textContent = '🎉';
    document.getElementById('gacha-result-text').innerHTML = `SELAMAT! Kamu mendapat hadiah <strong>+${winAmount} Koin 🪙</strong>!`;
    saveGame();
});

document.getElementById('btn-missions').addEventListener('click', () => {
    renderMissions();
    document.getElementById('missions-modal').classList.remove('hidden');
});

document.getElementById('btn-about').addEventListener('click', () => {
    document.getElementById('about-modal').classList.remove('hidden');
});

document.querySelectorAll('.btn-close').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-close');
        document.getElementById(target).classList.add('hidden');
    });
});

// ==================== GAME LOOP UTAMA ====================
function gameLoop() {
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

updateMenuUI();
gameLoop();
