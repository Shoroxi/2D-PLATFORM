/**
 * Класс для параллакс-фона
 */
class ParallaxBackground {
    constructor(canvas, spriteLoader) {
        this.canvas = canvas;
        this.spriteLoader = spriteLoader;
        this.layers = [];
        this.cameraX = 0;
    }

    /**
     * Добавление слоя фона
     * @param {string} spriteName - Имя спрайта
     * @param {number} speed - Скорость параллакса (0-1, где 1 = движется с камерой)
     * @param {number} y - Y позиция слоя
     * @param {number} height - Высота слоя
     */
    addLayer(spriteName, speed, y, height) {
        this.layers.push({
            spriteName,
            speed,
            y,
            height,
            offsetX: 0
        });
    }

    /**
     * Обновление позиции камеры
     * @param {number} playerX - X позиция игрока
     */
    update(playerX) {
        // Обновляем смещение для каждого слоя
        this.layers.forEach(layer => {
            layer.offsetX = (playerX * layer.speed) % this.canvas.width;
        });
    }

    /**
     * Отрисовка фона
     * @param {CanvasRenderingContext2D} ctx - Контекст canvas
     */
    render(ctx) {
        // Рисуем небо (реалистичный градиент)
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        skyGradient.addColorStop(0, '#87CEEB'); // Светло-голубое небо
        skyGradient.addColorStop(0.3, '#B0E0E6'); // Голубое
        skyGradient.addColorStop(0.6, '#98D8C8'); // Светло-зеленое
        skyGradient.addColorStop(1, '#6B8E23'); // Зеленая трава внизу
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем облака (если есть спрайт)
        if (this.spriteLoader && this.spriteLoader.isLoaded('background_solid_sky')) {
            const cloudHeight = 150;
            const startX = -this.layers.find(l => l.spriteName === 'background_clouds')?.offsetX || 0;
            this.spriteLoader.render(ctx, 'background_solid_sky', startX, 0, this.canvas.width, cloudHeight);
            this.spriteLoader.render(ctx, 'background_solid_sky', startX + this.canvas.width, 0, this.canvas.width, cloudHeight);
            this.spriteLoader.render(ctx, 'background_solid_sky', startX - this.canvas.width, 0, this.canvas.width, cloudHeight);
        }

        // Рисуем слои фона
        this.layers.forEach(layer => {
            if (this.spriteLoader && this.spriteLoader.isLoaded(layer.spriteName)) {
                // Рисуем несколько копий для бесшовного скролла
                const spriteWidth = this.canvas.width;
                const startX = -layer.offsetX;
                
                // Рисуем основную копию
                this.spriteLoader.render(
                    ctx,
                    layer.spriteName,
                    startX,
                    layer.y,
                    spriteWidth,
                    layer.height
                );
                
                // Рисуем копию справа (для бесшовного скролла)
                this.spriteLoader.render(
                    ctx,
                    layer.spriteName,
                    startX + spriteWidth,
                    layer.y,
                    spriteWidth,
                    layer.height
                );
                
                // Рисуем копию слева (для бесшовного скролла)
                this.spriteLoader.render(
                    ctx,
                    layer.spriteName,
                    startX - spriteWidth,
                    layer.y,
                    spriteWidth,
                    layer.height
                );
            } else {
                // Fallback - простой градиент
                const gradient = ctx.createLinearGradient(0, layer.y, 0, layer.y + layer.height);
                gradient.addColorStop(0, 'rgba(100, 100, 120, 0.3)');
                gradient.addColorStop(1, 'rgba(80, 80, 100, 0.5)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, layer.y, this.canvas.width, layer.height);
            }
        });
    }
}

