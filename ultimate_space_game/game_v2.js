const SHOP_COST = 50;
const CRUISER_COST = 1000;
const CRUISER_SHOP_ITEMS = [
    { key: 'ship_cruiser_3', name: 'Cruiser 3', image: './assets/space_intruder/ui/space_cruiser_3.png' },
    { key: 'ship_cruiser_4', name: 'Cruiser 4', image: './assets/space_intruder/ui/space_cruiser_4.png' },
    { key: 'ship_cruiser_8', name: 'Cruiser 8', image: './assets/space_intruder/ui/space_cruiser_8.png' },
    { key: 'ship_cruiser_9', name: 'Cruiser 9', image: './assets/space_intruder/ui/space_cruiser_9.png' }
];
const SHOP_ITEMS = [
    { id: 'extraLife', name: 'Extra Life', description: '+1 starting heart', icon: 'shop_extra_life' },
    { id: 'bulletUpgrade', name: 'Bullet Upgrade', description: '+2 starting bullets (max 3)', icon: 'shop_bullet' },
    { id: 'shield', name: 'Shield', description: '10 seconds of shield', icon: 'shop_shield' },
    { id: 'speedBoost', name: 'Speed Boost', description: '10 seconds of extra speed', icon: 'shop_speed' },
    { id: 'rapidFire', name: 'Rapid Fire', description: '10 seconds of rapid fire', icon: 'shop_rapid_fire' },
    { id: 'triple', name: 'Triple', description: '2 random cruisers fly beside you and fire', icon: 'shop_triple' }
];
const UPGRADE_ITEMS = [
    { id: 'shieldLives', name: 'Shield Upgrade', description: '+1 starting heart per level', cost: 200 },
    { id: 'bulletUpgrade', name: 'Bullet Power', description: '+1 starting bullet per level', cost: 150 },
    { id: 'shieldDuration', name: 'Shield Duration', description: '+5 seconds to shield power-ups', cost: 100 },
    { id: 'speedDuration', name: 'Speed Duration', description: '+5 seconds to speed power-ups', cost: 100 },
    { id: 'slowDuration', name: 'Slow Duration', description: '+5 seconds to slow power-ups', cost: 100 },
    { id: 'scoreDuration', name: 'Score Duration', description: '+5 seconds to double-score power-ups', cost: 100 },
    { id: 'nukePower', name: 'Nuke Power', description: '+10 boss damage per level', cost: 150 },
    { id: 'healPower', name: 'Heal Power', description: '+1 heart restored per level', cost: 100 },
    { id: 'rapidFireDuration', name: 'Rapid-Fire Duration', description: '+5 seconds to rapid fire', cost: 150 },
    { id: 'armor', name: 'Ship Armor', description: '+1 asteroid hit absorbed each run', cost: 500 }
];
const MAX_UPGRADE_LEVEL = 3;
const DEFAULT_UPGRADES = {
    shieldLives: 0,
    bulletUpgrade: 0,
    shieldDuration: 0,
    speedDuration: 0,
    slowDuration: 0,
    scoreDuration: 0,
    nukePower: 0,
    healPower: 0,
    rapidFireDuration: 0,
    armor: 0
};
const TUTORIAL_LESSONS = [
    {
        title: '1. Move & dodge',
        text: 'Use ← and → or the on-screen ◀ and ▶ buttons to steer. Avoid asteroids: a hit costs a heart. Cruiser 3 moves faster; Cruiser 4 starts with an extra heart.'
    },
    {
        title: '2. Fire & score',
        text: 'Press SPACE or hold FIRE to shoot. Each asteroid you destroy adds score. Every 10 destroyed asteroids can drop a power-up.'
    },
    {
        title: '3. Cruiser specials',
        text: 'Press C or tap C for your ship’s special ability. Cruiser 7: shield. Cruiser 3: speed burst. Cruiser 4: repair one heart. Cruiser 8: rapid overdrive. Cruiser 9: asteroid-clearing salvo. Specials recharge after 15 seconds.'
    },
    {
        title: '4. Collect power-ups',
        text: 'Touch a falling icon to collect it: red adds bullets, green gives a shield, blue boosts speed, yellow slows asteroids, purple doubles score, white clears asteroids and damages bosses, pink heals, and the rocket gives rapid fire.'
    },
    {
        title: '5. Ships & upgrades',
        text: 'Press X or tap SHIPS to choose an available cruiser. Boss drops are temporary for that run. Buy Cruisers 3, 4, 8, or 9 in the Cruiser Shop for 1,000 credits each. Permanent upgrades improve hearts, bullets, power-up duration, healing, nukes, and armor.'
    },
    {
        title: '6. Bosses & levels',
        text: 'Every 100 score points brings a boss. Bosses grow tougher by 50 HP each time. Defeating one advances the level; asteroids get faster. A boss collision costs two hearts unless armor absorbs it.'
    },
    {
        title: '7. Pause & fullscreen',
        text: 'Press Z or tap Ⅱ to pause. Resume, restart, or exit to the hangar from the pause menu. Press 1 or tap the Fullscreen button to expand the game; press 1 or Esc to leave fullscreen.'
    }
];

function readSavedValue(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
    } catch (error) {
        return fallback;
    }
}

function saveValue(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn('Could not save game data:', error);
    }
}

function styleSpaceTitle(title, size = 28, glowColor = '#29DFFF') {
    return title
        .setFontFamily('Arial Black, Arial, sans-serif')
        .setFontStyle('bold')
        .setColor('#D9FBFF')
        .setStroke('#171A65', Math.max(3, Math.round(size / 9)))
        .setShadow(0, 0, glowColor, 14, true, true);
}

const PLAYFIELD_WIDTH = 800;
const PLAYFIELD_HEIGHT = 600;

// Zooms the 800 x 600 playfield to fit the current phone/browser window and keeps it centered.
// Layout stays in playfield coordinates, so nothing needs to be repositioned for each screen size.
// Multiplier on the width fit. 1 = playfield exactly as wide as the screen (laptop or phone).
const PLAYFIELD_SCREEN_FILL = 0.8;
// Horizontal offset in world units. 0 = centered.
const PLAYFIELD_SHIFT_X = 0;

function getPlayfieldCenterX() {
    return PLAYFIELD_WIDTH / 2 + PLAYFIELD_SHIFT_X;
}

function getPlayfieldZoom(scene) {
    return (scene.scale.width / PLAYFIELD_WIDTH) * PLAYFIELD_SCREEN_FILL;
}

function fitPlayfieldCamera(scene) {
    const applyFit = () => {
        const camera = scene.cameras.main;
        camera.setZoom(getPlayfieldZoom(scene));
        camera.centerOn(getPlayfieldCenterX(), PLAYFIELD_HEIGHT / 2);
    };
    applyFit();
    if (!scene.__playfieldFitInstalled) {
        scene.__playfieldFitInstalled = true;
        scene.scale.on('resize', applyFit);
        scene.events.once('shutdown', () => scene.scale.off('resize', applyFit));
    }
}

// Adds a background image that covers everything the camera can see, including the area outside the playfield.
function addFullScreenBackground(scene, key) {
    const image = scene.add.image(getPlayfieldCenterX(), PLAYFIELD_HEIGHT / 2, key).setDepth(-1000);
    const resizeImage = () => {
        const zoom = getPlayfieldZoom(scene);
        const visibleWidth = Math.max(PLAYFIELD_WIDTH, scene.scale.width / zoom);
        const visibleHeight = Math.max(PLAYFIELD_HEIGHT, scene.scale.height / zoom);
        image.setPosition(getPlayfieldCenterX(), PLAYFIELD_HEIGHT / 2).setDisplaySize(visibleWidth, visibleHeight);
    };
    resizeImage();
    scene.scale.on('resize', resizeImage);
    scene.events.once('shutdown', () => scene.scale.off('resize', resizeImage));
    return image;
}

