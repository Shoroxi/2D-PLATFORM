/**
 * Класс платформы
 */
class Platform {
    constructor(x, y, width, height, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type; // 'normal', 'moving', 'breakable'
        
        // Для движущихся платформ
        this.velocityX = 0;
        this.velocityY = 0;
        this.startX = x;
        this.startY = y;
        this.moveDistance = 0;
        this.moveSpeed = 0;
        this.moveDirection = 1; // 1 или -1
        
        // Цвет в зависимости от типа
        this.colors = {
            normal: '#4ecdc4',
            moving: '#ffe66d',
            breakable: '#ff6b6b'
        };
    }

    /**
     * Создание движущейся платформы
     * @param {number} distance - Расстояние движения
     * @param {number} speed - Скорость движения
     * @param {string} direction - 'horizontal' или 'vertical'
     */
    setMoving(distance, speed, direction = 'horizontal') {
        this.type = 'moving';
        this.moveDistance = distance;
        this.moveSpeed = speed;
        this.direction = direction;
        
        if (direction === 'horizontal') {
            this.velocityX = speed;
        } else {
            this.velocityY = speed;
        }
    }

    /**
     * Обновление состояния платформы
     */
    update() {
        if (this.type === 'moving') {
            if (this.direction === 'horizontal') {
                this.x += this.velocityX;
                
                // Проверяем границы движения
                if (this.x >= this.startX + this.moveDistance) {
                    this.x = this.startX + this.moveDistance;
                    this.velocityX = -this.moveSpeed;
                } else if (this.x <= this.startX) {
                    this.x = this.startX;
                    this.velocityX = this.moveSpeed;
                }
            } else {
                this.y += this.velocityY;
                
                // Проверяем границы движения
                if (this.y >= this.startY + this.moveDistance) {
                    this.y = this.startY + this.moveDistance;
                    this.velocityY = -this.moveSpeed;
                } else if (this.y <= this.startY) {
                    this.y = this.startY;
                    this.velocityY = this.moveSpeed;
                }
            }
        }
    }

    /**
     * Отрисовка платформы
     * @param {CanvasRenderingContext2D} ctx - Контекст canvas
     */
    render(ctx) {
        const color = this.colors[this.type] || this.colors.normal;
        
        // Основной прямоугольник
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Обводка для лучшей видимости
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Дополнительная визуализация для движущихся платформ
        if (this.type === 'moving') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
        }
    }

    /**
     * Получение границ платформы для коллизий
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

