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
        
        // Цвет в зависимости от типа (Dark Souls стиль)
        this.colors = {
            normal: '#4a2c2a',
            moving: '#6a3c3a',
            breakable: '#8b0000'
        };
        
        // Спрайты (опционально)
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
     * @param {number} deltaTime - Время с последнего кадра в секундах
     */
    update(deltaTime = 0.016) {
        if (this.type === 'moving') {
            const normalizedDelta = deltaTime * 60; // Нормализуем к 60 FPS
            if (this.direction === 'horizontal') {
                this.x += this.velocityX * normalizedDelta;
                
                // Проверяем границы движения
                if (this.x >= this.startX + this.moveDistance) {
                    this.x = this.startX + this.moveDistance;
                    this.velocityX = -this.moveSpeed;
                } else if (this.x <= this.startX) {
                    this.x = this.startX;
                    this.velocityX = this.moveSpeed;
                }
            } else {
                this.y += this.velocityY * normalizedDelta;
                
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
        // Если используется спрайт
        if (this.useSprite && this.spriteLoader) {
            const tileSize = 64; // Размер спрайта тайла
            const tilesX = Math.ceil(this.width / tileSize);
            const tilesY = Math.ceil(this.height / tileSize);
            
            for (let ty = 0; ty < tilesY; ty++) {
                for (let tx = 0; tx < tilesX; tx++) {
                    let spriteName = 'terrain_stone_block';
                    
                    // Определяем тип тайла
                    if (ty === 0 && tilesY > 1) {
                        if (tx === 0) spriteName = 'terrain_stone_block_top_left';
                        else if (tx === tilesX - 1) spriteName = 'terrain_stone_block_top_right';
                        else spriteName = 'terrain_stone_block_top';
                    } else if (ty === tilesY - 1 && tilesY > 1) {
                        if (tx === 0) spriteName = 'terrain_stone_block_bottom_left';
                        else if (tx === tilesX - 1) spriteName = 'terrain_stone_block_bottom_right';
                        else spriteName = 'terrain_stone_block_bottom';
                    } else {
                        if (tx === 0) spriteName = 'terrain_stone_block_left';
                        else if (tx === tilesX - 1) spriteName = 'terrain_stone_block_right';
                        else spriteName = 'terrain_stone_block_center';
                    }
                    
                    if (this.spriteLoader.isLoaded(spriteName)) {
                        this.spriteLoader.render(
                            ctx,
                            spriteName,
                            this.x + tx * tileSize,
                            this.y + ty * tileSize,
                            tileSize,
                            tileSize
                        );
                    }
                }
            }
            return;
        }

        // Отрисовка по умолчанию (Dark Souls стиль)
        const color = this.colors[this.type] || this.colors.normal;
        
        // Основной прямоугольник
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Темная обводка
        ctx.strokeStyle = '#2a1a1a';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Внутренняя тень
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        
        // Светлая линия сверху (для объема)
        ctx.strokeStyle = 'rgba(139, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.stroke();
        
        // Дополнительная визуализация для движущихся платформ
        if (this.type === 'moving') {
            ctx.fillStyle = 'rgba(139, 0, 0, 0.2)';
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

