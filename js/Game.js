/**
 * Основной класс игры
 */
class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1200;
        this.canvas.height = 700;

        // Игровые объекты
        this.input = new InputHandler();
        this.player = null;
        this.platforms = [];
        this.coins = [];
        this.enemies = [];

        // Менеджер спрайтов (опционально)
        this.spriteManager = new SpriteManager();
        this.useSprites = false; // Включить/выключить использование спрайтов

        // Игровое состояние
        this.state = 'menu'; // 'menu', 'playing', 'paused', 'gameOver', 'levelComplete'
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.gameLoopId = null;

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
     * Загрузка спрайтов (пример)
     * Раскомментируйте и укажите пути к вашим спрайтам
     */
    async loadSprites() {
        try {
            // Пример загрузки спрайтов
            // await this.spriteManager.loadSprite('player', 'assets/images/player.png', 32, 32, 4);
            // await this.spriteManager.loadSprite('platform', 'assets/images/platform.png', 64, 32, 1);
            // await this.spriteManager.loadSprite('coin', 'assets/images/coin.png', 16, 16, 8);
            
            // После загрузки можно установить спрайт персонажу
            // if (this.player && this.spriteManager.getSprite('player')) {
            //     this.player.setSprite(this.spriteManager.getSprite('player'));
            // }
        } catch (error) {
            console.warn('Ошибка загрузки спрайтов:', error);
            this.useSprites = false; // Отключаем спрайты при ошибке
        }
    }

    /**
     * Создание уровней
     */
    createLevels() {
        return [
            // Уровень 1 - Обучение
            {
                platforms: [
                    new Platform(0, this.canvas.height - 40, 200, 40),
                    new Platform(250, this.canvas.height - 140, 150, 40),
                    new Platform(450, this.canvas.height - 240, 150, 40),
                    new Platform(650, this.canvas.height - 140, 150, 40),
                    new Platform(850, this.canvas.height - 240, 150, 40),
                    new Platform(1050, this.canvas.height - 140, 150, 40),
                    new Platform(1050, this.canvas.height - 40, 150, 40),
                ],
                coins: [
                    { x: 300, y: this.canvas.height - 180 },
                    { x: 500, y: this.canvas.height - 280 },
                    { x: 700, y: this.canvas.height - 180 },
                    { x: 900, y: this.canvas.height - 280 },
                    { x: 1100, y: this.canvas.height - 180 },
                ],
                startX: 50,
                startY: this.canvas.height - 100,
                goalX: 1100,
                goalY: this.canvas.height - 80
            },
            // Уровень 2 - Сложнее
            {
                platforms: [
                    new Platform(0, this.canvas.height - 40, 150, 40),
                    new Platform(200, this.canvas.height - 180, 120, 40),
                    new Platform(370, this.canvas.height - 320, 120, 40),
                    new Platform(540, this.canvas.height - 180, 120, 40),
                    new Platform(710, this.canvas.height - 320, 120, 40),
                    new Platform(880, this.canvas.height - 180, 120, 40),
                    new Platform(1050, this.canvas.height - 40, 150, 40),
                ],
                coins: [
                    { x: 250, y: this.canvas.height - 220 },
                    { x: 420, y: this.canvas.height - 360 },
                    { x: 590, y: this.canvas.height - 220 },
                    { x: 760, y: this.canvas.height - 360 },
                    { x: 930, y: this.canvas.height - 220 },
                ],
                startX: 50,
                startY: this.canvas.height - 100,
                goalX: 1100,
                goalY: this.canvas.height - 80
            },
            // Уровень 3 - С движущимися платформами
            {
                platforms: [
                    new Platform(0, this.canvas.height - 40, 150, 40),
                    new Platform(200, this.canvas.height - 180, 100, 40),
                    new Platform(450, this.canvas.height - 40, 150, 40),
                ],
                coins: [
                    { x: 250, y: this.canvas.height - 220 },
                    { x: 500, y: this.canvas.height - 80 },
                ],
                startX: 50,
                startY: this.canvas.height - 100,
                goalX: 1100,
                goalY: this.canvas.height - 80
            }
        ];
    }

    /**
     * Загрузка уровня
     */
    loadLevel(levelNumber) {
        const levelIndex = (levelNumber - 1) % this.levels.length;
        const level = this.levels[levelIndex];

        // Создаем копии платформ
        this.platforms = level.platforms.map(p => {
            const platform = new Platform(p.x, p.y, p.width, p.height, p.type);
            if (p.type === 'moving') {
                platform.setMoving(p.moveDistance, p.moveSpeed, p.direction);
            }
            return platform;
        });

        // Добавляем движущиеся платформы для уровня 3
        if (levelNumber === 3) {
            const movingPlatform1 = new Platform(350, this.canvas.height - 280, 100, 40);
            movingPlatform1.setMoving(200, 2, 'horizontal');
            this.platforms.push(movingPlatform1);

            const movingPlatform2 = new Platform(600, this.canvas.height - 380, 100, 40);
            movingPlatform2.setMoving(150, 1.5, 'horizontal');
            this.platforms.push(movingPlatform2);

            const movingPlatform3 = new Platform(800, this.canvas.height - 180, 100, 40);
            movingPlatform3.setMoving(100, 2.5, 'horizontal');
            this.platforms.push(movingPlatform3);
        }

        // Добавляем нижнюю платформу (пол)
        this.platforms.push(new Platform(0, this.canvas.height - 20, this.canvas.width, 20));

        // Создаем монеты
        this.coins = level.coins.map(coin => ({
            x: coin.x,
            y: coin.y,
            width: 20,
            height: 20,
            collected: false
        }));

        // Создаем цель (финиш)
        this.goal = {
            x: level.goalX,
            y: level.goalY,
            width: 50,
            height: 50
        };

        // Создаем игрока
        if (!this.player) {
            this.player = new Player(level.startX, level.startY, 30, 40);
        } else {
            this.player.reset(level.startX, level.startY);
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
        if (this.state === 'menu' || this.state === 'paused') {
            this.state = 'playing';
            this.gameLoop();
        }
    }

    /**
     * Пауза
     */
    pause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            if (this.gameLoopId) {
                cancelAnimationFrame(this.gameLoopId);
            }
        } else if (this.state === 'paused') {
            this.state = 'playing';
            this.gameLoop();
        }
    }

    /**
     * Рестарт
     */
    restart() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.state = 'playing';
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
        this.level++;
        this.loadLevel(this.level);
        this.updateUI();
        this.hideLevelComplete();
        this.state = 'playing';
        this.gameLoop();
    }

    /**
     * Обновление состояния игры
     */
    update() {
        if (this.state !== 'playing') return;

        // Обновляем платформы
        this.platforms.forEach(platform => platform.update());

        // Обновляем игрока
        this.player.update(this.input, this.platforms);

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
     * Проверка сбора монет
     */
    checkCoinCollection() {
        for (let coin of this.coins) {
            if (!coin.collected) {
                const collision = Collision.check(this.player, { getBounds: () => coin });
                if (collision) {
                    coin.collected = true;
                    this.score += 10;
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
        this.state = 'levelComplete';
        this.score += 100 * this.level; // Бонус за прохождение уровня
        this.updateUI();
        this.showLevelComplete();
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
        this.state = 'gameOver';
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

        // Рисуем фон (небо)
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(0.5, '#98d8c8');
        gradient.addColorStop(1, '#6b8e23');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Рисуем платформы
        this.platforms.forEach(platform => platform.render(this.ctx));

        // Рисуем монеты
        this.coins.forEach(coin => {
            if (!coin.collected) {
                this.ctx.fillStyle = '#ffd700';
                this.ctx.beginPath();
                this.ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = '#ffed4e';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        });

        // Рисуем цель
        this.ctx.fillStyle = '#4ade80';
        this.ctx.fillRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);
        this.ctx.strokeStyle = '#22c55e';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('✓', this.goal.x + this.goal.width / 2, this.goal.y + this.goal.height / 2 + 7);

        // Рисуем игрока
        this.player.render(this.ctx);
    }

    /**
     * Игровой цикл
     */
    gameLoop() {
        this.update();
        this.render();
        this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
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

