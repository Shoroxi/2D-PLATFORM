/**
 * Класс игрового персонажа
 */
class Player {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // Физические свойства
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpPower = -15;
        this.gravity = 0.8;
        this.friction = 0.85;
        
        // Состояние
        this.onGround = false;
        this.color = '#ff6b6b';
        this.maxVelocityY = 20; // Максимальная скорость падения
        
        // Анимация
        this.facingRight = true;
        
        // Спрайты (опционально)
        this.sprite = null;
        this.useSprite = false;
    }

    /**
     * Обновление состояния персонажа
     * @param {InputHandler} input - Обработчик ввода
     * @param {Array} platforms - Массив платформ
     */
    update(input, platforms) {
        // Применяем гравитацию
        if (!this.onGround) {
            this.velocityY += this.gravity;
            // Ограничиваем максимальную скорость падения
            if (this.velocityY > this.maxVelocityY) {
                this.velocityY = this.maxVelocityY;
            }
        }

        // Обработка движения влево/вправо
        if (input.isLeftPressed()) {
            this.velocityX = -this.speed;
            this.facingRight = false;
        } else if (input.isRightPressed()) {
            this.velocityX = this.speed;
            this.facingRight = true;
        } else {
            // Применяем трение при отсутствии ввода
            this.velocityX *= this.friction;
        }

        // Обработка прыжка
        if (input.isJumpPressed() && this.onGround) {
            this.velocityY = this.jumpPower;
            this.onGround = false;
        }

        // Обновляем позицию
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Проверяем коллизии с платформами
        this.onGround = false;
        this.checkCollisions(platforms);

        // Ограничиваем позицию в пределах экрана (по горизонтали)
        if (this.x < 0) {
            this.x = 0;
            this.velocityX = 0;
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
     * Установка спрайта для персонажа
     * @param {Sprite} sprite - Спрайт персонажа
     */
    setSprite(sprite) {
        this.sprite = sprite;
        this.useSprite = true;
    }

    /**
     * Отрисовка персонажа
     * @param {CanvasRenderingContext2D} ctx - Контекст canvas
     */
    render(ctx) {
        // Если используется спрайт
        if (this.useSprite && this.sprite) {
            this.sprite.update();
            this.sprite.render(ctx, this.x, this.y, this.width, this.height, !this.facingRight);
            return;
        }

        // Отрисовка по умолчанию (прямоугольник)
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Рисуем глаза
        ctx.fillStyle = '#fff';
        const eyeSize = 4;
        const eyeY = this.y + this.height * 0.3;
        if (this.facingRight) {
            ctx.fillRect(this.x + this.width * 0.6, eyeY, eyeSize, eyeSize);
            ctx.fillRect(this.x + this.width * 0.75, eyeY, eyeSize, eyeSize);
        } else {
            ctx.fillRect(this.x + this.width * 0.25, eyeY, eyeSize, eyeSize);
            ctx.fillRect(this.x + this.width * 0.4, eyeY, eyeSize, eyeSize);
        }
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
     * Сброс позиции персонажа
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
    }
}

