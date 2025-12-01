/**
 * Класс игрового персонажа
 */
class Player {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // Физические свойства (фиксированные, не меняются между уровнями)
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = Constants.PLAYER_SPEED;
        this.jumpPower = Constants.PLAYER_JUMP_POWER;
        this.gravity = Constants.PLAYER_GRAVITY;
        this.friction = Constants.PLAYER_FRICTION;
        this.maxSpeed = Constants.PLAYER_SPEED;
        
        // Состояние
        this.onGround = false;
        this.color = '#ff6b6b';
        this.maxVelocityY = Constants.PLAYER_MAX_VELOCITY_Y;
        
        // Анимация
        this.facingRight = true;
        this.animationState = 'idle'; // idle, walk, jump, hit
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = Constants.ANIMATION_SPEED_PLAYER;
        
        // Спрайты (опционально)
        this.spriteLoader = null;
        this.useSprite = false;
        this.characterColor = 'beige'; // beige, green, pink, purple, yellow
    }

    /**
     * Обновление состояния персонажа
     * @param {InputHandler} input - Обработчик ввода
     * @param {Array} platforms - Массив платформ
     * @param {number} deltaTime - Время с последнего кадра в секундах
     */
    update(input, platforms, deltaTime = 0.016) {
        // Нормализуем delta time к 60 FPS для стабильности
        const normalizedDelta = deltaTime * 60; // Умножаем на 60 для нормализации
        
        // Применяем гравитацию (с учетом delta time)
        if (!this.onGround) {
            this.velocityY += this.gravity * normalizedDelta;
            // Ограничиваем максимальную скорость падения
            if (this.velocityY > this.maxVelocityY) {
                this.velocityY = this.maxVelocityY;
            }
        }

        // Обработка движения влево/вправо (фиксированная скорость)
        if (input.isLeftPressed()) {
            this.velocityX = -this.speed;
            this.facingRight = false;
        } else if (input.isRightPressed()) {
            this.velocityX = this.speed;
            this.facingRight = true;
        } else {
            // Применяем трение при отсутствии ввода
            this.velocityX *= Math.pow(this.friction, normalizedDelta);
            if (Math.abs(this.velocityX) < 0.1) {
                this.velocityX = 0;
            }
        }
        
        // Ограничиваем скорость
        if (Math.abs(this.velocityX) > this.maxSpeed) {
            this.velocityX = this.velocityX > 0 ? this.maxSpeed : -this.maxSpeed;
        }

        // Обработка прыжка
        if (input.isJumpPressed() && this.onGround) {
            this.velocityY = this.jumpPower;
            this.onGround = false;
        }

        // Обновляем позицию (с учетом delta time)
        this.x += this.velocityX * normalizedDelta;
        this.y += this.velocityY * normalizedDelta;

        // Проверяем коллизии с платформами
        this.onGround = false;
        this.checkCollisions(platforms);

        // Ограничиваем позицию в пределах экрана (по горизонтали)
        if (this.x < 0) {
            this.x = 0;
            this.velocityX = 0;
        }

        // Обновление анимации (с учетом delta time)
        this.updateAnimation(deltaTime);
    }

    /**
     * Обновление анимации персонажа
     * @param {number} deltaTime - Время с последнего кадра в секундах
     */
    updateAnimation(deltaTime = 0.016) {
        // Определяем состояние анимации
        if (!this.onGround) {
            this.animationState = 'jump';
        } else if (Math.abs(this.velocityX) > 0.1) {
            this.animationState = 'walk';
        } else {
            this.animationState = 'idle';
        }

        // Обновляем таймер анимации (с учетом delta time)
        const normalizedDelta = deltaTime * 60; // Нормализуем к 60 FPS
        if (this.animationState === 'walk') {
            this.animationTimer += this.animationSpeed * normalizedDelta;
            if (this.animationTimer >= Constants.ANIMATION_THRESHOLD_PLAYER) {
                this.animationTimer = 0;
                this.animationFrame = (this.animationFrame + 1) % 2; // Переключаем между walk_a и walk_b
            }
        } else {
            this.animationTimer = 0;
            this.animationFrame = 0;
        }
    }

    /**
     * Проверка коллизий с платформами
     * @param {Array} platforms - Массив платформ
     */
    checkCollisions(platforms) {
        for (let platform of platforms) {
            const collision = Collision.check(this, platform);
            
            if (collision) {
                // Коллизия сверху (персонаж падает на платформу)
                if (collision.side === 'top' && this.velocityY > 0) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.onGround = true;
                }
                // Коллизия снизу (персонаж ударяется головой)
                else if (collision.side === 'bottom' && this.velocityY < 0) {
                    this.y = platform.y + platform.height;
                    this.velocityY = 0;
                }
                // Коллизия слева
                else if (collision.side === 'left') {
                    this.x = platform.x - this.width;
                    this.velocityX = 0;
                }
                // Коллизия справа
                else if (collision.side === 'right') {
                    this.x = platform.x + platform.width;
                    this.velocityX = 0;
                }
            }
        }
    }

    /**
     * Установка загрузчика спрайтов
     */
    setSpriteLoader(spriteLoader) {
        this.spriteLoader = spriteLoader;
        this.useSprite = true;
    }

    /**
     * Получение имени спрайта для текущей анимации
     */
    getSpriteName() {
        if (!this.useSprite || !this.spriteLoader) {
            return null;
        }

        let spriteName = `character_${this.characterColor}_`;

        switch (this.animationState) {
            case 'jump':
                spriteName += 'jump';
                break;
            case 'walk':
                spriteName += this.animationFrame === 0 ? 'walk_a' : 'walk_b';
                break;
            case 'hit':
                spriteName += 'hit';
                break;
            default:
                spriteName += 'idle';
        }

        return spriteName;
    }

    /**
     * Отрисовка персонажа
     * @param {CanvasRenderingContext2D} ctx - Контекст canvas
     */
    render(ctx) {
        // Если используется спрайт
        if (this.useSprite && this.spriteLoader) {
            const spriteName = this.getSpriteName();
            if (spriteName && this.spriteLoader.isLoaded(spriteName)) {
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

        // Отрисовка по умолчанию (прямоугольник в каменном стиле)
        ctx.fillStyle = '#6a6a6a';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Обводка
        ctx.strokeStyle = '#4a4a4a';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Детали
        ctx.fillStyle = '#5a5a5a';
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
    }

    /**
     * Получение границ персонажа для коллизий
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    /**
     * Сброс позиции персонажа (НЕ сбрасывает параметры скорости!)
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
        // НЕ сбрасываем speed, maxSpeed, animationSpeed - они должны оставаться постоянными!
    }
}