// Start Scene
class StartScene extends Phaser.Scene {
    constructor() { super('StartScene'); }
    preload() {
        this.load.image('start_bg', './assets/space_invader_start/sprites/space_world_background.png');
        this.load.image('button', './assets/space_invader_start/ui/round_buttons_1.png');
        this.load.image('shop_extra_life', './assets/space_intruder/ui/hearts_4.png');
        this.load.image('shop_bullet', './assets/space_intruder/ui/power_up_6.png');
        this.load.image('shop_shield', './assets/space_intruder/ui/power_up_1.png');
        this.load.image('shop_speed', './assets/space_intruder/ui/power_up_3.png');
        this.load.image('shop_rapid_fire', './assets/space_intruder/sprites/space_rocket_4.png');
        this.load.image('shop_triple', './assets/space_intruder/ui/power_up_19.png');
        this.load.image('store_player', './assets/space_intruder/sprites/space_cruiser_7.png');
        CRUISER_SHOP_ITEMS.forEach(item => this.load.image('store_' + item.key, item.image));
    }
    create() {
        fitPlayfieldCamera(this);
        addFullScreenBackground(this, 'start_bg');
        this.createSpaceAmbience();
        this.add.ellipse(400, 330, 510, 460, 0x3520A0, 0.12).setDepth(0);
        const titleUnderline = this.add.rectangle(400, 116, 350, 2, 0x66EFFF, 0.9).setDepth(2);
        this.tweens.add({ targets: titleUnderline, scaleX: { from: 0.82, to: 1.05 }, alpha: { from: 0.45, to: 1 }, duration: 1500, yoyo: true, repeat: -1 });
        const titleGlow = this.add.text(400, 82, 'ULTIMATE SPACE GAME', {
            fontFamily: 'Arial Black, Arial, sans-serif',
            fontSize: '40px',
            fill: '#805BFF',
            stroke: '#21D9FF',
            strokeThickness: 12,
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0.42).setShadow(0, 0, '#6D48FF', 24, true, true);
        const title = this.add.text(400, 82, 'ULTIMATE SPACE GAME', {
            fontFamily: 'Arial Black, Arial, sans-serif',
            fontSize: '38px',
            fill: '#D9FBFF',
            stroke: '#171A65',
            strokeThickness: 5,
            fontStyle: 'bold'
        }).setOrigin(0.5).setShadow(0, 0, '#29DFFF', 14, true, true);
        this.add.text(400, 137, 'DEFEND THE GALAXY  •  COMMAND YOUR CRUISER', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '13px',
            fill: '#C5EFFF',
            stroke: '#10154A',
            strokeThickness: 3,
            letterSpacing: 2
        }).setOrigin(0.5).setDepth(5).setAlpha(0.9);
        [
            [180, 80, 3], [213, 53, 2], [590, 55, 2], [625, 83, 3]
        ].forEach(([x, y, radius], index) => {
            const star = this.add.circle(x, y, radius, index % 2 ? 0xCBA8FF : 0x7AF2FF).setAlpha(0.8);
            this.tweens.add({ targets: star, alpha: 0.2, duration: 700 + index * 180, yoyo: true, repeat: -1 });
        });
        this.tweens.add({ targets: titleGlow, alpha: { from: 0.3, to: 0.5 }, duration: 1400, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: title, alpha: { from: 0.9, to: 1 }, duration: 1400, yoyo: true, repeat: -1 });
        const credits = readSavedValue('spaceGameCredits', 0);
        const highScore = readSavedValue('spaceGameHighScore', 0);
        this.credits = Number.isFinite(credits) ? credits : 0;
        this.highScore = Number.isFinite(highScore) ? highScore : 0;
        this.purchasedShopItems = readSavedValue('spaceGameShopPurchases', []);
        if (!Array.isArray(this.purchasedShopItems)) this.purchasedShopItems = [];
        this.upgradeLevels = { ...DEFAULT_UPGRADES, ...readSavedValue('spaceGameUpgrades', {}) };
        this.ownedCruisers = this.getOwnedCruisers();
        this.shopContainer = null;

        this.add.rectangle(660, 36, 250, 38, 0x071329, 0.7).setStrokeStyle(1, 0x5D9EC6, 0.65).setDepth(4);
        this.add.rectangle(130, 36, 220, 38, 0x071329, 0.7).setStrokeStyle(1, 0x5D9EC6, 0.65).setDepth(4);
        this.add.text(780, 20, 'High Score: ' + this.highScore, {
            fontSize: '22px', fill: '#FFFFFF', stroke: '#09213A', strokeThickness: 4
        }).setOrigin(1, 0).setDepth(5);
        this.creditsText = this.add.text(20, 20, 'Credits: ' + this.credits, {
            fontSize: '22px', fill: '#FFE66D', stroke: '#09213A', strokeThickness: 4
        }).setDepth(5);

        const menuPanel = this.add.graphics().setDepth(0);
        menuPanel.fillStyle(0x061329, 0.42);
        menuPanel.fillRoundedRect(250, 170, 300, 390, 22);
        menuPanel.lineStyle(2, 0x55CFFF, 0.45);
        menuPanel.strokeRoundedRect(250, 170, 300, 390, 22);
        styleSpaceTitle(this.add.text(400, 180, 'HANGAR', {
            fontSize: '14px'
        }).setOrigin(0.5), 14, '#68E68C');
        styleSpaceTitle(this.add.text(400, 476, 'SUPPLIES', {
            fontSize: '16px'
        }).setOrigin(0.5), 16, '#B773FF');

        const shipStoreButton = this.add.rectangle(400, 230, 230, 58, 0x275035, 0.95)
            .setStrokeStyle(3, 0x68E68C).setInteractive({ useHandCursor: true });
        shipStoreButton.on('pointerdown', () => this.showCruiserShop());
        styleSpaceTitle(this.add.text(400, 230, 'CRUISER SHOP', {
            fontSize: '22px'
        }).setOrigin(0.5), 22, '#68E68C').setInteractive().on('pointerdown', () => this.showCruiserShop());
        this.bindMenuHover(shipStoreButton, '#68E68C');

        const upgradeButton = this.add.rectangle(400, 298, 230, 58, 0x3B2366, 0.95)
            .setStrokeStyle(3, 0xC58AFF).setInteractive({ useHandCursor: true });
        upgradeButton.on('pointerdown', () => this.showUpgrades());
        styleSpaceTitle(this.add.text(400, 298, 'UPGRADES', {
            fontSize: '22px'
        }).setOrigin(0.5), 22, '#B773FF').setInteractive().on('pointerdown', () => this.showUpgrades());
        this.bindMenuHover(upgradeButton, '#C58AFF');

        const startButton = this.add.image(400, 370, 'button').setScale(1.35).setInteractive({ useHandCursor: true });
        startButton.on('pointerdown', () => this.startGame());
        this.tweens.add({ targets: startButton, scale: { from: 1.33, to: 1.4 }, duration: 950, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
        startButton.on('pointerover', () => startButton.setTint(0xB7F5FF));
        startButton.on('pointerout', () => startButton.clearTint());

        const tutorialButton = this.add.rectangle(400, 435, 230, 46, 0x114C70, 0.99)
            .setStrokeStyle(3, 0x71DFFF).setInteractive({ useHandCursor: true });
        tutorialButton.on('pointerdown', () => this.startGame(true));
        this.add.text(400, 435, 'HOW TO PLAY  ·  TUTORIAL', {
            fontSize: '16px', fill: '#FFFFFF', fontStyle: 'bold',
            stroke: '#08233B', strokeThickness: 3
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.startGame(true));

        const shopButton = this.add.rectangle(400, 516, 230, 58, 0x0B3555, 0.95)
            .setStrokeStyle(3, 0x42D9FF).setInteractive({ useHandCursor: true });
        shopButton.on('pointerdown', () => this.showShop());
        styleSpaceTitle(this.add.text(400, 516, 'POWER-UP SHOP', {
            fontSize: '22px'
        }).setOrigin(0.5), 22).setInteractive().on('pointerdown', () => this.showShop());
        this.bindMenuHover(shopButton, '#42D9FF');
        this.add.text(400, 570, '←  → MOVE   SPACE FIRE   C SPECIAL   X SHIPS   Z PAUSE', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            fill: '#EAF8FF',
            stroke: '#061329',
            strokeThickness: 4,
            letterSpacing: 1
        }).setOrigin(0.5).setAlpha(0.92);
    }

    createSpaceAmbience() {
        for (let index = 0; index < 72; index++) {
            const radius = Phaser.Math.FloatBetween(0.7, 2.2);
            const star = this.add.circle(
                Phaser.Math.Between(12, 788),
                Phaser.Math.Between(35, 585),
                radius,
                index % 5 === 0 ? 0x9BCBFF : 0xFFFFFF,
                Phaser.Math.FloatBetween(0.25, 0.8)
            ).setDepth(0);
            this.tweens.add({
                targets: star,
                alpha: { from: star.alpha, to: Phaser.Math.FloatBetween(0.08, 0.35) },
                duration: Phaser.Math.Between(800, 2400),
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 1500)
            });
        }

        this.time.addEvent({
            delay: 2600,
            loop: true,
            callback: () => {
                const shootingStar = this.add.container(Phaser.Math.Between(300, 850), Phaser.Math.Between(-20, 230));
                shootingStar.setDepth(3).setRotation(2.35);
                shootingStar.add(this.add.line(0, 0, 0, 0, 58, 0, 0x64E9FF, 0.85));
                shootingStar.add(this.add.circle(58, 0, 2, 0xFFFFFF, 1));
                this.tweens.add({
                    targets: shootingStar,
                    x: shootingStar.x - Phaser.Math.Between(230, 390),
                    y: shootingStar.y + Phaser.Math.Between(230, 390),
                    alpha: 0,
                    duration: Phaser.Math.Between(650, 1000),
                    ease: 'Cubic.In',
                    onComplete: () => shootingStar.destroy()
                });
            }
        });
    }

    bindMenuHover(button, accentColor) {
        const baseColor = button.fillColor;
        const accent = Phaser.Display.Color.HexStringToColor(accentColor).color;
        button.on('pointerover', () => {
            button.setFillStyle(accent, 0.48);
            button.setStrokeStyle(4, accent);
        });
        button.on('pointerout', () => {
            button.setFillStyle(baseColor, 0.95);
            button.setStrokeStyle(3, accent);
        });
        this.tweens.add({ targets: button, alpha: { from: 0.91, to: 1 }, duration: 1100, yoyo: true, repeat: -1 });
    }

    getOwnedCruisers() {
        const stored = readSavedValue('spaceGameOwnedCruisers', ['player']);
        const owned = Array.isArray(stored) ? stored.filter(key =>
            key === 'player' || CRUISER_SHOP_ITEMS.some(item => item.key === key)
        ) : ['player'];
        if (!owned.includes('player')) owned.unshift('player');
        saveValue('spaceGameOwnedCruisers', owned);
        return owned;
    }

    startGame(tutorial = false) {
        const owned = this.getOwnedCruisers();
        const selectedCruiser = readSavedValue('selectedCruiser', 'player');
        const permittedSelection = tutorial ? 'player' : owned.includes(selectedCruiser) ? selectedCruiser : 'player';
        this.game.registry.set('unlockedCruisers', owned);
        this.game.registry.set('selectedCruiser', permittedSelection);
        this.game.registry.set('secondCruiserUnlocked', false);
        this.game.registry.set('tutorialMode', tutorial);
        this.scene.start('MainGameScene');
    }

    showCruiserShop() {
        if (this.shopContainer) return;
        this.ownedCruisers = this.getOwnedCruisers();
        const store = this.add.container(0, 0).setDepth(1000);
        store.add(this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8).setInteractive());
        store.add(this.add.rectangle(400, 300, 560, 460, 0x071426, 0.99).setStrokeStyle(3, 0x68E68C));
        styleSpaceTitle(this.add.text(400, 90, 'CRUISER SHOP', {
            fontSize: '30px'
        }).setOrigin(0.5), 30, '#68E68C');
        store.add(this.add.text(400, 124, 'Each new cruiser costs ' + CRUISER_COST + ' credits', {
            fontSize: '17px', fill: '#FFE66D'
        }).setOrigin(0.5));

        const displayItems = [
            { key: 'player', name: 'Cruiser 7', owned: true },
            ...CRUISER_SHOP_ITEMS
        ];
        displayItems.forEach((item, index) => {
            const rowY = 170 + index * 55;
            const isOwned = this.ownedCruisers.includes(item.key);
            const row = this.add.rectangle(400, rowY, 500, 54, 0x12304A, 0.98)
                .setStrokeStyle(1, 0x2A7294);
            store.add(row);
            store.add(this.add.image(190, rowY, 'store_' + item.key).setDisplaySize(42, 42).setFlipY(true));
            store.add(this.add.text(230, rowY, item.name, {
                fontSize: '19px', fill: '#FFFFFF', fontStyle: 'bold'
            }).setOrigin(0, 0.5));
            const actionText = isOwned ? 'OWNED' : 'BUY ' + CRUISER_COST;
            const action = this.add.text(575, rowY, actionText, {
                fontSize: '16px', fill: isOwned ? '#68E68C' : '#FFE66D', fontStyle: 'bold'
            }).setOrigin(0.5);
            if (!isOwned) {
                row.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.buyCruiser(item));
                action.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.buyCruiser(item));
            }
            store.add(action);
        });

        this.cruiserShopStatus = this.add.text(400, 445, 'Credits: ' + this.credits, {
            fontSize: '18px', fill: '#FFE66D'
        }).setOrigin(0.5);
        store.add(this.cruiserShopStatus);
        const close = this.add.text(400, 485, 'CLOSE', {
            fontSize: '17px', fill: '#FFFFFF', backgroundColor: '#14527A', padding: { x: 16, y: 7 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        close.on('pointerdown', () => this.hideShop());
        store.add(close);
        this.shopContainer = store;
    }

    buyCruiser(item) {
        this.ownedCruisers = this.getOwnedCruisers();
        if (this.ownedCruisers.includes(item.key)) return;
        if (this.credits < CRUISER_COST) {
            this.cruiserShopStatus.setText('Not enough credits!  Balance: ' + this.credits);
            return;
        }

        this.credits -= CRUISER_COST;
        this.ownedCruisers.push(item.key);
        saveValue('spaceGameCredits', this.credits);
        saveValue('spaceGameOwnedCruisers', this.ownedCruisers);
        this.creditsText.setText('Credits: ' + this.credits);
        this.hideShop();
        this.showCruiserShop();
        this.cruiserShopStatus.setText(item.name + ' purchased! Credits: ' + this.credits);
    }

    showShop() {
        if (this.shopContainer) return;
        const shop = this.add.container(0, 0).setDepth(1000);
        const backdrop = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.78).setInteractive();
        shop.add(backdrop);
        const panel = this.add.rectangle(400, 300, 570, 485, 0x071426, 0.99).setStrokeStyle(3, 0x42D9FF);
        shop.add(panel);
        styleSpaceTitle(this.add.text(400, 78, 'POWER-UP SHOP', {
            fontSize: '30px'
        }).setOrigin(0.5), 30);
        shop.add(this.add.text(400, 111, 'Each power-up costs ' + SHOP_COST + ' credits', {
            fontSize: '17px', fill: '#FFE66D'
        }).setOrigin(0.5));

        SHOP_ITEMS.forEach((item, index) => {
            const rowY = 158 + index * 52;
            const row = this.add.rectangle(400, rowY, 510, 53, 0x12304A, 0.98)
                .setStrokeStyle(1, 0x2A7294).setInteractive({ useHandCursor: true });
            row.on('pointerdown', () => this.buyShopItem(item));
            shop.add(row);
            shop.add(this.add.image(175, rowY, item.icon).setDisplaySize(38, 38));
            shop.add(this.add.text(207, rowY - 10, item.name, {
                fontSize: '18px', fill: '#FFFFFF', fontStyle: 'bold'
            }).setOrigin(0, 0.5));
            shop.add(this.add.text(207, rowY + 12, item.description, {
                fontSize: '13px', fill: '#BBDDEE'
            }).setOrigin(0, 0.5));
            shop.add(this.add.text(585, rowY, 'BUY', {
                fontSize: '17px', fill: '#55FFAA', fontStyle: 'bold'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.buyShopItem(item)));
        });

        this.shopBalanceText = this.add.text(400, 480, 'Credits: ' + this.credits, {
            fontSize: '19px', fill: '#FFE66D'
        }).setOrigin(0.5);
        shop.add(this.shopBalanceText);
        const close = this.add.text(400, 520, 'CLOSE', {
            fontSize: '17px', fill: '#FFFFFF', backgroundColor: '#14527A', padding: { x: 16, y: 7 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        close.on('pointerdown', () => this.hideShop());
        shop.add(close);
        this.shopContainer = shop;
    }

    buyShopItem(item) {
        if (this.credits < SHOP_COST) {
            if (this.shopBalanceText) this.shopBalanceText.setText('Not enough credits!  Balance: ' + this.credits);
            return;
        }

        this.credits -= SHOP_COST;
        this.purchasedShopItems.push(item.id);
        saveValue('spaceGameCredits', this.credits);
        saveValue('spaceGameShopPurchases', this.purchasedShopItems);
        this.creditsText.setText('Credits: ' + this.credits);
        if (this.shopBalanceText) this.shopBalanceText.setText(item.name + ' purchased! Credits: ' + this.credits);
    }

    hideShop() {
        if (!this.shopContainer) return;
        this.shopContainer.destroy(true);
        this.shopContainer = null;
    }

    showUpgrades() {
        if (this.shopContainer) return;
        const upgrades = this.add.container(0, 0).setDepth(1000);
        upgrades.add(this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8).setInteractive());
        upgrades.add(this.add.rectangle(400, 300, 650, 575, 0x071426, 0.99).setStrokeStyle(3, 0xC58AFF));
        styleSpaceTitle(this.add.text(400, 38, 'SHIP & POWER-UP UPGRADES', {
            fontSize: '26px'
        }).setOrigin(0.5), 26, '#B773FF');
        upgrades.add(this.add.text(400, 68, 'Credits: ' + this.credits + '  •  Each upgrade has 3 levels', {
            fontSize: '16px', fill: '#FFE66D'
        }).setOrigin(0.5));

        UPGRADE_ITEMS.forEach((item, index) => {
            const rowY = 105 + index * 42;
            const level = Number(this.upgradeLevels[item.id]) || 0;
            const atMaxLevel = level >= MAX_UPGRADE_LEVEL;
            const nextCost = item.cost * (level + 1);
            const row = this.add.rectangle(400, rowY, 605, 38, 0x231A3B, 0.98)
                .setStrokeStyle(1, 0x8753B5).setInteractive({ useHandCursor: true });
            if (!atMaxLevel) row.on('pointerdown', () => this.buyUpgrade(item));
            upgrades.add(row);
            upgrades.add(this.add.text(112, rowY - 7, item.name + '  (Lv ' + level + '/' + MAX_UPGRADE_LEVEL + ')', {
                fontSize: '15px', fill: '#FFFFFF', fontStyle: 'bold'
            }).setOrigin(0, 0.5));
            upgrades.add(this.add.text(112, rowY + 10, item.description, {
                fontSize: '11px', fill: '#D4C4EE'
            }).setOrigin(0, 0.5));
            const action = this.add.text(635, rowY, atMaxLevel ? 'MAX' : 'BUY ' + nextCost, {
                fontSize: '14px', fill: atMaxLevel ? '#AAAAAA' : '#55FFAA', fontStyle: 'bold'
            }).setOrigin(0.5);
            if (!atMaxLevel) action.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.buyUpgrade(item));
            upgrades.add(action);
        });

        this.upgradeStatusText = this.add.text(400, 535, this.upgradeMessage || '', {
            fontSize: '14px', fill: '#FFE66D'
        }).setOrigin(0.5);
        upgrades.add(this.upgradeStatusText);
        const close = this.add.text(400, 565, 'CLOSE', {
            fontSize: '17px', fill: '#FFFFFF', backgroundColor: '#49306A', padding: { x: 16, y: 7 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        close.on('pointerdown', () => this.hideShop());
        upgrades.add(close);
        this.shopContainer = upgrades;
    }

    buyUpgrade(item) {
        const currentLevel = Number(this.upgradeLevels[item.id]) || 0;
        if (currentLevel >= MAX_UPGRADE_LEVEL) {
            this.upgradeMessage = item.name + ' is fully upgraded';
            this.hideShop();
            this.showUpgrades();
            return;
        }
        const cost = item.cost * (currentLevel + 1);
        if (this.credits < cost) {
            this.upgradeStatusText.setText('Not enough credits!');
            return;
        }

        this.credits -= cost;
        this.upgradeLevels[item.id] = currentLevel + 1;
        saveValue('spaceGameCredits', this.credits);
        saveValue('spaceGameUpgrades', this.upgradeLevels);
        this.creditsText.setText('Credits: ' + this.credits);
        this.upgradeMessage = item.name + ' upgraded! New level: ' + this.upgradeLevels[item.id];
        this.hideShop();
        this.showUpgrades();
    }
}

// Main Game Scene
class MainGameScene extends Phaser.Scene {
    constructor() { super('MainGameScene'); }
    preload() {
        this.load.image('main_bg', './assets/space_intruder/sprites/space_world_background.png');
        this.load.image('player', './assets/space_intruder/sprites/space_cruiser_7.png');
        this.load.image('second_boss', './assets/space_intruder/sprites/space_cruiser_9.png');
        this.load.image('third_boss', './assets/space_intruder/sprites/mothership.png');
        this.load.image('fourth_boss', './assets/space_intruder/sprites/planet_ringed.png');
        this.load.spritesheet('fifth_boss', './assets/space_intruder/sprites/spike_ball/spike_ball.png', { frameWidth: 32, frameHeight: 32 });
        this.load.image('ship_cruiser_3', './assets/space_intruder/ui/space_cruiser_3.png');
        this.load.image('ship_cruiser_4', './assets/space_intruder/ui/space_cruiser_4.png');
        this.load.image('ship_cruiser_8', './assets/space_intruder/ui/space_cruiser_8.png');
        this.load.image('ship_cruiser_9', './assets/space_intruder/ui/space_cruiser_9.png');
        this.load.image('bullet', './assets/space_intruder/sprites/space_rocket_4.png');
        this.load.image('asteroid', './assets/space_intruder/sprites/asteroid_big.png');
        this.load.image('heart_ui', './assets/space_intruder/ui/hearts_1.png');
        this.load.image('powerup_red', './assets/space_intruder/ui/power_up_6.png');
        this.load.image('powerup_green', './assets/space_intruder/ui/power_up_1.png');
        this.load.image('powerup_purple', './assets/space_intruder/ui/power_up_4.png');
        this.load.image('powerup_blue', './assets/space_intruder/ui/power_up_3.png');
        this.load.image('powerup_yellow', './assets/space_intruder/ui/power_up_5.png');
        this.load.image('powerup_white', './assets/space_intruder/ui/power_up_12.png');
        this.load.image('powerup_pink', './assets/space_intruder/ui/hearts_4.png');
        this.load.image('powerup_rapid_fire', './assets/space_intruder/sprites/space_rocket_4.png');
        this.load.image('powerup_triple', './assets/space_intruder/ui/power_up_19.png');
        this.load.spritesheet('explosion', './assets/space_intruder/sprites/big_explosion.png', { frameWidth: 128, frameHeight: 128 });
        this.load.audio('explosion_crunch_0', './assets/space_intruder/sounds/explosion.mp3');
        this.load.audio('shield_sound', './assets/space_intruder/sounds/force_field_2.mp3');
        this.load.audio('shield_hit_sound', './assets/space_intruder/sounds/shield_hit.mp3');
        this.load.audio('engine_sound', './assets/space_intruder/sounds/engine_circular_1.mp3');
        this.load.audio('laser_sound', './assets/space_intruder/sounds/laser_1.mp3');
    }
    create() {
        fitPlayfieldCamera(this);
        addFullScreenBackground(this, 'main_bg');

        const paidCruisers = this.game.registry.get('unlockedCruisers') || ['player'];
        this.unlockedCruisers = paidCruisers.filter(key =>
            key === 'player' || CRUISER_SHOP_ITEMS.some(item => item.key === key)
        );
        if (!this.unlockedCruisers.includes('player')) this.unlockedCruisers.unshift('player');
        this.runOnlyCruisers = [];
        this.game.registry.set('unlockedCruisers', this.unlockedCruisers);
        this.isTutorial = this.game.registry.get('tutorialMode') === true;
        this.game.registry.set('tutorialMode', false);
        const savedShip = this.game.registry.get('selectedCruiser');
        this.currentShip = this.unlockedCruisers.includes(savedShip) ? savedShip : 'player';
        this.upgradeLevels = { ...DEFAULT_UPGRADES, ...readSavedValue('spaceGameUpgrades', {}) };
        this.player = this.physics.add.sprite(400, 550, this.currentShip).setScale(0.4).setFlipY(true);
        this.player.setCollideWorldBounds(true);
        this.player.setImmovable(true); // Asteroid hits can't push the ship up/down or sideways
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shipSwitchKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.specialAbilityKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        this.shipMenuEscapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.shipMenuKeys = [
            Phaser.Input.Keyboard.KeyCodes.ONE,
            Phaser.Input.Keyboard.KeyCodes.TWO,
            Phaser.Input.Keyboard.KeyCodes.THREE,
            Phaser.Input.Keyboard.KeyCodes.FOUR,
            Phaser.Input.Keyboard.KeyCodes.FIVE
        ].map(keyCode => this.input.keyboard.addKey(keyCode));
        this.shipMenuContainer = null;
        this.shipNotice = null;
        
        this.score = 0;
        this.tutorialTargetsSpawned = 0;
        this.tutorialTargetsCleared = 0;
        this.tutorialComplete = false;
        this.tutorialPracticeStarted = false;
        this.tutorialGuideStep = 0;
        this.tutorialGuideContainer = null;
        this.nextBossScore = 100;
        this.destroyedCount = 0;
        this.hasCruiser4LifeBonus = this.currentShip === 'ship_cruiser_4';
        this.maxLives = 3 + (this.hasCruiser4LifeBonus ? 1 : 0) + (Number(this.upgradeLevels.shieldLives) || 0);
        this.lives = this.maxLives;
        this.armorCharges = Math.max(0, Number(this.upgradeLevels.armor) || 0);
        this.level = 1;
        this.firstBossDefeated = false;
        this.scoreText = this.add.text(20, 20, this.isTutorial ? 'Targets: 0/10' : 'Score: 0', { fontSize: '20px', fill: '#FFF' });
        this.levelText = this.add.text(620, 20, this.isTutorial ? 'TUTORIAL' : 'Level 1', { fontSize: '20px', fill: '#FFF' });
        if (this.isTutorial) {
            this.add.rectangle(400, 190, 710, 54, 0x061329, 0.78).setStrokeStyle(2, 0x55CFFF, 0.8).setDepth(1190);
            this.tutorialInstructionText = this.add.text(400, 190, 'TUTORIAL  •  Follow the lessons, then practice on 10 asteroids', {
                fontSize: '19px', fill: '#EAF8FF', stroke: '#061329', strokeThickness: 3,
                align: 'center'
            }).setOrigin(0.5).setDepth(1191);
        }
        this.armorText = this.add.text(20, 115, 'Armor: ' + this.armorCharges, { fontSize: '18px', fill: '#77DDFF' });
        this.armorText.setDepth(1000);
        this.specialAbilityReadyAt = 0;
        this.specialSpeedUntil = 0;
        this.specialRapidFireUntil = 0;
        this.specialText = this.add.text(20, 140, '', { fontSize: '17px', fill: '#FFE66D' });
        this.specialText.setDepth(1000);
        this.updateSpecialText();
        this.controlsPanel = this.add.rectangle(681, 515, 228, 146, 0x061329, 0.78)
            .setStrokeStyle(2, 0x3DA8E8).setDepth(1200);
        this.controlsText = this.add.text(780, 579,
            'CONTROLS\n← / →  Move\nSPACE  Fire\nC  Special ability\nX  Cruiser menu\n1–5  Choose cruiser\nZ  Pause / Esc resume', {
                fontSize: '13px',
                fill: '#EAF8FF',
                stroke: '#061329',
                strokeThickness: 2,
                lineSpacing: 2,
                align: 'right'
            }).setOrigin(1, 1).setDepth(1201);
        this.hasTouchControls = this.sys.game.device.input.touch ||
            (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches);
        this.touchInput = { left: false, right: false, fire: false };
        this.touchFireLastShot = 0;
        if (this.hasTouchControls) {
            this.controlsPanel.setVisible(false);
            this.controlsText.setVisible(false);
            this.createTouchControls();
        }
        
        // Shield Bubble
        this.shieldBubble = null;
        
        // Play engine sound
        this.engineSound = this.sound.add('engine_sound', { loop: true });
        this.engineSound.play();
        
        // Initialize hearts
        this.heartImages = [];
        this.updateHearts();

        this.bullets = this.physics.add.group();
        this.powerups = this.physics.add.group();
        this.shipPickups = this.physics.add.group();
        
        this.bulletCount = Math.min(3, 1 + (Number(this.upgradeLevels.bulletUpgrade) || 0));
        this.hasShield = false;
        this.speedBoost = 0;
        this.slowAsteroids = false;
        this.scoreMultiplier = 1;
        this.rapidFire = false;
        this.rapidFireSpeedBonus = 0;
        this.lastFireTime = 0;
        this.lastPowerUpType = 0;
        
        this.asteroids = this.physics.add.group();
        this.bossAsteroid = null;
        this.bossSpawned = false;
        this.bossesSpawned = 0;
        this.bossHealthText = null;
        this.asteroidSpawner = this.time.addEvent({
            delay: this.isTutorial ? 1200 : 800,
            callback: () => {
                if (this.isTutorial) {
                    if (!this.tutorialPracticeStarted) return;
                    if (this.tutorialTargetsSpawned >= 10) return;
                    const tutorialAsteroid = this.asteroids.create(Phaser.Math.Between(55, 745), -45, 'asteroid');
                    tutorialAsteroid.setVelocityY(135);
                    tutorialAsteroid.setScale(0.65);
                    tutorialAsteroid.setData('isTutorialTarget', true);
                    this.tutorialTargetsSpawned++;
                    return;
                }
                if (this.bossSpawned) return;
                const asteroidX = Phaser.Math.Between(30, 770);
                const asteroid = this.asteroids.create(asteroidX, -50, 'asteroid');
                const speed = this.slowAsteroids ? 100 : (this.level >= 2 ? 420 : 250);
                asteroid.setVelocityY(speed);
                asteroid.setScale(0.7);
            },
            loop: true
        });

        this.anims.create({ key: 'explode', frames: this.anims.generateFrameNumbers('explosion'), frameRate: 15, repeat: 0 });
        this.anims.create({ key: 'fifth_boss_spin', frames: this.anims.generateFrameNumbers('fifth_boss'), frameRate: 6, repeat: -1 });

        this.physics.add.collider(this.player, this.asteroids, (player, asteroid) => {
            if (this.isTutorial) {
                asteroid.setPosition(Phaser.Math.Between(55, 745), -45);
                asteroid.setVelocityY(135);
                return;
            }
            if (asteroid.getData('isBoss')) {
                const absorbedByArmor = this.armorCharges > 0;
                if (absorbedByArmor) {
                    this.armorCharges--;
                    this.updateArmorText();
                }
                this.hasShield = false;
                player.clearTint();
                if (this.shieldBubble) {
                    this.shieldBubble.destroy();
                    this.shieldBubble = null;
                }
                this.defeatBoss(asteroid);
                if (!absorbedByArmor) {
                    this.lives = Math.max(0, this.lives - 2);
                    this.updateHearts();
                    if (this.lives <= 0) {
                        this.finishRun();
                    }
                }
                return;
            }

            if (this.hasShield) {
                this.hasShield = false;
                this.sound.play('shield_hit_sound', { volume: 1.4 });
                player.clearTint();
                
                // Destroy shield bubble
                if (this.shieldBubble) {
                    this.shieldBubble.destroy();
                    this.shieldBubble = null;
                }
                
                asteroid.destroy();
                return;
            }
            if (this.armorCharges > 0) {
                this.armorCharges--;
                this.updateArmorText();
                asteroid.destroy();
                this.sound.play('shield_hit_sound', { volume: 1.1 });
                return;
            }
            this.sound.play('explosion_crunch_0', { volume: 2.2 });
            const impactExplosion = this.add.sprite(asteroid.x, asteroid.y, 'explosion');
            impactExplosion.setScale(2.5);
            impactExplosion.play('explode');
            impactExplosion.on('animationcomplete', () => { impactExplosion.destroy(); });

            this.lives -= 1;
            this.updateHearts();
            asteroid.destroy();
            if (this.lives <= 0) {
                this.finishRun();
            }
        });

        this.physics.add.collider(this.bullets, this.asteroids, (bullet, asteroid) => {
            if (asteroid.getData('isBoss')) {
                const hitExplosion = this.add.sprite(bullet.x, bullet.y, 'explosion');
                hitExplosion.setScale(1.5);
                hitExplosion.play('explode');
                hitExplosion.on('animationcomplete', () => { hitExplosion.destroy(); });
                bullet.destroy();
                asteroid.setVelocityY(35);
                this.damageBoss(asteroid, 1);
                return;
            }

            bullet.destroy();
            asteroid.destroy();
            
            this.sound.play('explosion_crunch_0', { volume: 1.8 });
            const explosion = this.add.sprite(asteroid.x, asteroid.y, 'explosion');
            explosion.play('explode');
            explosion.on('animationcomplete', () => { explosion.destroy(); });

            if (this.isTutorial) {
                this.sound.play('explosion_crunch_0', { volume: 1.2 });
                this.onTutorialTargetCleared();
                return;
            }
            
            this.addScore(1 * this.scoreMultiplier);
            this.checkBossSpawn();
            
            this.destroyedCount++;
            if (this.destroyedCount % 10 === 0) {
                this.spawnPowerUp();
            }
        });

        // Periodic powerup spawner (every 10 seconds)
        this.time.addEvent({
            delay: 10000,
            callback: () => {
                if (!this.isTutorial) this.spawnPowerUp();
            },
            loop: true
        });
        this.physics.add.overlap(this.player, this.powerups, (player, powerup) => {
            const type = powerup.getData('type');
            powerup.destroy();

            if (type === 1) this.bulletCount = Math.min(3, this.bulletCount + 2);
            if (type === 2) {
                this.hasShield = true;
                this.sound.play('shield_sound');
                const shieldColor = 0x00aaff;
                player.setTint(shieldColor);
                // Add shield bubble
                if (this.shieldBubble) this.shieldBubble.destroy();
                this.shieldBubble = this.add.circle(player.x, player.y, 40, shieldColor, 0.3);
                this.shieldBubble.setStrokeStyle(4, shieldColor);

                this.time.delayedCall(this.getPowerupDuration('shieldDuration'), () => {
                    this.hasShield = false;
                    player.clearTint();
                    if (this.shieldBubble) {
                        this.shieldBubble.destroy();
                        this.shieldBubble = null;
                    }
                });
            }
            if (type === 3) {
                this.speedBoost = 10;
                this.time.delayedCall(this.getPowerupDuration('speedDuration'), () => {
                    this.speedBoost = 0;
                });
            }
            if (type === 4) {
                this.slowAsteroids = true;
                this.time.delayedCall(this.getPowerupDuration('slowDuration'), () => {
                    this.slowAsteroids = false;
                });
            }
            if (type === 5) { // Double Score (Purple)
                this.scoreMultiplier = 2;
                this.time.delayedCall(this.getPowerupDuration('scoreDuration'), () => {
                    this.scoreMultiplier = 1;
                });
            }
            if (type === 6) { // Nuke (White)
                const asteroids = this.asteroids.getChildren().slice();
                const boss = asteroids.find(asteroid => asteroid.getData('isBoss'));
                const regularAsteroids = asteroids.filter(asteroid => !asteroid.getData('isBoss'));
                const asteroidCount = regularAsteroids.length;
                regularAsteroids.forEach(asteroid => asteroid.destroy());

                if (asteroidCount > 0) {
                    this.addScore(asteroidCount * this.scoreMultiplier);
                    this.destroyedCount += asteroidCount;
                    this.checkBossSpawn();
                }
                if (boss && boss.active) {
                    const nukeDamage = 20 + (Number(this.upgradeLevels.nukePower) || 0) * 10;
                    this.damageBoss(boss, nukeDamage);
                }

                this.sound.play('explosion_crunch_0', { volume: 3.0 });

                const nukeExplosion = this.add.sprite(400, 300, 'explosion');
                nukeExplosion.setScale(8);
                nukeExplosion.play('explode');
                nukeExplosion.on('animationcomplete', () => {
                    nukeExplosion.destroy();
                });
            }
            if (type === 7) { // Heal (Pink)
                const healAmount = 1 + (Number(this.upgradeLevels.healPower) || 0);
                if (this.lives < this.maxLives) {
                    this.lives = Math.min(this.maxLives, this.lives + healAmount);
                    this.updateHearts();
                }
            }
            if (type === 9) { // Triple (Power-up 19): two random helper ships on each side of the player
                this.spawnTripleHelpers();
            }
            if (type === 8) { // Rapid Fire
                this.rapidFire = true;
                this.rapidFireSpeedBonus = 30;
                this.speedBoost += 10;
                this.time.delayedCall(this.getPowerupDuration('rapidFireDuration'), () => {
                    this.rapidFire = false;
                    this.rapidFireSpeedBonus = 0;
                    this.speedBoost = Math.max(0, this.speedBoost - 10);
                });
            }
        });
        this.physics.add.overlap(this.player, this.shipPickups, (player, pickup) => {
            const shipKey = pickup.getData('shipKey');
            pickup.destroy();
            if (!this.getAvailableCruisers().includes(shipKey)) {
                this.runOnlyCruisers.push(shipKey);
            }
            const cruiserName = shipKey.replace('ship_cruiser_', 'Cruiser ');
            this.showShipMessage(cruiserName + ' temporary! Press X to select; lost after this run');
        });
        if (!this.isTutorial) this.applyShopPurchases();
        else this.showTutorialGuide();
    }
    spawnPowerUp() {
        const x = Phaser.Math.Between(100, 700);
        const type = Phaser.Math.Between(1, 9);
        let texture = 'powerup_red';
        switch(type) {
            case 9: texture = 'powerup_triple'; break; // Triple (grants two random cruisers)
            case 1: texture = 'powerup_red'; break;    // Bullet
            case 2: texture = 'powerup_green'; break;  // Shield
            case 3: texture = 'powerup_blue'; break;   // Speed
            case 4: texture = 'powerup_yellow'; break; // Slow
            case 5: texture = 'powerup_purple'; break; // Score
            case 6: texture = 'powerup_white'; break;  // Nuke
            case 8: texture = 'powerup_rapid_fire'; break; // Rapid Fire
            case 7: texture = 'powerup_pink'; break;   // Heal
        }
        const powerup = this.powerups.create(x, -50, texture);
        powerup.setData('type', type);
        powerup.setVelocityY(150);
        powerup.checkWorldBounds = true;
        powerup.outOfBoundsKill = true;
    }


    addScore(points) {
        this.score += points;
        this.scoreText.setText('Score: ' + this.score);
        const highScore = readSavedValue('spaceGameHighScore', 0);
        if (this.score > highScore) saveValue('spaceGameHighScore', this.score);
    }

    getPowerupDuration(upgradeId) {
        const upgradeLevel = Math.max(0, Number(this.upgradeLevels[upgradeId]) || 0);
        return 10000 + upgradeLevel * 5000;
    }

    updateArmorText() {
        if (this.armorText) this.armorText.setText('Armor: ' + this.armorCharges);
    }

    showTutorialGuide() {
        if (this.tutorialGuideContainer) {
            this.tutorialGuideContainer.removeAll(true);
            this.tutorialGuideContainer.destroy();
        }
        const lesson = TUTORIAL_LESSONS[this.tutorialGuideStep];
        const guide = this.add.container(0, 0).setDepth(2500);
        guide.add(this.add.rectangle(400, 300, 800, 600, 0x020816, 0.82).setInteractive());
        guide.add(this.add.rectangle(400, 300, 660, 500, 0x0A1D3B, 0.99).setStrokeStyle(3, 0x55DFFF));
        styleSpaceTitle(this.add.text(400, 88, 'FLIGHT SCHOOL', { fontSize: '30px' }).setOrigin(0.5), 30);
        guide.add(this.add.text(400, 124, 'LESSON ' + (this.tutorialGuideStep + 1) + ' OF ' + TUTORIAL_LESSONS.length, {
            fontSize: '15px', fill: '#8FDFFF', fontStyle: 'bold', letterSpacing: 2
        }).setOrigin(0.5));
        guide.add(styleSpaceTitle(this.add.text(400, 190, lesson.title, { fontSize: '25px' }).setOrigin(0.5), 25, '#B773FF'));
        guide.add(this.add.text(400, 295, lesson.text, {
            fontSize: '19px',
            fill: '#E8F2FF',
            align: 'center',
            lineSpacing: 10,
            wordWrap: { width: 540, useAdvancedWrap: true }
        }).setOrigin(0.5));

        if (this.tutorialGuideStep > 0) {
            const backButton = this.add.rectangle(265, 475, 160, 52, 0x203657, 0.98)
                .setStrokeStyle(2, 0x7CAED8).setInteractive({ useHandCursor: true });
            backButton.on('pointerdown', () => {
                this.tutorialGuideStep--;
                this.showTutorialGuide();
            });
            guide.add(backButton);
            guide.add(this.add.text(265, 475, '← BACK', {
                fontSize: '18px', fill: '#FFFFFF', fontStyle: 'bold'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
                this.tutorialGuideStep--;
                this.showTutorialGuide();
            }));
        }

        const lastLesson = this.tutorialGuideStep === TUTORIAL_LESSONS.length - 1;
        const nextLabel = lastLesson ? 'BEGIN 10-TARGET PRACTICE' : 'NEXT LESSON  →';
        const nextWidth = lastLesson ? 280 : 190;
        const nextX = this.tutorialGuideStep > 0 ? 535 : 400;
        const nextButton = this.add.rectangle(nextX, 475, nextWidth, 52, 0x14527A, 0.98)
            .setStrokeStyle(2, 0x71DFFF).setInteractive({ useHandCursor: true });
        nextButton.on('pointerdown', () => this.advanceTutorialLesson());
        guide.add(nextButton);
        guide.add(this.add.text(nextX, 475, nextLabel, {
            fontSize: lastLesson ? '15px' : '18px', fill: '#FFFFFF', fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.advanceTutorialLesson()));

        this.tutorialGuideContainer = guide;
    }

    advanceTutorialLesson() {
        if (this.tutorialGuideStep >= TUTORIAL_LESSONS.length - 1) {
            this.beginTutorialPractice();
            return;
        }
        this.tutorialGuideStep++;
        this.showTutorialGuide();
    }

    beginTutorialPractice() {
        this.tutorialPracticeStarted = true;
        if (this.tutorialGuideContainer) {
            this.tutorialGuideContainer.removeAll(true);
            this.tutorialGuideContainer.destroy();
            this.tutorialGuideContainer = null;
        }
        if (this.tutorialInstructionText) {
            this.tutorialInstructionText.setText('PRACTICE  •  Use move and fire controls to clear all 10 asteroids');
        }
    }

    onTutorialTargetCleared() {
        if (!this.isTutorial || this.tutorialComplete) return;
        this.tutorialTargetsCleared = Math.min(10, this.tutorialTargetsCleared + 1);
        this.scoreText.setText('Targets: ' + this.tutorialTargetsCleared + '/10');
        if (this.tutorialTargetsCleared >= 10) this.finishTutorial();
    }

    finishTutorial() {
        if (this.tutorialComplete) return;
        this.tutorialComplete = true;
        if (this.asteroidSpawner) this.asteroidSpawner.remove(false);
        this.asteroids.clear(true, true);
        if (this.engineSound) this.engineSound.stop();

        const overlay = this.add.container(0, 0).setDepth(2000);
        overlay.add(this.add.rectangle(400, 300, 800, 600, 0x020816, 0.78));
        overlay.add(this.add.rectangle(400, 300, 480, 230, 0x0A1D3B, 0.98).setStrokeStyle(3, 0x55DFFF));
        styleSpaceTitle(this.add.text(400, 245, 'TUTORIAL COMPLETE!', { fontSize: '30px' }).setOrigin(0.5), 30);
        overlay.add(this.add.text(400, 290, 'You cleared all 10 asteroids. Great flying!', {
            fontSize: '17px', fill: '#D7E9FF', align: 'center'
        }).setOrigin(0.5));
        const returnButton = this.add.rectangle(400, 350, 230, 48, 0x14527A, 0.98)
            .setStrokeStyle(2, 0x71DFFF).setInteractive({ useHandCursor: true });
        returnButton.on('pointerdown', () => this.scene.start('StartScene'));
        overlay.add(returnButton);
        overlay.add(this.add.text(400, 350, 'RETURN TO HANGAR', {
            fontSize: '17px', fill: '#FFFFFF', fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.start('StartScene')));
    }

    getSpecialAbility() {
        const abilities = {
            player: { name: 'Shield Pulse', description: '4s shield' },
            ship_cruiser_3: { name: 'Speed Burst', description: '4s speed boost' },
            ship_cruiser_4: { name: 'Repair', description: '+1 heart' },
            ship_cruiser_8: { name: 'Rapid Overdrive', description: '4s faster fire' },
            ship_cruiser_9: { name: 'Asteroid Salvo', description: 'Clear asteroids' }
        };
        return abilities[this.currentShip] || abilities.player;
    }

    updateSpecialText() {
        if (!this.specialText) return;
        const ability = this.getSpecialAbility();
        const remaining = Math.max(0, this.specialAbilityReadyAt - this.time.now);
        const cooldownLabel = remaining > 0 ? Math.ceil(remaining / 1000) + 's' : 'READY';
        this.specialText.setText('C: ' + ability.name + ' (' + ability.description + ') — ' + cooldownLabel);
        this.specialText.setColor(remaining > 0 ? '#BBBBBB' : '#FFE66D');
    }

    createTouchControls() {
        this.addTouchHoldButton(64, 508, '◀', 'left');
        this.addTouchHoldButton(151, 508, '▶', 'right');
        this.addTouchHoldButton(734, 508, 'FIRE', 'fire', 42, 15);
        this.addTouchActionButton(638, 508, 'C', () => this.activateSpecialAbility(), '#7B5CFF');
        this.addTouchActionButton(638, 418, 'SHIPS', () => this.showShipMenu(), '#20A8D5', 42, 12);
        this.addTouchActionButton(734, 418, 'Ⅱ', () => {
            this.scene.launch('PauseScene');
            this.scene.pause();
        }, '#D48A3C', 42, 20);
        this.add.text(106, 558, 'STEER', {
            fontSize: '11px', fill: '#EAF8FF', stroke: '#061329', strokeThickness: 3
        }).setOrigin(0.5).setDepth(1301);
    }

    addTouchHoldButton(x, y, label, action, radius = 37, fontSize = 25) {
        const button = this.add.circle(x, y, radius, 0x082044, 0.72)
            .setStrokeStyle(2, 0x71DFFF, 0.9)
            .setDepth(1300)
            .setInteractive({ useHandCursor: true });
        const labelText = this.add.text(x, y, label, {
            fontSize: fontSize + 'px',
            fill: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#061329',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(1301);

        const press = pointer => {
            if (pointer.event && pointer.event.cancelable) pointer.event.preventDefault();
            this.touchInput[action] = true;
            button.setFillStyle(0x176A91, 0.9);
            if (action === 'fire') this.touchFireLastShot = this.time.now - 220;
        };
        const release = () => {
            this.touchInput[action] = false;
            button.setFillStyle(0x082044, 0.72);
        };
        button.on('pointerdown', press);
        button.on('pointerup', release);
        button.on('pointerupoutside', release);
        button.on('pointerout', release);
        labelText.setInteractive().on('pointerdown', press).on('pointerup', release).on('pointerupoutside', release);
    }

    addTouchActionButton(x, y, label, callback, color, radius = 37, fontSize = 14) {
        const button = this.add.circle(x, y, radius, 0x082044, 0.76)
            .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(color).color, 0.95)
            .setDepth(1300)
            .setInteractive({ useHandCursor: true });
        const labelText = this.add.text(x, y, label, {
            fontSize: fontSize + 'px',
            fill: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#061329',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5).setDepth(1301).setInteractive();
        const press = pointer => {
            if (pointer.event && pointer.event.cancelable) pointer.event.preventDefault();
            button.setFillStyle(Phaser.Display.Color.HexStringToColor(color).color, 0.95);
            callback();
        };
        const release = () => button.setFillStyle(0x082044, 0.76);
        button.on('pointerdown', press).on('pointerup', release).on('pointerupoutside', release);
        labelText.on('pointerdown', press).on('pointerup', release).on('pointerupoutside', release);
    }

    activateSpecialAbility() {
        if (this.time.now < this.specialAbilityReadyAt) return;

        this.specialAbilityReadyAt = this.time.now + 15000;
        switch (this.currentShip) {
            case 'ship_cruiser_3':
                this.specialSpeedUntil = this.time.now + 4000;
                this.showShipMessage('SPEED BURST!');
                break;
            case 'ship_cruiser_4':
                if (this.lives < this.maxLives) {
                    this.lives = Math.min(this.maxLives, this.lives + 1);
                    this.updateHearts();
                    this.showShipMessage('SHIP REPAIRED! +1 HEART');
                } else {
                    this.specialAbilityReadyAt = 0;
                    this.showShipMessage('HEARTS ALREADY FULL');
                }
                break;
            case 'ship_cruiser_8':
                this.specialRapidFireUntil = this.time.now + 4000;
                this.showShipMessage('RAPID OVERDRIVE!');
                break;
            case 'ship_cruiser_9': {
                const targets = this.asteroids.getChildren().slice();
                const boss = targets.find(asteroid => asteroid.getData('isBoss'));
                const regularAsteroids = targets.filter(asteroid => !asteroid.getData('isBoss'));
                regularAsteroids.forEach(asteroid => asteroid.destroy());
                if (regularAsteroids.length > 0) {
                    this.addScore(regularAsteroids.length * this.scoreMultiplier);
                    this.destroyedCount += regularAsteroids.length;
                    this.checkBossSpawn();
                }
                if (boss && boss.active) {
                    const nukeDamage = 20 + 10 * (Number(this.upgradeLevels.nukePower) || 0);
                    this.damageBoss(boss, nukeDamage);
                }
                const blast = this.add.sprite(400, 300, 'explosion').setScale(8).setDepth(1100);
                blast.play('explode');
                blast.on('animationcomplete', () => blast.destroy());
                this.sound.play('explosion_crunch_0', { volume: 3.0 });
                this.showShipMessage('ASTEROID SALVO!');
                break;
            }
            default:
                this.hasShield = true;
                this.player.setTint(0x00aaff);
                if (this.shieldBubble) this.shieldBubble.destroy();
                this.shieldBubble = this.add.circle(this.player.x, this.player.y, 40, 0x00aaff, 0.3);
                this.shieldBubble.setStrokeStyle(4, 0x00aaff);
                this.time.delayedCall(4000, () => {
                    this.hasShield = false;
                    this.player.clearTint();
                    if (this.shieldBubble) {
                        this.shieldBubble.destroy();
                        this.shieldBubble = null;
                    }
                });
                this.sound.play('shield_sound');
                this.showShipMessage('SHIELD PULSE!');
        }
        this.updateSpecialText();
    }

    spawnTripleHelpers() {
        // Remove any helpers from a previous Triple so they don't stack.
        this.removeTripleHelpers();
        const cruiserKeys = CRUISER_SHOP_ITEMS.map(item => item.key);
        const shipKeys = Phaser.Utils.Array.Shuffle(cruiserKeys.slice()).slice(0, 2);
        const duration = this.getPowerupDuration('rapidFireDuration');
        this.tripleHelpers = shipKeys.map((shipKey, index) => {
            const side = index === 0 ? -1 : 1;
            const helper = this.add.image(this.player.x + side * 90, this.player.y, shipKey).setScale(0.3).setDepth(900);
            helper.setData('side', side);
            return helper;
        });
        this.tripleHelperFireEvent = this.time.addEvent({
            delay: 400,
            loop: true,
            callback: () => this.fireTripleHelpers()
        });
        this.tripleHelperEndEvent = this.time.delayedCall(duration, () => this.removeTripleHelpers());
        this.showShipMessage('TRIPLE! Two cruisers join you for ' + Math.round(duration / 1000) + ' seconds');
    }

    fireTripleHelpers() {
        if (!this.tripleHelpers) return;
        this.tripleHelpers.forEach(helper => {
            if (!helper.active) return;
            const bullet = this.bullets.create(helper.x, helper.y - 30, 'bullet');
            bullet.setVelocityY(-400);
            bullet.setScale(0.7);
        });
    }

    removeTripleHelpers() {
        if (this.tripleHelperFireEvent) this.tripleHelperFireEvent.remove(false);
        if (this.tripleHelperEndEvent) this.tripleHelperEndEvent.remove(false);
        this.tripleHelperFireEvent = null;
        this.tripleHelperEndEvent = null;
        if (this.tripleHelpers) this.tripleHelpers.forEach(helper => helper.destroy());
        this.tripleHelpers = null;
    }

    finishRun() {
        this.removeTripleHelpers();
        if (this.engineSound) this.engineSound.stop();
        this.game.registry.set('lastRunScore', this.score);
        this.scene.start('GameOverScene');
    }

    applyShopPurchases() {
        const purchases = readSavedValue('spaceGameShopPurchases', []);
        if (!Array.isArray(purchases) || purchases.length === 0) return;
        saveValue('spaceGameShopPurchases', []);

        for (const purchase of purchases) {
            if (purchase === 'extraLife') {
                this.maxLives++;
                this.lives++;
                this.updateHearts();
            } else if (purchase === 'bulletUpgrade') {
                this.bulletCount = Math.min(3, this.bulletCount + 1);
            } else if (purchase === 'shield') {
                this.hasShield = true;
                this.player.setTint(0x00aaff);
                this.shieldBubble = this.add.circle(this.player.x, this.player.y, 40, 0x00aaff, 0.3);
                this.shieldBubble.setStrokeStyle(4, 0x00aaff);
                this.time.delayedCall(this.getPowerupDuration('shieldDuration'), () => {
                    this.hasShield = false;
                    this.player.clearTint();
                    if (this.shieldBubble) {
                        this.shieldBubble.destroy();
                        this.shieldBubble = null;
                    }
                });
            } else if (purchase === 'speedBoost') {
                this.speedBoost += 10;
                this.time.delayedCall(this.getPowerupDuration('speedDuration'), () => {
                    this.speedBoost = Math.max(0, this.speedBoost - 10);
                });
            } else if (purchase === 'rapidFire') {
                this.rapidFire = true;
                this.rapidFireSpeedBonus = 30;
                this.time.delayedCall(this.getPowerupDuration('rapidFireDuration'), () => {
                    this.rapidFire = false;
                    this.rapidFireSpeedBonus = 0;
                });
            } else if (purchase === 'triple') {
                this.spawnTripleHelpers();
            }
        }
    }
    spawnBossAsteroid() {
        if (this.bossSpawned) return;
        this.bossSpawned = true;
        this.nextBossScore += 100;
        const bossNumber = this.bossesSpawned + 1;
        const bossTexture = bossNumber === 2
            ? 'second_boss'
            : bossNumber === 3 ? 'third_boss'
            : bossNumber === 4 ? 'fourth_boss'
            : bossNumber === 5 ? 'fifth_boss' : 'asteroid';
        const isAnimatedBoss = bossNumber === 5;
        this.bossesSpawned = bossNumber;
        const boss = this.asteroids.create(400, -150, bossTexture);
        boss.setScale(14.0);
        if (isAnimatedBoss) boss.play('fifth_boss_spin');
        boss.setVelocityY(35);
        boss.setVelocityX(0);
        boss.setData('isBoss', true);
        boss.setData('bossNumber', bossNumber);
        const maxHp = bossNumber * 50;
        boss.setData('maxHp', maxHp);
        boss.setData('hp', maxHp);
        this.bossAsteroid = boss;

        if (this.bossHealthText) this.bossHealthText.destroy();
        this.bossHealthText = this.add.text(250, 18, 'Boss HP: ' + maxHp + '/' + maxHp, { fontSize: '20px', fill: '#FF0' });
        this.bossHealthText.setDepth(1000);
    }

    checkBossSpawn() {
        if (!this.isTutorial && !this.bossSpawned && this.score >= this.nextBossScore) {
            this.spawnBossAsteroid();
        }
    }

    damageBoss(boss, damage) {
        const bossHp = boss.getData('hp') - damage;
        boss.setData('hp', bossHp);
        if (this.bossHealthText) {
            this.bossHealthText.setText('Boss HP: ' + bossHp + '/' + boss.getData('maxHp'));
        }

        if (bossHp <= 0) {
            this.defeatBoss(boss);
        }
    }

    defeatBoss(boss) {
        if (!boss.active) return;

        this.firstBossDefeated = true;
        this.level++;
        this.levelText.setText('Level ' + this.level);
        this.sound.play('explosion_crunch_0', { volume: 3.5 });
        const explosion = this.add.sprite(boss.x, boss.y, 'explosion');
        explosion.setScale(8);
        explosion.play('explode');
        explosion.on('animationcomplete', () => { explosion.destroy(); });
        this.spawnShipPickup(boss.x, boss.y);
        boss.destroy();
        this.bossAsteroid = null;
        this.bossSpawned = false;
        if (this.bossHealthText) {
            this.bossHealthText.destroy();
            this.bossHealthText = null;
        }
        this.checkBossSpawn();
    }

    spawnShipPickup(x, y) {
        const cruiserKeys = CRUISER_SHOP_ITEMS.map(item => item.key);
        const notYetAvailable = cruiserKeys.filter(key => !this.getAvailableCruisers().includes(key));
        const shipKey = Phaser.Utils.Array.GetRandom(notYetAvailable.length ? notYetAvailable : cruiserKeys);
        const pickup = this.shipPickups.create(Phaser.Math.Clamp(x, 32, 768), y, shipKey);
        pickup.setData('shipKey', shipKey);
        pickup.setScale(0.8);
        pickup.setVelocity(0, 150);
        pickup.setDepth(10);
    }

    getAvailableCruisers() {
        return [...this.unlockedCruisers, ...this.runOnlyCruisers.filter(key => !this.unlockedCruisers.includes(key))];
    }

    showShipMessage(message) {
        if (this.shipNotice) this.shipNotice.destroy();
        const notice = this.add.text(400, 125, message, {
            fontSize: '26px',
            fill: '#FFFFFF',
            stroke: '#00AAFF',
            strokeThickness: 4,
            backgroundColor: '#071426',
            padding: { x: 12, y: 8 },
            align: 'center'
        }).setOrigin(0.5).setDepth(1200);
        this.shipNotice = notice;
        this.time.delayedCall(4000, () => {
            if (this.shipNotice === notice) {
                notice.destroy();
                this.shipNotice = null;
            }
        });
    }

    showShipMenu() {
        if (this.shipMenuContainer) return;

        const availableCruisers = this.getAvailableCruisers();
        const panelHeight = 105 + availableCruisers.length * 58;
        const menu = this.add.container(0, 0).setDepth(1500);
        menu.add(this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7));
        const panel = this.add.rectangle(400, 300, 460, panelHeight, 0x071426, 0.98);
        panel.setStrokeStyle(3, 0x00aaff);
        menu.add(panel);

        const title = styleSpaceTitle(this.add.text(400, 300 - panelHeight / 2 + 30, 'CHOOSE YOUR CRUISER', {
            fontSize: '24px'
        }).setOrigin(0.5), 24);
        menu.add(title);

        availableCruisers.forEach((shipKey, index) => {
            const rowY = 300 - panelHeight / 2 + 75 + index * 58;
            const row = this.add.rectangle(400, rowY, 400, 50, 0x12304a, 0.95)
                .setInteractive({ useHandCursor: true });
            row.on('pointerdown', () => this.selectCruiser(shipKey));
            menu.add(row);

            const shipImage = this.add.image(260, rowY, shipKey).setDisplaySize(42, 42).setFlipY(true);
            menu.add(shipImage);
            const shipName = shipKey === 'player'
                ? 'Cruiser 7'
                : shipKey.replace('ship_cruiser_', 'Cruiser ');
            const label = this.add.text(300, rowY, (index + 1) + '.  ' + shipName, {
                fontSize: '20px',
                fill: shipKey === this.currentShip ? '#55FFAA' : '#FFFFFF'
            }).setOrigin(0, 0.5);
            menu.add(label);
        });

        const help = this.add.text(400, 300 + panelHeight / 2 - 22, 'Click a ship or press its number  •  X / Esc closes', {
            fontSize: '14px', fill: '#BBDDEE'
        }).setOrigin(0.5);
        menu.add(help);
        this.shipMenuContainer = menu;
    }

    hideShipMenu() {
        if (!this.shipMenuContainer) return;
        this.shipMenuContainer.destroy();
        this.shipMenuContainer = null;
    }

    selectCruiser(shipKey) {
        if (!this.getAvailableCruisers().includes(shipKey)) return;
        this.hideShipMenu();
        if (shipKey === this.currentShip || this.isShipSwitching) return;

        const previousShip = this.currentShip;
        const destinationX = this.player.x;
        const destinationY = this.player.y;
        const exitX = destinationX < 400 ? -80 : 880;
        const entryX = exitX < 0 ? 880 : -80;
        this.isShipSwitching = true;
        this.player.setVelocity(0, 0);
        this.player.body.enable = false;

        const departingShip = this.add.image(destinationX, destinationY, previousShip)
            .setScale(this.player.scaleX).setDepth(1100);
        this.player.setVisible(false);

        this.tweens.add({
            targets: departingShip,
            x: exitX,
            y: destinationY - 55,
            alpha: 0,
            angle: exitX < destinationX ? -22 : 22,
            duration: 350,
            ease: 'Cubic.In',
            onComplete: () => {
                departingShip.destroy();
                this.currentShip = shipKey;
                this.player.setTexture(shipKey);
                this.player.setScale(0.4);
                this.player.setPosition(entryX, destinationY + 35);
                this.player.setAngle(entryX < destinationX ? 18 : -18);
                this.player.setAlpha(0);
                this.player.setVisible(true);
                this.player.body.updateFromGameObject();

                this.tweens.add({
                    targets: this.player,
                    x: destinationX,
                    y: destinationY,
                    alpha: 1,
                    angle: 0,
                    duration: 520,
                    ease: 'Cubic.Out',
                    onUpdate: () => {
                        if (this.shieldBubble) this.shieldBubble.setPosition(this.player.x, this.player.y);
                    },
                    onComplete: () => {
                        this.isShipSwitching = false;
                        this.player.body.updateFromGameObject();
                        this.player.body.enable = true;
                    }
                });
            }
        });

        if (shipKey === 'ship_cruiser_4' && !this.hasCruiser4LifeBonus) {
            this.hasCruiser4LifeBonus = true;
            this.maxLives++;
            this.lives = Math.min(this.maxLives, this.lives + 1);
            this.updateHearts();
        }
        if (this.unlockedCruisers.includes(shipKey)) {
            this.game.registry.set('selectedCruiser', shipKey);
            saveValue('selectedCruiser', shipKey);
        }
        const selectedName = shipKey === 'player' ? 'Cruiser 7' : shipKey.replace('ship_cruiser_', 'Cruiser ');
        this.showShipMessage(selectedName + ' selected');
    }


    updateHearts() {
        // Clear old hearts if they exist
        if (this.heartImages) {
            this.heartImages.forEach(heart => heart.destroy());
        }
        this.heartImages = [];
        
        console.log("Updating hearts, lives:", this.lives);

        const heartWidth = 40;
        const heartSpacing = 10;
        const totalWidth = (this.lives * heartWidth) + ((this.lives - 1) * heartSpacing);
        const startX = 400 - (totalWidth / 2) + (heartWidth / 2); // Center horizontally
        const startY = 50; // Top of screen

        for (let i = 0; i < this.lives; i++) {
            // Use the loaded heart image
            let heart = this.add.image(startX + (i * (heartWidth + heartSpacing)), startY, 'heart_ui');
            heart.setDisplaySize(heartWidth, heartWidth);
            heart.setDepth(1000); 
            this.heartImages.push(heart);
        }
        
        // Debug Text to confirm it's updating
        if (this.debugText) this.debugText.destroy();
        this.debugText = this.add.text(370, 90, 'Lives: ' + this.lives, { fontSize: '20px', fill: '#0F0' });
        this.debugText.setDepth(1000);
        this.debugText.setVisible(!this.isTutorial);
    }



    update() {
        if (this.tutorialGuideContainer) {
            this.player.setVelocityX(0);
            return;
        }
        if (this.isTutorial && !this.tutorialComplete) {
            this.asteroids.getChildren().forEach(asteroid => {
                if (asteroid.active && asteroid.y > 630) {
                    asteroid.setPosition(Phaser.Math.Between(55, 745), -45);
                }
            });
        }

        // Asteroids only fall straight down: remove any sideways velocity picked up from collisions.
        this.asteroids.getChildren().forEach(asteroid => {
            if (asteroid.active && asteroid.body && asteroid.body.velocity.x !== 0) {
                asteroid.setVelocityX(0);
            }
        });

        if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
            this.scene.launch('PauseScene');
            this.scene.pause();
            return;
        }
        if (this.isShipSwitching) return;

        if (Phaser.Input.Keyboard.JustDown(this.shipSwitchKey)) {
            if (this.shipMenuContainer) this.hideShipMenu();
            else this.showShipMenu();
        }

        if (this.shipMenuContainer) {
            if (Phaser.Input.Keyboard.JustDown(this.shipMenuEscapeKey)) this.hideShipMenu();
            const availableCruisers = this.getAvailableCruisers();
            for (let index = 0; index < availableCruisers.length; index++) {
                if (Phaser.Input.Keyboard.JustDown(this.shipMenuKeys[index])) {
                    this.selectCruiser(availableCruisers[index]);
                    break;
                }
            }
            this.player.setVelocityX(0);
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.specialAbilityKey)) {
            this.activateSpecialAbility();
        }
        this.updateSpecialText();

        if (this.shieldBubble) {
            this.shieldBubble.x = this.player.x;
            this.shieldBubble.y = this.player.y;
        }
        if (this.tripleHelpers) {
            this.tripleHelpers.forEach(helper => {
                helper.x = this.player.x + helper.getData('side') * 90;
                helper.y = this.player.y;
            });
        }

        const cruiserSpeedBonus = this.currentShip === 'ship_cruiser_3' ? 50 : 0;
        const specialSpeedBonus = this.time.now < this.specialSpeedUntil ? 300 : 0;
        const speed = 700 + (this.speedBoost * 10) + cruiserSpeedBonus + specialSpeedBonus;
        if (this.cursors.left.isDown || this.touchInput.left) this.player.setVelocityX(-speed);
        else if (this.cursors.right.isDown || this.touchInput.right) this.player.setVelocityX(speed);
        else this.player.setVelocityX(0);
        this.player.setVelocityY(0); // The ship moves only left and right

        const hasRapidFire = this.rapidFire || this.currentShip === 'ship_cruiser_8';
        let canFire = false;
        if (hasRapidFire) {
            // Automatic fire when rapid fire is active
            const fireDelay = this.time.now < this.specialRapidFireUntil ? 20 : 50;
            if (this.time.now - this.lastFireTime > fireDelay) {
                canFire = true;
                this.lastFireTime = this.time.now;
            }
        } else if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            canFire = true;
        } else if (this.touchInput.fire && this.time.now - this.touchFireLastShot >= 220) {
            canFire = true;
            this.touchFireLastShot = this.time.now;
        }

        if (canFire) {
            this.sound.play('laser_sound');
            const shotsPerVolley = this.currentShip === 'ship_cruiser_9'
                ? 3
                : hasRapidFire ? 1 : Math.min(this.bulletCount, 3);
            for (let i = 0; i < shotsPerVolley; i++) {
                const offsetX = (i - (shotsPerVolley - 1) / 2) * 20;
                const bullet = this.bullets.create(this.player.x + offsetX, this.player.y - 40, 'bullet');
                const overdriveBonus = this.time.now < this.specialRapidFireUntil ? 120 : 0;
                const bulletSpeed = hasRapidFire ? 400 + this.rapidFireSpeedBonus + overdriveBonus : 400;
                bullet.setVelocityY(-bulletSpeed);
                bullet.setScale(0.7);
            }
        }
    }
}

class PauseScene extends Phaser.Scene {
    constructor() { super('PauseScene'); }

    create() {
        fitPlayfieldCamera(this);
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.72);
        this.add.text(400, 250, 'Ⅱ', {
            fontSize: '112px',
            fill: '#FFFFFF',
            stroke: '#00AAFF',
            strokeThickness: 5
        }).setOrigin(0.5);
        styleSpaceTitle(this.add.text(400, 325, 'PAUSED', {
            fontSize: '32px'
        }).setOrigin(0.5), 32, '#6D48FF');

        this.addPauseButton(385, 'RESUME', 0x14527A, () => this.resumeGame());
        this.addPauseButton(445, 'RESTART RUN', 0x66451C, () => this.restartRun());
        this.addPauseButton(505, 'EXIT TO TITLE', 0x642F48, () => this.exitToTitle());
        this.add.text(400, 555, 'Z / Esc: Resume     R: Restart     Q: Exit', {
            fontSize: '15px', fill: '#C5D8E5'
        }).setOrigin(0.5);

        this.resumeKeys = [
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        ];
        this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.exitKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    }

    addPauseButton(y, label, color, onClick) {
        const button = this.add.rectangle(400, y, 270, 46, color, 0.98)
            .setStrokeStyle(2, 0x74CFFF)
            .setInteractive({ useHandCursor: true });
        button.on('pointerdown', onClick);
        this.add.text(400, y, label, {
            fontSize: '19px', fill: '#FFFFFF', fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', onClick);
    }

    stopGameEngine() {
        const gameScene = this.scene.get('MainGameScene');
        if (gameScene.engineSound) gameScene.engineSound.stop();
    }

    resumeGame() {
        this.scene.stop();
        this.scene.resume('MainGameScene');
    }

    restartRun() {
        this.stopGameEngine();
        this.scene.stop('MainGameScene');
        this.scene.start('MainGameScene');
    }

    exitToTitle() {
        this.stopGameEngine();
        this.scene.stop('MainGameScene');
        this.scene.start('StartScene');
    }

    update() {
        if (this.resumeKeys.some(key => Phaser.Input.Keyboard.JustDown(key))) {
            this.resumeGame();
        } else if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
            this.restartRun();
        } else if (Phaser.Input.Keyboard.JustDown(this.exitKey)) {
            this.exitToTitle();
        }
    }
}

// Game Over Scene
class GameOverScene extends Phaser.Scene {
    constructor() { super('GameOverScene'); }
    preload() {
        this.load.image('go_bg', './assets/game_over_space_invader/sprites/space_world_background.png');
        this.load.image('button', './assets/game_over_space_invader/ui/round_buttons_3.png');
    }
    create() {
        fitPlayfieldCamera(this);
        addFullScreenBackground(this, 'go_bg');
        styleSpaceTitle(this.add.text(400, 300, 'GAME OVER', { fontSize: '64px' }).setOrigin(0.5), 64, '#FF3D6E');
        const runScore = Math.max(0, Number(this.game.registry.get('lastRunScore')) || 0);
        const credits = Math.max(0, Number(readSavedValue('spaceGameCredits', 0)) || 0) + runScore;
        saveValue('spaceGameCredits', credits);
        const highScore = Math.max(runScore, Number(readSavedValue('spaceGameHighScore', 0)) || 0);
        saveValue('spaceGameHighScore', highScore);
        this.add.text(400, 370, 'Run score: ' + runScore + '   Credits earned: ' + runScore, {
            fontSize: '23px', fill: '#FFFFFF'
        }).setOrigin(0.5);
        const retryButton = this.add.image(400, 450, 'button').setScale(1.0).setInteractive();
        retryButton.on('pointerdown', () => { this.scene.start('StartScene'); });
    }
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-root',
    scale: {
        mode: Phaser.Scale.RESIZE,
        fullscreenTarget: document.body
    },
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 } }
    },
    scene: [StartScene, MainGameScene, PauseScene, GameOverScene]
};

const game = new Phaser.Game(config);

const fullscreenButton = document.getElementById('fullscreen-button');
function toggleGameFullscreen() {
    if (game.scale.isFullscreen) {
        game.scale.stopFullscreen();
    } else {
        game.scale.startFullscreen();
    }
}

fullscreenButton.addEventListener('click', toggleGameFullscreen);
document.addEventListener('keydown', event => {
    if ((event.key !== '1' && event.code !== 'Numpad1') || event.repeat) return;
    const mainScene = game.scene.getScene('MainGameScene');
    if (mainScene && mainScene.shipMenuContainer) return;
    event.preventDefault();
    toggleGameFullscreen();
});

game.scale.on('enterfullscreen', () => {
    fullscreenButton.textContent = '⛶ Exit Fullscreen';
    fullscreenButton.setAttribute('aria-label', 'Exit fullscreen');
});
game.scale.on('leavefullscreen', () => {
    fullscreenButton.textContent = '⛶ Fullscreen';
    fullscreenButton.setAttribute('aria-label', 'Enter fullscreen');
});
