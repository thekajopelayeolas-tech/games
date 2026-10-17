// Start Scene
class StartScene extends Phaser.Scene {
    constructor() { super('StartScene'); }
    preload() {
        this.load.image('start_bg', 'assets/space_invader_start/sprites/space_world_background.png');
        this.load.image('button', 'assets/space_invader_start/ui/round_buttons_1.png');
    }
    create() {
        this.cameras.main.setBackgroundColor('#ff00ff'); // Make start scene magenta
        this.add.image(400, 300, 'start_bg').setDisplaySize(800, 600);
        const startButton = this.add.image(400, 400, 'button').setScale(1.5).setInteractive();
        startButton.on('pointerdown', () => { this.scene.start('MainGameScene'); });
    }
}

// Main Game Scene
class MainGameScene extends Phaser.Scene {
    constructor() { super('MainGameScene'); }
    preload() {
        this.load.image('main_bg', 'assets/space_intruder/sprites/space_world_background.png');
        this.load.image('player', 'assets/space_intruder/sprites/space_cruiser_7.png');
        this.load.image('bullet', 'assets/space_intruder/sprites/space_rocket_4.png');
        this.load.image('asteroid', 'assets/space_intruder/sprites/asteroid_big.png');
        this.load.image('heart_ui', 'assets/space_intruder/ui/hearts_1.png');
        this.load.image('powerup_red', 'assets/space_intruder/ui/power_up_6.png');
        this.load.image('powerup_green', 'assets/space_intruder/ui/power_up_1.png');
        this.load.image('powerup_purple', 'assets/space_intruder/ui/power_up_4.png');
        this.load.image('powerup_blue', 'assets/space_intruder/ui/power_up_3.png');
        this.load.image('powerup_yellow', 'assets/space_intruder/ui/power_up_5.png');
        this.load.image('powerup_white', 'assets/space_intruder/ui/power_up_12.png');
        this.load.image('powerup_pink', 'assets/space_intruder/ui/power_up_7.png');
        this.load.image('powerup_rapid_fire', 'assets/space_intruder/sprites/space_rocket_4.png');
        this.load.spritesheet('explosion', 'assets/space_intruder/sprites/big_explosion.png', { frameWidth: 128, frameHeight: 128 });
        this.load.audio('explosion_crunch_0', 'assets/space_intruder/sounds/explosion.mp3');
        // this.load.audio('shield_sound', 'assets/space_intruder/sounds/shield.mp3');
        // this.load.audio('engine_sound', 'assets/space_intruder/sounds/engine.mp3');
        // this.load.audio('laser_sound', 'assets/space_intruder/sounds/laser.mp3');
    }
    create() {
        // Add background
        this.add.image(400, 300, 'main_bg').setDisplaySize(800, 600);
        
        this.player = this.physics.add.sprite(400, 550, 'player').setScale(0.4);
        this.player.setCollideWorldBounds(true);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        this.score = 0;
        this.destroyedCount = 0;
        this.lives = 3;
        this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '20px', fill: '#FFF' });
        
        // Shield Bubble
        this.shieldBubble = null;
        
        // Play engine sound
        // this.engineSound = this.sound.add('engine_sound', { loop: true });
        // this.engineSound.play();
        
        // Initialize hearts
        this.heartImages = [];
        this.updateHearts();

        this.bullets = this.physics.add.group();
        this.powerups = this.physics.add.group();
        
        this.bulletCount = 1;
        this.hasShield = false;
        this.speedBoost = 0;
        this.slowAsteroids = false;
        this.scoreMultiplier = 1;
        this.rapidFire = false;
        this.rapidFireSpeedBonus = 0;
        this.lastFireTime = 0;
        this.lastPowerUpType = 0;
        
        this.asteroids = this.physics.add.group();
        this.time.addEvent({
            delay: 800,
            callback: () => {
                const asteroidX = Phaser.Math.Between(30, 770);
                const asteroid = this.asteroids.create(asteroidX, -50, 'asteroid');
                const speed = this.slowAsteroids ? 100 : 250;
                asteroid.setVelocityY(speed);
                asteroid.setScale(0.7);
            },
            loop: true
        });

        this.anims.create({ key: 'explode', frames: this.anims.generateFrameNumbers('explosion'), frameRate: 15, repeat: 0 });

        this.physics.add.collider(this.player, this.asteroids, (player, asteroid) => {
            if (this.hasShield) {
                this.hasShield = false;
                player.clearTint();
                
                // Destroy shield bubble
                if (this.shieldBubble) {
                    this.shieldBubble.destroy();
                    this.shieldBubble = null;
                }
                
                asteroid.destroy();
                return;
            }
            this.lives -= 1;
            this.updateHearts();
            asteroid.destroy();
            if (this.lives <= 0) {
                this.scene.start('GameOverScene');
            }
        });

        this.physics.add.collider(this.bullets, this.asteroids, (bullet, asteroid) => {
            bullet.destroy();
            asteroid.destroy();
            
            this.sound.play('explosion_crunch_0');
            const explosion = this.add.sprite(asteroid.x, asteroid.y, 'explosion');
            explosion.play('explode');
            explosion.on('animationcomplete', () => { explosion.destroy(); });
            
            this.score += 1 * this.scoreMultiplier;
            this.scoreText.setText('Score: ' + this.score);
            
            this.destroyedCount++;
            if (this.destroyedCount % 10 === 0) {
                this.spawnPowerUp();
            }
        });

        // Periodic powerup spawner (every 10 seconds)
        this.time.addEvent({
            delay: 10000,
            callback: () => {
                this.spawnPowerUp();
            },
            loop: true
        });
        this.physics.add.overlap(this.player, this.powerups, (player, powerup) => {
            const type = powerup.getData('type');
            powerup.destroy();

            if (type === 1) this.bulletCount += 2;
            if (type === 2) {
                this.hasShield = true;
                player.setTint(0x00ff00);
                // Add shield bubble
                if (this.shieldBubble) this.shieldBubble.destroy();
                this.shieldBubble = this.add.circle(player.x, player.y, 40, 0x00ff00, 0.3);
                this.shieldBubble.setStrokeStyle(4, 0x00ff00);

                this.time.delayedCall(10000, () => {
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
                this.time.delayedCall(10000, () => {
                    this.speedBoost = 0;
                });
            }
            if (type === 4) {
                this.slowAsteroids = true;
                this.time.delayedCall(10000, () => {
                    this.slowAsteroids = false;
                });
            }
            if (type === 5) { // Double Score (Purple)
                this.scoreMultiplier = 2;
                this.time.delayedCall(10000, () => {
                    this.scoreMultiplier = 1;
                });
            }
            if (type === 6) { // Nuke (White)
                this.asteroids.clear(true, true);
            }
            if (type === 7) { // Heal (Pink)
                if (this.lives < 3) {
                    this.lives++;
            if (type === 8) { // Rapid Fire
                this.rapidFire = true;
                this.rapidFireSpeedBonus = 30;
                this.bulletCount += 50;
                this.speedBoost += 50;
                this.time.delayedCall(30000, () => {
                    this.rapidFire = false;
                    this.rapidFireSpeedBonus = 0;
                    this.bulletCount -= 50;
                    this.speedBoost -= 50;
                });
            }
                    this.updateHearts();
                }
            }
        });
    }
    spawnPowerUp() {
        const x = Phaser.Math.Between(100, 700);
        const type = Phaser.Math.Between(1, 8);
        let texture = 'powerup_red';
        switch(type) {
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
    }



    update() {
        if (this.shieldBubble) {
            this.shieldBubble.x = this.player.x;
            this.shieldBubble.y = this.player.y;
        }

        const speed = 700 + (this.speedBoost * 10);
        if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
        else if (this.cursors.right.isDown) this.player.setVelocityX(speed);
        else this.player.setVelocityX(0);

        let canFire = false;
        if (this.rapidFire) {
            // Automatic fire when rapid fire is active
            if (this.time.now - this.lastFireTime > 50) { // Limit to 50ms for performance
                canFire = true;
                this.lastFireTime = this.time.now;
            }
        } else if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            canFire = true;
        }

        if (canFire) {
            // this.sound.play('laser_sound');
            for (let i = 0; i < this.bulletCount; i++) {
                const offsetX = (i - (this.bulletCount - 1) / 2) * 20;
                const bullet = this.bullets.create(this.player.x + offsetX, this.player.y - 40, 'bullet');
                bullet.setVelocityY(-(400 + this.rapidFireSpeedBonus));
                bullet.setScale(0.7);
            }
        }
    }
}

// Game Over Scene
class GameOverScene extends Phaser.Scene {
    constructor() { super('GameOverScene'); }
    preload() {
        this.load.image('go_bg', 'assets/game_over_space_invader/sprites/space_world_background.png');
        this.load.image('button', 'assets/game_over_space_invader/ui/round_buttons_3.png');
    }
    create() {
        this.add.image(400, 300, 'go_bg').setDisplaySize(800, 600);
        this.add.text(400, 300, 'GAME OVER', { fontSize: '64px', fill: '#F00' }).setOrigin(0.5);
        const retryButton = this.add.image(400, 450, 'button').setScale(1.0).setInteractive();
        retryButton.on('pointerdown', () => { this.scene.start('StartScene'); });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 } }
    },
    scene: [StartScene, MainGameScene, GameOverScene]
};

const game = new Phaser.Game(config);
