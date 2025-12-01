/**
 * Класс врага
 */
class Enemy {
    constructor(x, y, width, height, type = 'slime') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        
        // Физика (фиксированные значения, одинаковые на всех уровнях)
        this.velocityX = -Constants.ENEMY_SPEED;
        this.velocityY = 0;
        this.gravity = Constants.ENEMY_GRAVITY;
        this.onGround = false;
        this.moveSpeed = Constants.ENEMY_SPEED;
        
        // Анимация
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = Constants.ANIMATION_SPEED_ENEMY;
        this.facingRight = false;
        
        // Границы патрулирования
        this.startX = x;
        this.patrolDistance = Constants.ENEMY_PATROL_DISTANCE;
        this.direction = -1; // -1 влево, 1 вправо
        
        // Спрайты
        this.spriteLoader = null;
        this.useSprite = false;
    }

    /**
     * Установка загрузчика спрайтов
     */
    setSpriteLoader(spriteLoader) {
        this.spriteLoader = spriteLoader;
        this.useSprite = true;
    }

    /**
     * Обновление врага
     * @param {Array} platforms - Массив платформ
     * @param {number} deltaTime - Время с последнего кадра в секундах
     */
    update(platforms, deltaTime = 0.016) {
        // Нормализуем delta time к 60 FPS для стабильности
        const normalizedDelta = deltaTime * 60;
        
        // Применяем гравитацию (с учетом delta time)
        if (!this.onGround) {
            this.velocityY += this.gravity * normalizedDelta;
            if (this.velocityY > 15) {
                this.velocityY = 15;
            }
        }

        // Патрулирование (в пределах платформы, в обе стороны) - унифицированная скорость
        if (this.x <= this.startX - this.patrolDistance) {
            this.direction = 1;
            this.velocityX = this.moveSpeed;
            this.facingRight = true;
        } else if (this.x >= this.startX + this.patrolDistance) {
            this.direction = -1;
            this.velocityX = -this.moveSpeed;
            this.facingRight = false;
        }

        // Обновляем позицию (с учетом delta time)
        this.x += this.velocityX * normalizedDelta;
        this.y += this.velocityY * normalizedDelta;

        // Проверяем коллизии с платформами
        this.onGround = false;
        this.checkCollisions(platforms);

        // Обновляем анимацию (с учетом delta time)
        this.updateAnimation(deltaTime);
    }

    /**
     * Обновление анимации
     * @param {number} deltaTime - Время с последнего кадра в секундах
     */
    updateAnimation(deltaTime = 0.016) {
        const normalizedDelta = deltaTime * 60; // Нормализуем к 60 FPS
        this.animationTimer += this.animationSpeed * normalizedDelta;
        if (this.animationTimer >= Constants.ANIMATION_THRESHOLD_ENEMY) {
            this.animationTimer = 0;
            this.animationFrame = (this.animationFrame + 1) % 2;
        }
    }

    /**
     * Проверка коллизий с платформами
     */
    checkCollisions(platforms) {
        for (let platform of platforms) {
            const collision = Collision.check(this, platform);
            
            if (collision) {
                if (collision.side === 'top' && this.velocityY > 0) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.onGround = true;
                } else if (collision.side === 'left' || collision.side === 'right') {
                    // Отталкиваемся от стены
                    this.velocityX = -this.velocityX;
                    this.direction = -this.direction;
                    this.facingRight = !this.facingRight;
                }
            }
        }
    }

    /**
     * Отрисовка врага
     * @param {CanvasRenderingContext2D} ctx - Контекст canvas
     */
    render(ctx) {
        if (this.useSprite && this.spriteLoader) {
            let spriteName = 'slime_normal_rest';
            
            if (Math.abs(this.velocityX) > 0.1) {
                spriteName = this.animationFrame === 0 ? 'slime_normal_walk_a' : 'slime_normal_walk_b';
            }
            
            if (this.spriteLoader.isLoaded(spriteName)) {
                this.spriteLoader.render(
                    ctx,
                    spriteName,
                    this.x,
                    this.y,
                    this.width,
                    this.height,
                    !this.facingRight
                );
                return;
            }
        }

        // Fallback
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#4a0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    /**
     * Получение границ для коллизий
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

