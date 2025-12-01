/**
 * Основной класс игры
 */
class Game {
    constructor(canvasId) {
        // Проверка наличия canvas
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas с id "${canvasId}" не найден`);
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('Не удалось получить контекст canvas');
        }
        
        this.canvas.width = Constants.CANVAS_WIDTH;
        this.canvas.height = Constants.CANVAS_HEIGHT;

        // Игровые объекты
        this.input = new InputHandler();
        this.player = null;
        this.platforms = [];
        this.coins = [];
        this.enemies = [];

        // Загрузчик спрайтов
        this.spriteLoader = new SpriteLoader();
        this.useSprites = true;
        
        // Параллакс-фон
        this.background = null;

        // Игровое состояние
        this.state = Constants.GAME_STATE.MENU;
        this.score = 0;
        this.level = 1;
        this.lives = Constants.INITIAL_LIVES;
        this.gameLoopId = null;
        this.lastFrameTime = 0;

        // Уровни
        this.levels = this.createLevels();

        // Инициализация
        this.init();
        this.setupEventListeners();
    }

    /**
     * Инициализация игры
     */
    async init() {
        // Загрузка спрайтов (если используются)
        if (this.useSprites) {
            await this.loadSprites();
        }
        
        this.loadLevel(this.level);
        this.updateUI();
    }

    /**
     * Загрузка спрайтов из папки Kenney
     */
    async loadSprites() {
        try {
            Logger.log('Начинаем загрузку спрайтов...');
            
            const color = 'beige';
            const spriteList = [
                // Персонаж
                { name: `character_${color}_idle`, path: `KENNEY/Sprites/Characters/Default/character_${color}_idle.png` },
                { name: `character_${color}_walk_a`, path: `KENNEY/Sprites/Characters/Default/character_${color}_walk_a.png` },
                { name: `character_${color}_walk_b`, path: `KENNEY/Sprites/Characters/Default/character_${color}_walk_b.png` },
                { name: `character_${color}_jump`, path: `KENNEY/Sprites/Characters/Default/character_${color}_jump.png` },
                { name: `character_${color}_hit`, path: `KENNEY/Sprites/Characters/Default/character_${color}_hit.png` },
                
                // Платформы (каменные блоки)
                { name: 'terrain_stone_block', path: 'KENNEY/Sprites/Tiles/Default/terrain_stone_block.png' },
                { name: 'terrain_stone_block_top', path: 'KENNEY/Sprites/Tiles/Default/terrain_stone_block_top.png' },
                { name: 'terrain_stone_block_bottom', path: 'KENNEY/Sprites/Tiles/Default/terrain_stone_block_bottom.png' },
                { name: 'terrain_stone_block_left', path: 'KENNEY/Sprites/Tiles/Default/terrain_stone_block_left.png' },
                { name: 'terrain_stone_block_right', path: 'KENNEY/Sprites/Tiles/Default/terrain_stone_block_right.png' },
                { name: 'terrain_stone_block_top_left', path: 'KENNEY/Sprites/Tiles/Default/terrain_stone_block_top_left.png' },
                { name: 'terrain_stone_block_top_right', path: 'KENNEY/Sprites/Tiles/Default/terrain_stone_block_top_right.png' },
                { name: 'terrain_stone_block_bottom_left', path: 'KENNEY/Sprites/Tiles/Default/terrain_stone_block_bottom_left.png' },
                { name: 'terrain_stone_block_bottom_right', path: 'KENNEY/Sprites/Tiles/Default/terrain_stone_block_bottom_right.png' },
                { name: 'terrain_stone_block_center', path: 'KENNEY/Sprites/Tiles/Default/terrain_stone_block_center.png' },
                
                // Монеты
                { name: 'coin_gold', path: 'KENNEY/Sprites/Tiles/Default/coin_gold.png' },
                
                // Цель (флаг)
                { name: 'flag_blue_a', path: 'KENNEY/Sprites/Tiles/Default/flag_blue_a.png' },
                
                // Фоны для параллакса
                { name: 'background_solid_sky', path: 'KENNEY/Sprites/Backgrounds/Default/background_solid_sky.png' },
                { name: 'background_color_hills', path: 'KENNEY/Sprites/Backgrounds/Default/background_color_hills.png' },
                { name: 'background_color_trees', path: 'KENNEY/Sprites/Backgrounds/Default/background_color_trees.png' },
                
                // Враги
                { name: 'slime_normal_rest', path: 'KENNEY/Sprites/Enemies/Default/slime_normal_rest.png' },
                { name: 'slime_normal_walk_a', path: 'KENNEY/Sprites/Enemies/Default/slime_normal_walk_a.png' },
                { name: 'slime_normal_walk_b', path: 'KENNEY/Sprites/Enemies/Default/slime_normal_walk_b.png' },
            ];
            
            await this.spriteLoader.loadSprites(spriteList);
            
            // Инициализируем параллакс-фон
            this.background = new ParallaxBackground(this.canvas, this.spriteLoader);
            this.background.addLayer('background_color_trees', 0.3, this.canvas.height - 200, 200);
            this.background.addLayer('background_color_hills', 0.5, this.canvas.height - 150, 150);
            Logger.log(`Загружено спрайтов: ${this.spriteLoader.loadedCount}/${this.spriteLoader.totalCount}`);
            Logger.log('Спрайты загружены успешно!');
        } catch (error) {
            Logger.error('Ошибка загрузки спрайтов:', error);
            this.useSprites = false;
        }
    }

    /**
     * Создание уровней
     */
    createLevels() {
        return [
            // Уровень 1 - Стиль Марио (простой, проходимый)
            {
                platforms: [
                    // Стартовая платформа
                    new Platform(0, this.canvas.height - 64, 256, 64),
                    // Последовательные платформы
                    new Platform(320, this.canvas.height - 64, 192, 64),
                    new Platform(576, this.canvas.height - 128, 192, 64),
                    new Platform(832, this.canvas.height - 64, 192, 64),
                    new Platform(1088, this.canvas.height - 64, 128, 64), // Финиш
                ],
                coins: [
                    { x: 400, y: this.canvas.height - 128 },
                    { x: 640, y: this.canvas.height - 192 },
                    { x: 896, y: this.canvas.height - 128 },
                ],
                enemies: [
                    { x: 360, y: this.canvas.height - 128 }, // На первой платформе
                    { x: 616, y: this.canvas.height - 192 }, // На второй платформе
                    { x: 872, y: this.canvas.height - 128 }, // На третьей платформе
                ],
                startX: 50,
                startY: this.canvas.height - 128,
                goalX: 1100,
                goalY: this.canvas.height - 128
            },
            // Уровень 2 - Стиль Марио (средний)
            {
                platforms: [
                    // Старт
                    new Platform(0, this.canvas.height - 64, 192, 64),
                    // Платформы с разной высотой
                    new Platform(256, this.canvas.height - 128, 192, 64),
                    new Platform(512, this.canvas.height - 192, 192, 64),
                    new Platform(768, this.canvas.height - 128, 192, 64),
                    new Platform(1024, this.canvas.height - 64, 192, 64), // Финиш
                ],
                coins: [
                    { x: 320, y: this.canvas.height - 192 },
                    { x: 576, y: this.canvas.height - 256 },
                    { x: 832, y: this.canvas.height - 192 },
                    { x: 1088, y: this.canvas.height - 128 },
                ],
                enemies: [
                    { x: 296, y: this.canvas.height - 192 },
                    { x: 552, y: this.canvas.height - 256 },
                    { x: 808, y: this.canvas.height - 192 },
                ],
                startX: 50,
                startY: this.canvas.height - 128,
                goalX: 1100,
                goalY: this.canvas.height - 128
            },
            // Уровень 3 - Стиль Марио (сложный с движущимися платформами)
            {
                platforms: [
                    // Старт
                    new Platform(0, this.canvas.height - 64, 192, 64),
                    // Обычные платформы
                    new Platform(256, this.canvas.height - 128, 192, 64),
                    new Platform(512, this.canvas.height - 192, 192, 64),
                    new Platform(768, this.canvas.height - 128, 192, 64),
                    new Platform(1024, this.canvas.height - 64, 192, 64), // Финиш
                ],
                coins: [
                    { x: 320, y: this.canvas.height - 192 },
                    { x: 576, y: this.canvas.height - 256 },
                    { x: 832, y: this.canvas.height - 192 },
                ],
                enemies: [
                    { x: 296, y: this.canvas.height - 192 },
                    { x: 552, y: this.canvas.height - 256 },
                    { x: 808, y: this.canvas.height - 192 },
                ],
                startX: 50,
                startY: this.canvas.height - 128,
                goalX: 1100,
                goalY: this.canvas.height - 128
            }
        ];
    }

    /**
     * Загрузка уровня
     */
    loadLevel(levelNumber) {
        // Проверяем, есть ли уровень из редактора
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('testLevel') === 'true') {
            const editorLevel = localStorage.getItem('editorLevel');
            if (editorLevel) {
                try {
                    const level = JSON.parse(editorLevel);
                    this.loadCustomLevel(level);
                    return;
                } catch (e) {
                    Logger.warn('Ошибка загрузки уровня из редактора:', e);
                }
            }
        }

        // Проверяем, не превышен ли максимум уровней
        if (levelNumber > this.levels.length) {
            // Игра завершена - все уровни пройдены
            this.state = Constants.GAME_STATE.GAME_OVER;
            this.showGameOver();
            if (this.gameLoopId) {
                cancelAnimationFrame(this.gameLoopId);
            }
            return;
        }
        const levelIndex = levelNumber - 1;
        const level = this.levels[levelIndex];

        // Создаем копии платформ
        this.platforms = level.platforms.map(p => {
            const platform = new Platform(p.x, p.y, p.width, p.height, p.type);
            if (p.type === 'moving') {
                platform.setMoving(p.moveDistance, p.moveSpeed, p.direction);
            }
            // Устанавливаем загрузчик спрайтов для платформ
            if (this.useSprites && this.spriteLoader) {
                platform.setSpriteLoader(this.spriteLoader);
            }
            return platform;
        });

        // Добавляем движущиеся платформы для уровня 3 (одинаковая скорость)
        if (levelNumber === 3) {
            const platformSpeed = 1.2; // Унифицированная скорость для всех платформ
            // Движущиеся платформы между основными
            const movingPlatform1 = new Platform(400, this.canvas.height - 256, 128, 64);
            movingPlatform1.setMoving(150, platformSpeed, 'horizontal');
            if (this.useSprites && this.spriteLoader) {
                movingPlatform1.setSpriteLoader(this.spriteLoader);
            }
            this.platforms.push(movingPlatform1);

            const movingPlatform2 = new Platform(640, this.canvas.height - 320, 128, 64);
            movingPlatform2.setMoving(120, platformSpeed, 'horizontal');
            if (this.useSprites && this.spriteLoader) {
                movingPlatform2.setSpriteLoader(this.spriteLoader);
            }
            this.platforms.push(movingPlatform2);

            const movingPlatform3 = new Platform(880, this.canvas.height - 256, 128, 64);
            movingPlatform3.setMoving(140, platformSpeed, 'horizontal');
            if (this.useSprites && this.spriteLoader) {
                movingPlatform3.setSpriteLoader(this.spriteLoader);
            }
            this.platforms.push(movingPlatform3);
        }

        // Добавляем нижнюю платформу (пол) - правильный размер под спрайты
        const floorPlatform = new Platform(0, this.canvas.height - 64, this.canvas.width, 64);
        if (this.useSprites && this.spriteLoader) {
            floorPlatform.setSpriteLoader(this.spriteLoader);
        }
        this.platforms.push(floorPlatform);
        
        // Создаем врагов (на платформах)
        this.enemies = [];
        if (level.enemies) {
            level.enemies.forEach(enemyData => {
                // Размещаем врага на платформе (выше на высоту спрайта)
                const enemyY = enemyData.y - 48; // Враг стоит на платформе
                const enemy = new Enemy(enemyData.x, enemyY, 48, 48);
                enemy.startX = enemyData.x;
                enemy.startY = enemyY;
                if (this.useSprites && this.spriteLoader) {
                    enemy.setSpriteLoader(this.spriteLoader);
                }
                this.enemies.push(enemy);
            });
        }

        // Создаем монеты (размер 64x64 для спрайтов)
        this.coins = level.coins.map(coin => ({
            x: coin.x,
            y: coin.y,
            width: 32,
            height: 32,
            collected: false
        }));

        // Создаем цель (финиш)
        this.goal = {
            x: level.goalX,
            y: level.goalY,
            width: 50,
            height: 50
        };

        // Создаем игрока (сохраняем параметры скорости между уровнями)
        if (!this.player) {
            this.player = new Player(level.startX, level.startY, 64, 64);
        } else {
            // Сохраняем параметры перед сбросом
            const savedSpeed = this.player.speed;
            const savedMaxSpeed = this.player.maxSpeed;
            const savedAnimationSpeed = this.player.animationSpeed;
            
            this.player.reset(level.startX, level.startY);
            
            // Восстанавливаем параметры (чтобы не менялись между уровнями)
            this.player.speed = savedSpeed || Constants.PLAYER_SPEED;
            this.player.maxSpeed = savedMaxSpeed || Constants.PLAYER_SPEED;
            this.player.animationSpeed = savedAnimationSpeed || Constants.ANIMATION_SPEED_PLAYER;
        }
        
        // Устанавливаем загрузчик спрайтов персонажу
        if (this.useSprites && this.spriteLoader) {
            this.player.setSpriteLoader(this.spriteLoader);
        }
    }

    /**
     * Загрузка кастомного уровня из редактора
     */
    loadCustomLevel(levelData) {
        // Создаем платформы
        this.platforms = levelData.platforms.map(p => {
            const platform = new Platform(p.x, p.y, p.width, p.height);
            if (this.useSprites && this.spriteLoader) {
                platform.setSpriteLoader(this.spriteLoader);
            }
            return platform;
        });

        // Добавляем пол
        const floorPlatform = new Platform(0, this.canvas.height - 64, this.canvas.width, 64);
        if (this.useSprites && this.spriteLoader) {
            floorPlatform.setSpriteLoader(this.spriteLoader);
        }
        this.platforms.push(floorPlatform);

        // Создаем монеты
        this.coins = levelData.coins.map(coin => ({
            x: coin.x,
            y: coin.y,
            width: 32,
            height: 32,
            collected: false
        }));

        // Создаем врагов
        this.enemies = [];
        if (levelData.enemies) {
            levelData.enemies.forEach(enemyData => {
                const enemyY = enemyData.y - 48;
                const enemy = new Enemy(enemyData.x, enemyY, 48, 48);
                enemy.startX = enemyData.x;
                enemy.startY = enemyY;
                if (this.useSprites && this.spriteLoader) {
                    enemy.setSpriteLoader(this.spriteLoader);
                }
                this.enemies.push(enemy);
            });
        }

        // Устанавливаем старт и финиш
        this.goal = {
            x: levelData.goalX,
            y: levelData.goalY,
            width: 50,
            height: 50
        };

        // Создаем игрока
        if (!this.player) {
            this.player = new Player(levelData.startX, levelData.startY, 64, 64);
        } else {
            const savedSpeed = this.player.speed;
            const savedMaxSpeed = this.player.maxSpeed;
            const savedAnimationSpeed = this.player.animationSpeed;
            this.player.reset(levelData.startX, levelData.startY);
            this.player.speed = savedSpeed || Constants.PLAYER_SPEED;
            this.player.maxSpeed = savedMaxSpeed || Constants.PLAYER_SPEED;
            this.player.animationSpeed = savedAnimationSpeed || Constants.ANIMATION_SPEED_PLAYER;
        }

        // Устанавливаем загрузчик спрайтов
        if (this.useSprites && this.spriteLoader) {
            this.player.setSpriteLoader(this.spriteLoader);
        }
    }

    /**
     * Настройка обработчиков событий UI
     */
    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('restartGameBtn').addEventListener('click', () => this.restart());
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.nextLevel());
    }

    /**
     * Запуск игры
     */
    start() {
        if (this.state === Constants.GAME_STATE.MENU || this.state === Constants.GAME_STATE.PAUSED) {
            this.state = Constants.GAME_STATE.PLAYING;
            this.lastFrameTime = 0; // Сбрасываем для правильного delta time
            this.gameLoop();
        }
    }

    /**
     * Пауза
     */
    pause() {
        if (this.state === Constants.GAME_STATE.PLAYING) {
            this.state = Constants.GAME_STATE.PAUSED;
            if (this.gameLoopId) {
                cancelAnimationFrame(this.gameLoopId);
            }
        } else if (this.state === Constants.GAME_STATE.PAUSED) {
            this.state = Constants.GAME_STATE.PLAYING;
            this.lastFrameTime = 0; // Сбрасываем для правильного delta time
            this.gameLoop();
        }
    }

    /**
     * Рестарт
     */
    restart() {
        this.score = 0;
        this.level = 1;
        this.lives = Constants.INITIAL_LIVES;
        this.state = Constants.GAME_STATE.PLAYING;
        this.loadLevel(this.level);
        this.updateUI();
        this.hideGameOver();
        this.hideLevelComplete();
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
        }
        this.gameLoop();
    }

    /**
     * Переход на следующий уровень
     */
    nextLevel() {
        if (this.level < this.levels.length) {
            this.level++;
            this.loadLevel(this.level);
            this.updateUI();
            this.hideLevelComplete();
            this.state = Constants.GAME_STATE.PLAYING;
            this.lastFrameTime = 0; // Сбрасываем для правильного delta time
            this.gameLoop();
        } else {
            // Все уровни пройдены
            this.state = Constants.GAME_STATE.GAME_OVER;
            document.getElementById('gameOverText').textContent = 'Победа! Все уровни пройдены!';
            this.showGameOver();
            this.hideLevelComplete();
        }
    }

    /**
     * Обновление состояния игры
     */
    update() {
        if (this.state !== Constants.GAME_STATE.PLAYING) return;

        // Обновляем платформы
        this.platforms.forEach(platform => platform.update());

        // Обновляем врагов
        this.enemies.forEach(enemy => enemy.update(this.platforms));

        // Обновляем игрока (включая анимации)
        this.player.update(this.input, this.platforms);
        
        // Проверяем столкновения с врагами
        this.checkEnemyCollisions();
        
        // Обновляем параллакс-фон
        if (this.background) {
            this.background.update(this.player.x);
        }
        
        // Убеждаемся, что загрузчик спрайтов установлен персонажу
        if (this.useSprites && this.spriteLoader && this.player && !this.player.useSprite) {
            this.player.setSpriteLoader(this.spriteLoader);
        }

        // Проверяем сбор монет
        this.checkCoinCollection();

        // Проверяем достижение цели
        this.checkGoal();

        // Проверяем выход за границы экрана (падение)
        if (this.player.y > this.canvas.height) {
            this.playerDied();
        }
    }

    /**
     * Проверка столкновений с врагами
     */
    checkEnemyCollisions() {
        for (let enemy of this.enemies) {
            const collision = Collision.check(this.player, enemy);
            if (collision) {
                // Если игрок сверху врага - убиваем врага
                if (collision.side === 'top' && this.player.velocityY > 0) {
                    // Удаляем врага
                    const index = this.enemies.indexOf(enemy);
                    if (index > -1) {
                        this.enemies.splice(index, 1);
                        this.score += Constants.ENEMY_SCORE;
                        this.updateUI();
                    }
                    // Отталкиваем игрока вверх
                    this.player.velocityY = -10;
                } else {
                    // Враг убивает игрока
                    this.playerDied();
                }
            }
        }
    }

    /**
     * Проверка сбора монет
     */
    checkCoinCollection() {
        for (let coin of this.coins) {
            if (!coin.collected) {
                const collision = Collision.check(this.player, { getBounds: () => coin });
                if (collision) {
                    coin.collected = true;
                    this.score += Constants.COIN_SCORE;
                    this.updateUI();
                }
            }
        }
    }

    /**
     * Проверка достижения цели
     */
    checkGoal() {
        const collision = Collision.check(this.player, { getBounds: () => this.goal });
        if (collision) {
            this.completeLevel();
        }
    }

    /**
     * Завершение уровня
     */
    completeLevel() {
        this.score += Constants.LEVEL_BONUS_MULTIPLIER * this.level;
        this.updateUI();
        
        // Проверяем, не последний ли это уровень
        if (this.level >= this.levels.length) {
            // Все уровни пройдены
            this.state = Constants.GAME_STATE.GAME_OVER;
            document.getElementById('gameOverText').textContent = 'Победа! Все уровни пройдены!';
            this.showGameOver();
        } else {
            // Показываем экран завершения уровня
            this.state = Constants.GAME_STATE.LEVEL_COMPLETE;
            this.showLevelComplete();
        }
        
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
        }
    }

    /**
     * Смерть игрока
     */
    playerDied() {
        this.lives--;
        this.updateUI();

        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Перезапускаем уровень с новой позицией
            this.loadLevel(this.level);
        }
    }

    /**
     * Конец игры
     */
    gameOver() {
        this.state = Constants.GAME_STATE.GAME_OVER;
        this.showGameOver();
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
        }
    }

    /**
     * Отрисовка игры
     */
    render() {
        // Очистка canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Рисуем параллакс-фон
        if (this.background) {
            this.background.render(this.ctx);
        } else {
            // Fallback - простой градиент
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#5a5a5a');
            gradient.addColorStop(0.3, '#4a4a4a');
            gradient.addColorStop(0.7, '#3a3a3a');
            gradient.addColorStop(1, '#2a2a2a');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Рисуем платформы
        this.platforms.forEach(platform => {
            platform.render(this.ctx);
        });

        // Рисуем монеты (используем спрайты)
        this.coins.forEach(coin => {
            if (!coin.collected) {
                if (this.useSprites && this.spriteLoader && this.spriteLoader.isLoaded('coin_gold')) {
                    this.spriteLoader.render(
                        this.ctx,
                        'coin_gold',
                        coin.x,
                        coin.y,
                        coin.width,
                        coin.height
                    );
                } else {
                    // Fallback
                    this.ctx.fillStyle = '#ffd700';
                    this.ctx.beginPath();
                    this.ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        });

        // Рисуем цель (используем спрайт флага)
        if (this.useSprites && this.spriteLoader && this.spriteLoader.isLoaded('flag_blue_a')) {
            this.spriteLoader.render(
                this.ctx,
                'flag_blue_a',
                this.goal.x,
                this.goal.y,
                this.goal.width,
                this.goal.height
            );
        } else {
            // Fallback
            this.ctx.fillStyle = '#6a6a6a';
            this.ctx.fillRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);
            this.ctx.strokeStyle = '#8a8a8a';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);
            this.ctx.fillStyle = '#d4af37';
            this.ctx.font = 'bold 24px Cinzel';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('✓', this.goal.x + this.goal.width / 2, this.goal.y + this.goal.height / 2);
        }

        // Рисуем врагов
        this.enemies.forEach(enemy => enemy.render(this.ctx));

        // Рисуем игрока
        this.player.render(this.ctx);
    }

    /**
     * Игровой цикл с delta time
     */
    gameLoop(currentTime = 0) {
        // Вычисляем delta time (в секундах)
        let deltaTime = 0;
        if (this.lastFrameTime > 0) {
            deltaTime = (currentTime - this.lastFrameTime) / 1000; // Конвертируем в секунды
            // Ограничиваем delta time для предотвращения скачков
            deltaTime = Math.min(deltaTime, 0.1); // Максимум 100ms = 10 FPS минимум
        }
        this.lastFrameTime = currentTime;
        
        // Если это первый кадр, пропускаем обновление
        if (deltaTime === 0) {
            this.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }
        
        this.update(deltaTime);
        this.render();
        this.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * Обновление UI
     */
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('finalScore').textContent = this.score;
    }

    /**
     * Показать экран окончания игры
     */
    showGameOver() {
        document.getElementById('gameOver').classList.remove('hidden');
    }

    /**
     * Скрыть экран окончания игры
     */
    hideGameOver() {
        document.getElementById('gameOver').classList.add('hidden');
    }

    /**
     * Показать экран завершения уровня
     */
    showLevelComplete() {
        document.getElementById('levelComplete').classList.remove('hidden');
    }

    /**
     * Скрыть экран завершения уровня
     */
    hideLevelComplete() {
        document.getElementById('levelComplete').classList.add('hidden');
    }
}

