```javascript
/**
 * ==========================================================
 * HERO DASH: CYBER OBBY (3D CYBER ENGINE EDITION v3.0)
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
    { id: 'cyber', name: 'Budi Cyber', icon: '🤖', color: '#38bdf8', accent: '#0284c7', glow: '#7dd3fc', hat: 'visor', price: 0, desc: 'Pahlawan Cyber Modern' },
    { id: 'cat', name: 'Mecha Cat', icon: '🐱', color: '#f472b6', accent: '#db2777', glow: '#f9a8d4', hat: 'ears', price: 100, desc: 'Kucing Robot Lincah' },
    { id: 'ninja', name: 'Shadow Ninja', icon: '🥷', color: '#ef4444', accent: '#1e293b', glow: '#f87171', hat: 'bandana', price: 200, desc: 'Ninja Cepat Bayangan' },
    { id: 'astro', name: 'Astro Boy', icon: '👨‍🚀', color: '#f8fafc', accent: '#64748b', glow: '#38bdf8', hat: 'helmet', price: 350, desc: 'Penjelajah Galaksi' },
    { id: 'dino', name: 'Dino Gamer', icon: '🦖', color: '#22c55e', accent: '#15803d', glow: '#86efac', hat: 'headset', price: 500, desc: 'Dino Pro Player' },
    { id: 'unicorn', name: 'Unicorn Magic', icon: '🦄', color: '#c084fc', accent: '#7e22ce', glow: '#f0abfc', hat: 'horn', price: 700, desc: 'Keajaiban Pelangi' },
    { id: 'sigma', name: 'Sigma Mecha', icon: '🦾', color: '#f97316', accent: '#c2410c', glow: '#fdba74', hat: 'visor', price: 1000, desc: 'Robot Baja Raksasa' },
    { id: 'elpadri', name: 'Sultan ELPADRI', icon: '👑', color: '#fbbf24', accent: '#b45309', glow: '#fef08a', hat: 'crown', price: 1500, desc: 'Karakter VIP +1 Hati!' }
];

const PETS = [
    { id: 'none', name: 'Tanpa Pet', icon: '❌', color: '#64748b', price: 0, desc: 'Bermain sendiri' },
    { id: 'drone', name: 'Drone Cyber', icon: '🛸', color: '#38bdf8', price: 150, desc: 'Damage Serangan +40%' },
    { id: 'dragon', name: 'Naga Api', icon: '🐉', color: '#f97316', price: 350, desc: 'Tembak Api Otomatis' },
    { id: 'fairy', name: 'Peri Bintang', icon: '🧚', color: '#c084fc', price: 600, desc: 'Tarik Koin Sekitar' },
    { id: 'goldcat', name: 'Kucing Sultan', icon: '😺', color: '#fbbf24', price: 1000, desc: 'Bonus Koin 2x Lipat!' }
];

const BIOMES = [
    { name: 'NEON CITY', sky1: '#050816', sky2: '#1e3a8a', ground: '#0f172a', top: '#38bdf8', grid: 'rgba(56, 189, 248, 0.38)', building: '#0b132b' },
    { name: 'CANDY CYBER', sky1: '#2e0533', sky2: '#9d174d', ground: '#3b0736', top: '#f472b6', grid: 'rgba(244, 114, 182, 0.38)', building: '#240429' },
    { name: 'MAGMA CORE', sky1: '#280505', sky2: '#7f1d1d', ground: '#18181b', top: '#f97316', grid: 'rgba(249, 115, 22, 0.38)', building: '#1f0808' },
    { name: 'QUANTUM MATRIX', sky1: '#050510', sky2: '#3b0764', ground: '#130d26', top: '#a855f7', grid: 'rgba(168, 85, 247, 0.38)', building: '#0f0722' },
    { name: 'ISTANA ELPADRI', sky1: '#141109', sky2: '#713f12', ground: '#1c1917', top: '#fbbf24', grid: 'rgba(251, 191, 36, 0.42)', building: '#171209' }
];

// ==================== SAVE DATA (LOCAL STORAGE AMAN) ====================
const DEFAULT_SAVE = {
    coins: 50,
    level: 1,
    unlockedChars: ['cyber'],
    selectedChar: 'cyber',
    unlockedPets: ['none'],
    selectedPet: 'none',
    stats: { jumps: 0, coinsCollected: 0, bossesDefeated: 0 },
    claimedMissions: []
};

let saveData = JSON.parse(JSON.stringify(DEFAULT_SAVE));
try {
    const raw = localStorage.getItem('ELPADRI_HERO_SAVE');
    if (raw) {
        const parsed = JSON.parse(raw);
        saveData = Object.assign({}, DEFAULT_SAVE, parsed);
        saveData.stats = Object.assign({}, DEFAULT_SAVE.stats, parsed.stats || {});
    }
} catch (err) {
    // Fallback jika localStorage diblokir browser
}

function saveGame() {
    try {
        localStorage.setItem('ELPADRI_HERO_SAVE', JSON.stringify(saveData));
    } catch (err) {}
    updateMenuUI();
}

function showToast(msg) {
    const old = document.querySelector('.cyber-toast');
    if (old) old.remove();
    const toast = document.createElement('div');
    toast.className = 'cyber-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 2200);
}

// ==================== SISTEM SUARA (WEB AUDIO SYNTHESIZER) ====================
let soundEnabled = true;
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function playSound(type) {
    if (!soundEnabled || !AudioCtx) return;
    try {
        if (!audioCtx) audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        const now = audioCtx.currentTime;

        if (type === 'jump') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(290, now);
            osc.frequency.exponentialRampToValueAtTime(640, now + 0.15);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
            osc.start(now); osc.stop(now + 0.15);
        } else if (type === 'coin') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(840, now);
            osc.frequency.setValueAtTime(1280, now + 0.06);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.16);
            osc.start(now); osc.stop(now + 0.16);
        } else if (type === 'dash') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(550, now);
            osc.frequency.exponentialRampToValueAtTime(130, now + 0.18);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
            osc.start(now); osc.stop(now + 0.18);
        } else if (type === 'hit') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(55, now + 0.25);
            gain.gain.setValueAtTime(0.28, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
            osc.start(now); osc.stop(now + 0.25);
        } else if (type === 'win') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(660, now + 0.1);
            osc.frequency.setValueAtTime(990, now + 0.2);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.45);
            osc.start(now); osc.stop(now + 0.45);
        }
    } catch (e) {}
}

// ==================== VARIABEL GAME ENGINE 3D ====================
let gameState = 'MENU'; // MENU, PLAYING, PAUSED, OVER
let gameSpeed = 6;
let distance = 0;
let targetDistance = 1200;
let sessionCoins = 0;
let worldTime = 0;
let gridScroll = 0;
let screenShake = 0;

let bgStars = [];
let bgBuildings = [];
let particles = [];
let afterimages = [];
let floatingTexts = [];
let obstacles = [];
let coinsList = [];
let powerups = [];
let projectiles = [];

// Objek Pemain dengan Fisika & Animasi 3D (Squash/Stretch, Flip, Run Cycle)
const player = {
    x: 95,
    y: 0,
    w: 54,
    h: 60,
    vy: 0,
    gravity: 0.74,
    jumpPower: -14.8,
    jumps: 0,
    maxJumps: 2,
    hearts: 3,
    invincibleTimer: 0,
    dashTimer: 0,
    attackAnim: 0,
    shieldTimer: 0,
    magnetTimer: 0,
    jetpackTimer: 0,
    runPhase: 0,
    scaleX: 1,
    scaleY: 1,
    flipAngle: 0
};

// Objek Boss 3D Mecha-Overlord
const boss = {
    active: false,
    x: 0,
    y: 0,
    w: 108,
    h: 112,
    hp: 100,
    maxHp: 100,
    attackTimer: 0,
    hitFlash: 0,
    dir: 1
};

// Inisialisasi Bintang 3 Lapis & Gedung Cyberpunk Parallax
for (let i = 0; i < 55; i++) {
    bgStars.push({
        x: Math.random() * 1600,
        y: Math.random() * 600,
        size: Math.random() * 2.5 + 0.8,
        speed: Math.random() * 1.4 + 0.3,
        alpha: Math.random() * 0.6 + 0.3
    });
}

for (let i = 0; i < 16; i++) {
    bgBuildings.push({
        x: i * 130,
        w: 75 + Math.random() * 55,
        h: 90 + Math.random() * 170,
        depth: i % 2 === 0 ? 0.35 : 0.6,
        windows: Math.floor(Math.random() * 4) + 3
    });
}

// Lantai diposisikan di atas area tombol kontrol sentuh agar Boss/Karakter tidak pernah tertutup tombol
function getGroundY() {
    return Math.max(260, canvas.height - 138);
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
    player.attackAnim = 0;
    player.shieldTimer = 0;
    player.magnetTimer = 0;
    player.jetpackTimer = 0;
    player.scaleX = 1;
    player.scaleY = 1;
    player.flipAngle = 0;

    distance = 0;
    targetDistance = 900 + (saveData.level * 250);
    gameSpeed = Math.min(6.2 + (saveData.level * 0.35), 11.2);
    sessionCoins = 0;
    screenShake = 0;

    obstacles = [];
    coinsList = [];
    powerups = [];
    projectiles = [];
    particles = [];
    afterimages = [];
    floatingTexts = [];

    boss.active = false;
    boss.maxHp = 80 + (saveData.level * 35);
    boss.hp = boss.maxHp;
    boss.hitFlash = 0;

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
        player.scaleX = 0.78;
        player.scaleY = 1.26;
        if (player.jumps === 2) {
            player.flipAngle = 0.01; // Mulai animasi 360 salto saat double jump
        }
        saveData.stats.jumps++;
        playSound('jump');
        spawnParticles(player.x + player.w / 2, player.y + player.h, '#38bdf8', 12);
    }
}

function doDash() {
    if (gameState !== 'PLAYING') return;
    if (player.dashTimer <= 0) {
        const charObj = CHARACTERS.find(c => c.id === saveData.selectedChar) || CHARACTERS[0];
        player.dashTimer = 20;
        player.attackAnim = 15;
        player.scaleX = 1.25;
        player.scaleY = 0.82;
        screenShake = 5;
        playSound('dash');
        spawnParticles(player.x + player.w, player.y + player.h / 2, charObj.glow, 14);

        // Tembak Peluru Laser Plasma 3D ke depan
        projectiles.push({
            x: player.x + player.w + 4,
            y: player.y + player.h / 2 - 8,
            w: 36,
            h: 16,
            vx: 15.5,
            fromPlayer: true,
            color: charObj.color,
            glow: charObj.glow
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
    worldTime += 0.05;
    if (gameState !== 'PLAYING') return;

    const groundY = getGroundY();
    const currentSpeed = player.dashTimer > 0 ? gameSpeed * 1.48 : gameSpeed;
    gridScroll = (gridScroll + currentSpeed) % 80;

    if (screenShake > 0) screenShake *= 0.82;
    if (screenShake < 0.3) screenShake = 0;

    // Kembalikan bentuk Squash & Stretch secara elastis
    player.scaleX += (1 - player.scaleX) * 0.22;
    player.scaleY += (1 - player.scaleY) * 0.22;
    player.runPhase += currentSpeed * 0.048;

    if (player.flipAngle > 0) {
        player.flipAngle += 0.32;
        if (player.flipAngle >= Math.PI * 2) player.flipAngle = 0;
    }

    // Timer Powerups & Status
    if (player.invincibleTimer > 0) player.invincibleTimer--;
    if (player.dashTimer > 0) {
        player.dashTimer--;
        if (player.dashTimer % 3 === 0) {
            afterimages.push({
                x: player.x,
                y: player.y,
                alpha: 0.55,
                charId: saveData.selectedChar
            });
        }
    }
    if (player.attackAnim > 0) player.attackAnim--;
    if (player.shieldTimer > 0) player.shieldTimer--;
    if (player.magnetTimer > 0) player.magnetTimer--;

    if (player.jetpackTimer > 0) {
        player.jetpackTimer--;
        player.y += (groundY - 215 - player.y) * 0.12;
        player.vy = 0;
        player.flipAngle = 0;
        spawnParticles(player.x + 12, player.y + player.h - 4, '#f97316', 2);
    } else {
        // Fisika Gravitasi Normal
        const wasInAir = player.y < groundY - player.h - 2;
        player.y += player.vy;
        player.vy += player.gravity;
        if (player.y >= groundY - player.h) {
            player.y = groundY - player.h;
            if (wasInAir && player.vy > 4) {
                player.scaleX = 1.24;
                player.scaleY = 0.78;
                spawnParticles(player.x + player.w / 2, groundY, '#94a3b8', 5);
            }
            player.vy = 0;
            player.jumps = 0;
            player.flipAngle = 0;
        }
    }

    // Kemajuan Jarak & Munculkan Boss
    if (!boss.active) {
        distance += currentSpeed * 0.4;
        if (distance >= targetDistance) {
            boss.active = true;
            boss.x = Math.max(canvas.width - 145, player.x + 180);
            boss.y = groundY - boss.h - 55;
            screenShake = 10;
            addFloatingText(canvas.width / 2, canvas.height / 3, "⚠️ BOSS MECHA MUNCUL! SERANG! ⚠️", "#ef4444");
        }
    } else {
        boss.x = Math.max(canvas.width - 145, player.x + 180);
        // Gerakan Boss Melayang di Atas Garis Tanah (Tidak Menutupi Tombol Kontrol!)
        boss.y += boss.dir * 2.4;
        const minBossY = 115;
        const maxBossY = Math.max(minBossY + 40, groundY - boss.h - 24);
        if (boss.y < minBossY) boss.dir = 1;
        if (boss.y > maxBossY) boss.dir = -1;
        if (boss.hitFlash > 0) boss.hitFlash--;

        boss.attackTimer++;
        // Pet Naga otomatis membantu menyerang Boss
        if (saveData.selectedPet === 'dragon' && boss.attackTimer % 70 === 0) {
            projectiles.push({
                x: player.x + 40, y: player.y - 16, w: 28, h: 14, vx: 13, fromPlayer: true, color: '#f97316', glow: '#fde047'
            });
        }
        // Serangan Peluru Plasma Boss
        if (boss.attackTimer % 92 === 0) {
            projectiles.push({
                x: boss.x - 10,
                y: boss.y + boss.h / 2 - 12,
                w: 28,
                h: 28,
                vx: -7.8,
                fromPlayer: false,
                color: '#ef4444',
                glow: '#fca5a5'
            });
        }
    }

    // Spawn Koin, Rintangan, Powerup
    spawnTick++;
    if (spawnTick % 35 === 0) {
        const coinY = Math.random() < 0.5 ? groundY - 48 : groundY - 140;
        for (let i = 0; i < 3; i++) {
            coinsList.push({ x: canvas.width + (i * 42), y: coinY, r: 14, phase: i * 0.6 });
        }
    }

    if (!boss.active && spawnTick % Math.max(55, 95 - saveData.level * 3) === 0) {
        const types = ['spike', 'drone', 'slime'];
        const type = types[Math.floor(Math.random() * types.length)];
        obstacles.push({
            x: canvas.width + 45,
            y: type === 'drone' ? groundY - 122 : groundY - 48,
            w: 46,
            h: 48,
            type: type
        });
    }

    if (spawnTick % 255 === 0) {
        const puTypes = ['shield', 'magnet', 'jetpack', 'rocket'];
        const pType = puTypes[Math.floor(Math.random() * puTypes.length)];
        powerups.push({
            x: canvas.width + 45,
            y: groundY - 132,
            w: 40,
            h: 40,
            type: pType
        });
    }

    // Update Koin + Magnet
    for (let i = coinsList.length - 1; i >= 0; i--) {
        let c = coinsList[i];
        c.x -= currentSpeed;

        const hasMagnet = player.magnetTimer > 0 || saveData.selectedPet === 'fairy';
        const magnetRange = player.magnetTimer > 0 ? 290 : (saveData.selectedPet === 'fairy' ? 150 : 0);
        const dx = (player.x + player.w / 2) - c.x;
        const dy = (player.y + player.h / 2) - c.y;
        const dist = Math.hypot(dx, dy);

        if (hasMagnet && dist < magnetRange) {
            c.x += (dx / dist) * 10.5;
            c.y += (dy / dist) * 10.5;
        }

        if (dist < player.w / 2 + c.r + 4) {
            const bonus = saveData.selectedPet === 'goldcat' ? 2 : 1;
            sessionCoins += bonus;
            saveData.coins += bonus;
            saveData.stats.coinsCollected += bonus;
            playSound('coin');
            spawnParticles(c.x, c.y, '#fde047', 6);
            coinsList.splice(i, 1);
            continue;
        }
        if (c.x < -40) coinsList.splice(i, 1);
    }

    // Update Powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
        let p = powerups[i];
        p.x -= currentSpeed;
        if (rectIntersect(player, p, 2)) {
            playSound('win');
            spawnParticles(p.x + 20, p.y + 20, '#38bdf8', 15);
            if (p.type === 'shield') {
                player.shieldTimer = 360;
                addFloatingText(player.x, player.y, "🛡️ PERISAI 3D AKTIF!", "#38bdf8");
            } else if (p.type === 'magnet') {
                player.magnetTimer = 400;
                addFloatingText(player.x, player.y, "🧲 MAGNET KOIN!", "#eab308");
            } else if (p.type === 'jetpack') {
                player.jetpackTimer = 240;
                addFloatingText(player.x, player.y, "🚀 JETPACK TURBO!", "#f97316");
            } else if (p.type === 'rocket') {
                if (boss.active) {
                    boss.hp -= 30;
                    boss.hitFlash = 10;
                    screenShake = 8;
                    addFloatingText(boss.x, boss.y, "💥 RUDAL -30 HP!", "#fbbf24");
                    checkBossDefeated();
                } else {
                    distance += 150;
                    addFloatingText(player.x, player.y, "⚡ WARP BOOST!", "#22c55e");
                }
            }
            powerups.splice(i, 1);
            continue;
        }
        if (p.x < -50) powerups.splice(i, 1);
    }

    // Update Rintangan (dengan Hitbox Forgiving 8px agar adil & presisi)
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let o = obstacles[i];
        o.x -= currentSpeed;

        if (rectIntersect(player, o, 8)) {
            if (player.dashTimer > 0 || player.shieldTimer > 0 || player.jetpackTimer > 0) {
                screenShake = 6;
                spawnParticles(o.x + 20, o.y + 20, '#fbbf24', 14);
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
            let hitObs = false;
            for (let j = obstacles.length - 1; j >= 0; j--) {
                if (rectIntersect(pr, obstacles[j], 0)) {
                    screenShake = 4;
                    spawnParticles(obstacles[j].x + 20, obstacles[j].y + 20, '#f97316', 12);
                    addFloatingText(obstacles[j].x, obstacles[j].y, "+HANCUR", "#fbbf24");
                    obstacles.splice(j, 1);
                    hitObs = true;
                    break;
                }
            }
            if (hitObs) { projectiles.splice(i, 1); continue; }

            if (boss.active && rectIntersect(pr, boss, 0)) {
                const dmg = saveData.selectedPet === 'drone' ? 14 : 10;
                boss.hp -= dmg;
                boss.hitFlash = 7;
                screenShake = 5;
                spawnParticles(boss.x + 20, pr.y, '#fbbf24', 12);
                addFloatingText(boss.x + 30, boss.y, `-${dmg} HP`, "#fde047");
                projectiles.splice(i, 1);
                checkBossDefeated();
                continue;
            }
        } else {
            if (rectIntersect(pr, player, 6)) {
                if (player.shieldTimer <= 0 && player.dashTimer <= 0 && player.invincibleTimer <= 0) {
                    damagePlayer();
                } else {
                    spawnParticles(pr.x, pr.y, '#38bdf8', 10);
                    addFloatingText(player.x, player.y, "🛡️ TANGKIS!", "#38bdf8");
                }
                projectiles.splice(i, 1);
                continue;
            }
        }

        if (pr.x < -60 || pr.x > canvas.width + 60) projectiles.splice(i, 1);
    }

    updateHUD();
}

function damagePlayer() {
    player.hearts--;
    player.invincibleTimer = 75;
    screenShake = 12;
    playSound('hit');
    spawnParticles(player.x + 24, player.y + 24, '#ef4444', 18);
    addFloatingText(player.x, player.y, "💔 KENA SERANG!", "#ef4444");

    if (player.hearts <= 0) {
        endGame(false);
    }
}

function checkBossDefeated() {
    if (boss.hp <= 0) {
        boss.hp = 0;
        boss.active = false;
        screenShake = 15;
        spawnParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, '#fbbf24', 35);
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
        ? `Luar biasa! Kamu berhasil menembus Level ${saveData.level}!`
        : 'Ayo coba lagi atau tingkatkan Pahlawan & Pet di Toko!';
    document.getElementById('result-coins').textContent = sessionCoins;
    document.getElementById('btn-next').textContent = isWin
        ? `🚀 LANJUT LEVEL ${saveData.level}`
        : '🔄 COBA LAGI';
}

function rectIntersect(a, b, pad = 0) {
    return (a.x + pad) < (b.x + b.w - pad) &&
           (a.x + a.w - pad) > (b.x + pad) &&
           (a.y + pad) < (b.y + b.h - pad) &&
           (a.y + a.h - pad) > (b.y + pad);
}

// ==================== ENGINE RENDERING 3D KARAKTER, PET, & DUNIA ====================
function drawCharacterModel3D(targetCtx, charObj, cx, cy, size, opts = {}) {
    const runPhase = opts.runPhase || 0;
    const isJumping = opts.isJumping || false;
    const isDashing = opts.isDashing || false;
    const attackAnim = opts.attackAnim || 0;
    const scaleX = opts.scaleX || 1;
    const scaleY = opts.scaleY || 1;
    const flipAngle = opts.flipAngle || 0;

    targetCtx.save();
    targetCtx.translate(cx, cy);
    targetCtx.rotate(flipAngle + (isDashing ? 0.18 : 0));
    targetCtx.scale(scaleX, scaleY);

    const s = size / 56;
    const legSwing = isJumping ? 0.45 : Math.sin(runPhase) * 0.55;
    const armSwing = attackAnim > 0 ? -1.1 : -legSwing * 0.85;
    const bobY = isJumping ? 0 : Math.abs(Math.sin(runPhase)) * -3.5 * s;

    targetCtx.translate(0, bobY);

    // 1. Ekor / Jubah / Syal di Belakang Tubuh
    if (charObj.id === 'ninja') {
        // Syal Ninja Merah Berkibar Dinamis
        targetCtx.fillStyle = '#ef4444';
        targetCtx.beginPath();
        targetCtx.moveTo(-6 * s, -12 * s);
        for (let i = 1; i <= 4; i++) {
            const wave = Math.sin(worldTime * 3 + i) * 4 * s;
            targetCtx.lineTo((-10 - i * 7) * s, (-12 + i * 2) * s + wave);
        }
        targetCtx.lineTo(-18 * s, -4 * s);
        targetCtx.closePath();
        targetCtx.fill();
    } else if (charObj.id === 'elpadri') {
        // Jubah Kerajaan Sultan ELPADRI
        const capeGrad = targetCtx.createLinearGradient(-22 * s, -12 * s, 0, 20 * s);
        capeGrad.addColorStop(0, '#dc2626');
        capeGrad.addColorStop(1, '#7f1d1d');
        targetCtx.fillStyle = capeGrad;
        targetCtx.beginPath();
        targetCtx.moveTo(-6 * s, -10 * s);
        targetCtx.quadraticCurveTo(-24 * s, 4 * s + Math.sin(worldTime * 2.5) * 4 * s, -20 * s, 20 * s);
        targetCtx.lineTo(-2 * s, 16 * s);
        targetCtx.closePath();
        targetCtx.fill();
        targetCtx.strokeStyle = '#fbbf24';
        targetCtx.lineWidth = 1.8 * s;
        targetCtx.stroke();
    } else if (charObj.id === 'cat' || charObj.id === 'dino' || charObj.id === 'unicorn') {
        // Ekor Robotik / Pelangi
        targetCtx.strokeStyle = charObj.id === 'unicorn' ? '#f472b6' : charObj.color;
        targetCtx.lineWidth = (charObj.id === 'dino' ? 6 : 4) * s;
        targetCtx.lineCap = 'round';
        targetCtx.beginPath();
        targetCtx.moveTo(-10 * s, 10 * s);
        targetCtx.quadraticCurveTo(-24 * s, 4 * s + Math.sin(worldTime * 3) * 6 * s, -22 * s, -4 * s);
        targetCtx.stroke();
    }

    // 2. Kaki Belakang (3D Shaded Limb)
    targetCtx.save();
    targetCtx.translate(-3 * s, 14 * s);
    targetCtx.rotate(-legSwing);
    targetCtx.fillStyle = charObj.accent;
    targetCtx.beginPath();
    targetCtx.roundRect(-4.5 * s, 0, 9 * s, 14 * s, 4 * s);
    targetCtx.fill();
    targetCtx.restore();

    // 3. Lengan Belakang
    targetCtx.save();
    targetCtx.translate(-4 * s, -2 * s);
    targetCtx.rotate(-armSwing);
    targetCtx.fillStyle = charObj.accent;
    targetCtx.beginPath();
    targetCtx.roundRect(-4 * s, 0, 8 * s, 13 * s, 4 * s);
    targetCtx.fill();
    targetCtx.restore();

    // 4. Torso / Badan Armor 3D dengan Pencahayaan Volumetrik
    const bodyGrad = targetCtx.createLinearGradient(-14 * s, -12 * s, 14 * s, 16 * s);
    bodyGrad.addColorStop(0, charObj.glow);
    bodyGrad.addColorStop(0.35, charObj.color);
    bodyGrad.addColorStop(1, charObj.accent);
    targetCtx.fillStyle = bodyGrad;
    targetCtx.strokeStyle = '#ffffff';
    targetCtx.lineWidth = 1.6 * s;
    targetCtx.beginPath();
    targetCtx.roundRect(-13 * s, -10 * s, 26 * s, 26 * s, 8 * s);
    targetCtx.fill();
    targetCtx.stroke();

    // Reaktor Inti Dada (Chest Core 3D Glow)
    targetCtx.fillStyle = '#ffffff';
    targetCtx.shadowColor = charObj.glow;
    targetCtx.shadowBlur = 8 * s;
    targetCtx.beginPath();
    targetCtx.arc(4 * s, 3 * s, 4.2 * s, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.shadowBlur = 0;

    // 5. Kaki Depan
    targetCtx.save();
    targetCtx.translate(4 * s, 14 * s);
    targetCtx.rotate(legSwing);
    targetCtx.fillStyle = charObj.color;
    targetCtx.strokeStyle = '#ffffff';
    targetCtx.lineWidth = 1.2 * s;
    targetCtx.beginPath();
    targetCtx.roundRect(-4.5 * s, 0, 9 * s, 14 * s, 4 * s);
    targetCtx.fill();
    targetCtx.stroke();
    targetCtx.restore();

    // 6. Kepala 3D Volumetric
    targetCtx.save();
    targetCtx.translate(0, -19 * s);
    const headGrad = targetCtx.createRadialGradient(-4 * s, -6 * s, 2 * s, 0, 0, 18 * s);
    headGrad.addColorStop(0, '#ffffff');
    headGrad.addColorStop(0.25, charObj.color);
    headGrad.addColorStop(1, charObj.accent);

    targetCtx.fillStyle = charObj.id === 'ninja' ? '#1e293b' : headGrad;
    targetCtx.strokeStyle = '#ffffff';
    targetCtx.lineWidth = 1.8 * s;
    targetCtx.beginPath();
    targetCtx.roundRect(-15 * s, -13 * s, 30 * s, 24 * s, 9 * s);
    targetCtx.fill();
    targetCtx.stroke();

    // Visor / Wajah Karakter 3D
    targetCtx.fillStyle = '#090d16';
    targetCtx.beginPath();
    targetCtx.roundRect(-7 * s, -7 * s, 20 * s, 11 * s, 5 * s);
    targetCtx.fill();

    // Mata Cyber Neon Menyala
    targetCtx.fillStyle = charObj.id === 'ninja' ? '#ef4444' : (charObj.id === 'elpadri' ? '#fde047' : '#38bdf8');
    targetCtx.shadowColor = targetCtx.fillStyle;
    targetCtx.shadowBlur = 6 * s;
    targetCtx.beginPath();
    targetCtx.roundRect(-3 * s, -4 * s, 5 * s, 5 * s, 2 * s);
    targetCtx.roundRect(5 * s, -4 * s, 5 * s, 5 * s, 2 * s);
    targetCtx.fill();
    targetCtx.shadowBlur = 0;

    // Aksesori Kepala Unik Tiap Karakter
    if (charObj.hat === 'ears') {
        // Telinga Mecha Cat 3D
        targetCtx.fillStyle = charObj.color;
        targetCtx.beginPath();
        targetCtx.moveTo(-13 * s, -12 * s); targetCtx.lineTo(-7 * s, -22 * s); targetCtx.lineTo(-2 * s, -12 * s);
        targetCtx.moveTo(2 * s, -12 * s); targetCtx.lineTo(8 * s, -22 * s); targetCtx.lineTo(13 * s, -12 * s);
        targetCtx.fill();
    } else if (charObj.hat === 'horn') {
        // Tanduk Kristal Unicorn
        targetCtx.fillStyle = '#fde047';
        targetCtx.beginPath();
        targetCtx.moveTo(2 * s, -12 * s); targetCtx.lineTo(11 * s, -26 * s); targetCtx.lineTo(9 * s, -12 * s);
        targetCtx.fill();
    } else if (charObj.hat === 'crown') {
        // Mahkota Emas Sultan ELPADRI
        targetCtx.fillStyle = '#fbbf24';
        targetCtx.strokeStyle = '#fef08a';
        targetCtx.lineWidth = 1.5 * s;
        targetCtx.beginPath();
        targetCtx.moveTo(-12 * s, -12 * s);
        targetCtx.lineTo(-12 * s, -23 * s);
        targetCtx.lineTo(-5 * s, -17 * s);
        targetCtx.lineTo(0, -25 * s);
        targetCtx.lineTo(5 * s, -17 * s);
        targetCtx.lineTo(12 * s, -23 * s);
        targetCtx.lineTo(12 * s, -12 * s);
        targetCtx.closePath();
        targetCtx.fill();
        targetCtx.stroke();
    } else if (charObj.hat === 'headset') {
        // Headset Gaming RGB Dino
        targetCtx.strokeStyle = '#38bdf8';
        targetCtx.lineWidth = 3.5 * s;
        targetCtx.beginPath();
        targetCtx.arc(0, -4 * s, 16 * s, Math.PI * 0.85, Math.PI * 0.15);
        targetCtx.stroke();
        targetCtx.fillStyle = '#ef4444';
        targetCtx.beginPath();
        targetCtx.arc(-13 * s, -1 * s, 5 * s, 0, Math.PI * 2);
        targetCtx.fill();
    } else if (charObj.hat === 'helmet') {
        // Kubah Kaca Astronot 3D
        targetCtx.strokeStyle = 'rgba(186, 230, 253, 0.85)';
        targetCtx.lineWidth = 2.2 * s;
        targetCtx.beginPath();
        targetCtx.arc(0, -1 * s, 17 * s, 0, Math.PI * 2);
        targetCtx.stroke();
    } else if (charObj.hat === 'bandana') {
        // Ikat Kepala Ninja
        targetCtx.fillStyle = '#ef4444';
        targetCtx.fillRect(-15 * s, -11 * s, 30 * s, 4.5 * s);
    } else {
        // Antena Cyber Visor
        targetCtx.strokeStyle = '#38bdf8';
        targetCtx.lineWidth = 2.2 * s;
        targetCtx.beginPath();
        targetCtx.moveTo(0, -13 * s);
        targetCtx.lineTo(0, -21 * s);
        targetCtx.stroke();
        targetCtx.fillStyle = '#fde047';
        targetCtx.beginPath();
        targetCtx.arc(0, -22 * s, 3 * s, 0, Math.PI * 2);
        targetCtx.fill();
    }
    targetCtx.restore();

    // 7. Lengan Depan & Efek Senjata Energi saat Menyerang
    targetCtx.save();
    targetCtx.translate(5 * s, -1 * s);
    targetCtx.rotate(armSwing);
    targetCtx.fillStyle = charObj.color;
    targetCtx.strokeStyle = '#ffffff';
    targetCtx.lineWidth = 1.2 * s;
    targetCtx.beginPath();
    targetCtx.roundRect(-4 * s, 0, 8.5 * s, 13 * s, 4 * s);
    targetCtx.fill();
    targetCtx.stroke();

    if (attackAnim > 0 || isDashing) {
        // Pedang / Meriam Plasma Menyala
        targetCtx.fillStyle = '#fde047';
        targetCtx.shadowColor = charObj.glow;
        targetCtx.shadowBlur = 10 * s;
        targetCtx.beginPath();
        targetCtx.roundRect(-2 * s, 10 * s, 6 * s, 18 * s, 3 * s);
        targetCtx.fill();
        targetCtx.shadowBlur = 0;
    }
    targetCtx.restore();

    targetCtx.restore();
}

function drawPetModel3D(targetCtx, petObj, px, py, size) {
    if (!petObj || petObj.id === 'none') return;
    const s = size / 40;
    targetCtx.save();
    targetCtx.translate(px, py);

    // Aura Cahaya Pet
    const grad = targetCtx.createRadialGradient(0, 0, 2 * s, 0, 0, 18 * s);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.45, petObj.color || '#38bdf8');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    targetCtx.fillStyle = grad;
    targetCtx.beginPath();
    targetCtx.arc(0, 0, 18 * s, 0, Math.PI * 2);
    targetCtx.fill();

    // Badan Drone / Pet 3D
    targetCtx.fillStyle = petObj.color || '#38bdf8';
    targetCtx.strokeStyle = '#ffffff';
    targetCtx.lineWidth = 1.8 * s;
    targetCtx.beginPath();
    targetCtx.arc(0, 0, 10 * s, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.stroke();

    // Sayap / Baling-Baling Beranimasi
    const wingY = Math.sin(worldTime * 6) * 5 * s;
    targetCtx.strokeStyle = '#fde047';
    targetCtx.lineWidth = 2.2 * s;
    targetCtx.beginPath();
    targetCtx.moveTo(-10 * s, 0); targetCtx.lineTo(-17 * s, -5 * s + wingY);
    targetCtx.moveTo(10 * s, 0); targetCtx.lineTo(17 * s, -5 * s + wingY);
    targetCtx.stroke();

    // Mata Inti Pet
    targetCtx.fillStyle = '#090d16';
    targetCtx.beginPath();
    targetCtx.arc(3 * s, -1 * s, 3 * s, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.fillStyle = '#ffffff';
    targetCtx.beginPath();
    targetCtx.arc(4 * s, -2 * s, 1.2 * s, 0, Math.PI * 2);
    targetCtx.fill();

    targetCtx.restore();
}

function drawBossModel3D(targetCtx, b) {
    targetCtx.save();
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2 + Math.sin(worldTime * 2) * 4;

    // Bayangan Lantai Boss 3D
    const groundY = getGroundY();
    targetCtx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    targetCtx.beginPath();
    targetCtx.ellipse(cx, groundY + 6, b.w * 0.42, 9, 0, 0, Math.PI * 2);
    targetCtx.fill();

    targetCtx.translate(cx, cy);

    // Aura Energi Gelap Boss
    const aura = targetCtx.createRadialGradient(0, 0, 15, 0, 0, 68);
    aura.addColorStop(0, b.hitFlash > 0 ? '#ffffff' : 'rgba(239, 68, 68, 0.65)');
    aura.addColorStop(1, 'rgba(239, 68, 68, 0)');
    targetCtx.fillStyle = aura;
    targetCtx.beginPath();
    targetCtx.arc(0, 0, 68, 0, Math.PI * 2);
    targetCtx.fill();

    // Tanduk Mecha Raksasa
    targetCtx.fillStyle = '#fbbf24';
    targetCtx.strokeStyle = '#ffffff';
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.moveTo(-28, -32); targetCtx.lineTo(-46, -62); targetCtx.lineTo(-14, -40);
    targetCtx.moveTo(28, -32); targetCtx.lineTo(46, -62); targetCtx.lineTo(14, -40);
    targetCtx.fill();
    targetCtx.stroke();

    // Badan Baja 3D Mecha-Oni
    const bossGrad = targetCtx.createLinearGradient(-45, -45, 45, 45);
    if (b.hitFlash > 0) {
        bossGrad.addColorStop(0, '#ffffff');
        bossGrad.addColorStop(1, '#fde047');
    } else {
        bossGrad.addColorStop(0, '#ef4444');
        bossGrad.addColorStop(0.5, '#991b1b');
        bossGrad.addColorStop(1, '#1e1b4b');
    }
    targetCtx.fillStyle = bossGrad;
    targetCtx.strokeStyle = '#fca5a5';
    targetCtx.lineWidth = 3.5;
    targetCtx.beginPath();
    targetCtx.roundRect(-44, -42, 88, 84, 22);
    targetCtx.fill();
    targetCtx.stroke();

    // Visor & Mata Siber Boss
    targetCtx.fillStyle = '#090d16';
    targetCtx.beginPath();
    targetCtx.roundRect(-34, -22, 68, 22, 8);
    targetCtx.fill();

    targetCtx.fillStyle = '#fde047';
    targetCtx.shadowColor = '#fde047';
    targetCtx.shadowBlur = 10;
    targetCtx.beginPath();
    targetCtx.moveTo(-26, -16); targetCtx.lineTo(-8, -10); targetCtx.lineTo(-26, -6);
    targetCtx.moveTo(26, -16); targetCtx.lineTo(8, -10); targetCtx.lineTo(26, -6);
    targetCtx.fill();
    targetCtx.shadowBlur = 0;

    // Mulut Grill Mekanik & Taring
    targetCtx.fillStyle = '#1e293b';
    targetCtx.beginPath();
    targetCtx.roundRect(-24, 10, 48, 18, 6);
    targetCtx.fill();
    targetCtx.fillStyle = '#ffffff';
    for (let i = -18; i <= 18; i += 12) {
        targetCtx.beginPath();
        targetCtx.moveTo(i - 4, 10); targetCtx.lineTo(i, 20); targetCtx.lineTo(i + 4, 10);
        targetCtx.fill();
    }

    // Cakar Mekanik Kiri-Kanan Beranimasi
    const clawOffset = Math.sin(worldTime * 4) * 8;
    targetCtx.fillStyle = '#dc2626';
    targetCtx.strokeStyle = '#fde047';
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.roundRect(-62, -6 + clawOffset, 16, 28, 6);
    targetCtx.roundRect(46, -6 - clawOffset, 16, 28, 6);
    targetCtx.fill();
    targetCtx.stroke();

    targetCtx.restore();
}

// ==================== RENDER VISUAL KANVAS UTAMA ====================
function drawGame() {
    const biome = BIOMES[(saveData.level - 1) % BIOMES.length];
    const groundY = getGroundY();

    ctx.save();
    if (screenShake > 0) {
        const sx = (Math.random() - 0.5) * screenShake * 2;
        const sy = (Math.random() - 0.5) * screenShake * 2;
        ctx.translate(sx, sy);
    }

    // 1. Langit Gradien 3D sesuai Dunia/Biome
    const grad = ctx.createLinearGradient(0, 0, 0, groundY);
    grad.addColorStop(0, biome.sky1);
    grad.addColorStop(1, biome.sky2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Bintang Latar Belakang Berlapis
    bgStars.forEach(s => {
        if (gameState === 'PLAYING') s.x -= s.speed;
        if (s.x < 0) s.x = canvas.width;
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y % (groundY - 40), s.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // 3. Gedung Cyberpunk 3D Parallax di Kejauhan
    bgBuildings.forEach(b => {
        if (gameState === 'PLAYING') {
            b.x -= gameSpeed * b.depth * 0.35;
        } else {
            b.x -= 0.25 * b.depth;
        }
        if (b.x + b.w < 0) b.x = canvas.width + 40;

        const by = groundY - b.h;
        ctx.fillStyle = biome.building;
        ctx.strokeStyle = biome.grid;
        ctx.lineWidth = 1.5;
        ctx.fillRect(b.x, by, b.w, b.h);
        ctx.strokeRect(b.x, by, b.w, b.h);

        // Jendela Neon Gedung
        ctx.fillStyle = biome.top;
        ctx.globalAlpha = 0.28;
        for (let wy = by + 14; wy < groundY - 18; wy += 22) {
            ctx.fillRect(b.x + 10, wy, b.w - 20, 6);
        }
        ctx.globalAlpha = 1.0;
    });

    // 4. Lantai Perspektif 3D (Cyber Horizon Grid)
    const floorGrad = ctx.createLinearGradient(0, groundY, 0, canvas.height);
    floorGrad.addColorStop(0, biome.ground);
    floorGrad.addColorStop(1, '#02040a');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    // Garis Perspektif 3D di Lantai
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, groundY, canvas.width, canvas.height - groundY);
    ctx.clip();
    ctx.strokeStyle = biome.grid;
    ctx.lineWidth = 1.8;

    const vanishX = canvas.width * 0.5;
    const vanishY = groundY - 90;
    for (let x = -canvas.width; x < canvas.width * 2; x += 80) {
        const gx = x - gridScroll;
        ctx.beginPath();
        ctx.moveTo(gx, groundY);
        ctx.lineTo(vanishX + (gx - vanishX) * 2.8, canvas.height);
        ctx.stroke();
    }
    for (let yOffset = 18; yOffset < canvas.height - groundY; yOffset *= 1.55) {
        ctx.beginPath();
        ctx.moveTo(0, groundY + yOffset);
        ctx.lineTo(canvas.width, groundY + yOffset);
        ctx.stroke();
    }
    ctx.restore();

    // Garis Horizon Neon Menyala
    ctx.fillStyle = biome.top;
    ctx.shadowColor = biome.top;
    ctx.shadowBlur = 12;
    ctx.fillRect(0, groundY, canvas.width, 6);
    ctx.shadowBlur = 0;

    // Watermark Hak Cipta ELPADRI
    ctx.save();
    ctx.font = 'bold 13px Fredoka, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.textAlign = 'center';
    ctx.fillText(`DUNIA: ${biome.name} | © ELPADRI 3D ENGINE`, canvas.width / 2, groundY + 26);
    ctx.restore();

    if (gameState === 'MENU') {
        ctx.restore();
        return;
    }

    // 5. Gambar Koin Emas 3D Berputar
    coinsList.forEach(c => {
        ctx.save();
        const spinScale = Math.max(0.25, Math.abs(Math.cos(worldTime * 2.5 + (c.phase || 0))));
        ctx.translate(c.x, c.y);
        ctx.scale(spinScale, 1);

        const cGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, c.r);
        cGrad.addColorStop(0, '#fef08a');
        cGrad.addColorStop(0.6, '#fbbf24');
        cGrad.addColorStop(1, '#b45309');
        ctx.fillStyle = cGrad;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★', 0, 4);
        ctx.restore();
    });

    // 6. Gambar Kapsul Powerup 3D
    powerups.forEach(p => {
        ctx.save();
        const py = p.y + Math.sin(worldTime * 3) * 5;
        const colors = { shield: '#38bdf8', magnet: '#eab308', jetpack: '#f97316', rocket: '#22c55e' };
        const icons = { shield: '🛡️', magnet: '🧲', jetpack: '🚀', rocket: '💣' };
        const col = colors[p.type] || '#38bdf8';

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = col;
        ctx.lineWidth = 3;
        ctx.shadowColor = col;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, py + p.h / 2, 21, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(icons[p.type] || '⭐', p.x + p.w / 2, py + 28);
        ctx.restore();
    });

    // 7. Gambar Rintangan & Musuh 3D
    obstacles.forEach(o => {
        ctx.save();
        const cx = o.x + o.w / 2;
        const cy = o.y + o.h / 2;

        // Bayangan Lantai Rintangan
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(cx, groundY + 4, 18, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        if (o.type === 'spike') {
            // Piramida Duri Laser 3D
            const sGrad = ctx.createLinearGradient(o.x, o.y, o.x + o.w, o.y + o.h);
            sGrad.addColorStop(0, '#fda4af');
            sGrad.addColorStop(0.4, '#ef4444');
            sGrad.addColorStop(1, '#7f1d1d');
            ctx.fillStyle = sGrad;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, o.y + 2);
            ctx.lineTo(o.x + o.w - 2, o.y + o.h);
            ctx.lineTo(o.x + 2, o.y + o.h);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (o.type === 'slime') {
            // Cyber Bio-Slime 3D Membal
            const wobble = Math.sin(worldTime * 4) * 3;
            const slGrad = ctx.createRadialGradient(cx - 5, cy - 5, 3, cx, cy, 24);
            slGrad.addColorStop(0, '#bbf7d0');
            slGrad.addColorStop(0.5, '#22c55e');
            slGrad.addColorStop(1, '#14532d');
            ctx.fillStyle = slGrad;
            ctx.strokeStyle = '#86efac';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy + 4 + wobble * 0.3, 21 - wobble * 0.2, Math.PI, 0);
            ctx.lineTo(o.x + o.w, o.y + o.h);
            ctx.lineTo(o.x, o.y + o.h);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Mata Slime
            ctx.fillStyle = '#090d16';
            ctx.beginPath();
            ctx.arc(cx - 6, cy + 2, 3.5, 0, Math.PI * 2);
            ctx.arc(cx + 6, cy + 2, 3.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Drone Alien UFO 3D
            const hover = Math.sin(worldTime * 3.5) * 5;
            ctx.fillStyle = '#c084fc';
            ctx.beginPath();
            ctx.arc(cx, cy - 4 + hover, 13, Math.PI, 0);
            ctx.fill();

            const ufoGrad = ctx.createLinearGradient(o.x, cy, o.x + o.w, cy);
            ufoGrad.addColorStop(0, '#6b21a8');
            ufoGrad.addColorStop(0.5, '#a855f7');
            ufoGrad.addColorStop(1, '#3b0764');
            ctx.fillStyle = ufoGrad;
            ctx.strokeStyle = '#f0abfc';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(cx, cy + hover, 23, 9, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
    });

    // 8. Jejak Bayangan Dash (Afterimages)
    for (let i = afterimages.length - 1; i >= 0; i--) {
        const ai = afterimages[i];
        ai.x -= gameSpeed * 0.5;
        ai.alpha -= 0.05;
        if (ai.alpha <= 0) {
            afterimages.splice(i, 1);
            continue;
        }
        const cObj = CHARACTERS.find(c => c.id === ai.charId) || CHARACTERS[0];
        ctx.save();
        ctx.globalAlpha = ai.alpha * 0.55;
        drawCharacterModel3D(ctx, cObj, ai.x + player.w / 2, ai.y + player.h / 2, 52, { isDashing: true });
        ctx.restore();
    }

    // 9. Gambar Karakter Pemain & Pet 3D
    drawPlayer();

    // 10. Gambar Boss Monster 3D
    if (boss.active) {
        drawBossModel3D(ctx, boss);
    }

    // 11. Gambar Peluru Laser Plasma 3D
    projectiles.forEach(pr => {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = pr.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = pr.glow || pr.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(pr.x, pr.y, pr.w, pr.h, 8);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    });

    // 12. Partikel 3D Glowing & Teks Melayang
    for (let i = particles.length - 1; i >= 0; i--) {
        let pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.life / 24);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        if (pt.life <= 0) particles.splice(i, 1);
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        let ft = floatingTexts[i];
        ft.y -= 1.3;
        ft.life--;
        ctx.save();
        ctx.font = '800 17px Fredoka, sans-serif';
        ctx.fillStyle = ft.color;
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 3.5;
        ctx.textAlign = 'center';
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
        if (ft.life <= 0) floatingTexts.splice(i, 1);
    }

    ctx.restore();
}

function drawPlayer() {
    const charObj = CHARACTERS.find(c => c.id === saveData.selectedChar) || CHARACTERS[0];
    const petObj = PETS.find(p => p.id === saveData.selectedPet);
    const groundY = getGroundY();

    ctx.save();

    // Bayangan Dinamis 3D di Lantai (Mengecil saat karakter melompat tinggi)
    const heightRatio = Math.max(0.25, 1 - (groundY - (player.y + player.h)) / 220);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    ctx.beginPath();
    ctx.ellipse(player.x + player.w / 2, groundY + 5, 22 * heightRatio, 6 * heightRatio, 0, 0, Math.PI * 2);
    ctx.fill();

    if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer / 4) % 2 === 0) {
        ctx.globalAlpha = 0.45;
    }

    // Aura Perisai Hologram 3D
    if (player.shieldTimer > 0) {
        const sGrad = ctx.createRadialGradient(
            player.x + player.w / 2, player.y + player.h / 2, 10,
            player.x + player.w / 2, player.y + player.h / 2, 42
        );
        sGrad.addColorStop(0, 'rgba(56, 189, 248, 0.05)');
        sGrad.addColorStop(0.8, 'rgba(56, 189, 248, 0.35)');
        sGrad.addColorStop(1, 'rgba(186, 230, 253, 0.85)');
        ctx.fillStyle = sGrad;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(player.x + player.w / 2, player.y + player.h / 2, 42, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // Render Model Karakter 3D Beranimasi
    drawCharacterModel3D(
        ctx,
        charObj,
        player.x + player.w / 2,
        player.y + player.h / 2 + 2,
        54,
        {
            runPhase: player.runPhase,
            isJumping: player.y < groundY - player.h - 2,
            isDashing: player.dashTimer > 0,
            attackAnim: player.attackAnim,
            scaleX: player.scaleX,
            scaleY: player.scaleY,
            flipAngle: player.flipAngle
        }
    );

    // Render Pet 3D Melayang di Belakang Pemain
    if (petObj && petObj.id !== 'none') {
        const floatY = Math.sin(worldTime * 2.4) * 7;
        drawPetModel3D(ctx, petObj, player.x - 26, player.y + 8 + floatY, 38);
    }

    ctx.restore();
}

function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 9,
            vy: (Math.random() - 0.5) * 9,
            size: Math.random() * 4.5 + 2,
            color,
            life: 24
        });
    }
}

function addFloatingText(x, y, text, color) {
    floatingTexts.push({ x, y, text, color, life: 45 });
}

// ==================== RENDER AVATAR 3D KE MENU & TOKO ====================
function createAvatarCanvas(item, isChar = true, size = 68) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const cCtx = c.getContext('2d');
    if (isChar) {
        drawCharacterModel3D(cCtx, item, size / 2, size / 2 + 5, size * 0.78, { runPhase: 0.4 });
    } else {
        if (item.id === 'none') {
            cCtx.font = '28px sans-serif';
            cCtx.textAlign = 'center';
            cCtx.fillText('❌', size / 2, size / 2 + 10);
        } else {
            drawPetModel3D(cCtx, item, size / 2, size / 2, size * 0.85);
        }
    }
    return c;
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
        label.textContent = `👹 BOSS MECHA: ${boss.hp} / ${boss.maxHp} HP (Tekan SERANG!)`;
    }

    const puContainer = document.getElementById('powerup-indicators');
    puContainer.innerHTML = '';
    if (player.shieldTimer > 0) puContainer.innerHTML += `<div class="pu-badge">🛡️ Perisai (${Math.ceil(player.shieldTimer / 60)}s)</div>`;
    if (player.magnetTimer > 0) puContainer.innerHTML += `<div class="pu-badge">🧲 Magnet (${Math.ceil(player.magnetTimer / 60)}s)</div>`;
    if (player.jetpackTimer > 0) puContainer.innerHTML += `<div class="pu-badge">🚀 Jetpack (${Math.ceil(player.jetpackTimer / 60)}s)</div>`;
}

function updateMenuUI() {
    document.getElementById('menu-coins').textContent = saveData.coins;
    document.getElementById('shop-coins').textContent = saveData.coins;
    document.getElementById('gacha-coins').textContent = saveData.coins;
    document.getElementById('menu-level').textContent = saveData.level;
    document.getElementById('btn-lvl-num').textContent = saveData.level;

    const charObj = CHARACTERS.find(c => c.id === saveData.selectedChar) || CHARACTERS[0];
    const petObj = PETS.find(p => p.id === saveData.selectedPet) || PETS[0];

    const avatarContainer = document.getElementById('preview-avatar');
    avatarContainer.innerHTML = '';
    avatarContainer.appendChild(createAvatarCanvas(charObj, true, 76));

    document.getElementById('preview-name').textContent = charObj.name;
    document.getElementById('preview-pet').textContent = `Pet: ${petObj.name}`;
}

// Render Toko Karakter & Pet dengan Preview 3D
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
            <div class="shop-icon"></div>
            <div class="shop-name"><strong>${item.name}</strong></div>
            <div class="shop-desc">${item.desc}</div>
            <button class="shop-btn ${isSelected ? 'active' : (isUnlocked ? 'use' : 'buy')}">
                ${isSelected ? '✅ DIPAKAI' : (isUnlocked ? 'PAKAI' : `🪙 ${item.price}`)}
            </button>
        `;

        card.querySelector('.shop-icon').appendChild(
            createAvatarCanvas(item, currentShopTab === 'chars', 64)
        );

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
                showToast('⚠️ Koin belum cukup! Ayo main atau buka Kotak Kejutan!');
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
```
