/**
 * Класс для работы со спрайтами
 */
class Sprite {
    constructor(imagePath, frameWidth, frameHeight, frames = 1) {
        this.image = new Image();
        this.image.src = imagePath;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.frames = frames;
        this.currentFrame = 0;
        this.frameIndex = 0;
        this.animationSpeed = 0.2; // Скорость анимации
        this.loaded = false;
        
        // Обработка загрузки изображения
        this.image.onload = () => {
            this.loaded = true;
        };
        
        this.image.onerror = () => {
            Logger.warn(`Не удалось загрузить спрайт: ${imagePath}`);
            this.loaded = false;
        };
    }

    /**
     * Обновление анимации
     */
    update() {
        if (this.frames > 1) {
            this.frameIndex += this.animationSpeed;
            if (this.frameIndex >= this.frames) {
                this.frameIndex = 0;
            }
            this.currentFrame = Math.floor(this.frameIndex);
        }
    }

    /**
     * Отрисовка спрайта
     * @param {CanvasRenderingContext2D} ctx - Контекст canvas
     * @param {number} x - X координата
     * @param {number} y - Y координата
     * @param {number} width - Ширина отрисовки
     * @param {number} height - Высота отрисовки
     * @param {boolean} flip - Отразить по горизонтали
     */
    render(ctx, x, y, width, height, flip = false) {
        if (!this.loaded) {
            // Если спрайт не загружен, рисуем placeholder
            ctx.fillStyle = '#ff6b6b';
            ctx.fillRect(x, y, width, height);
            return;
        }

        const sourceX = this.currentFrame * this.frameWidth;
        const sourceY = 0;

        ctx.save();
        
        if (flip) {
            ctx.scale(-1, 1);
            ctx.drawImage(
                this.image,
                sourceX, sourceY, this.frameWidth, this.frameHeight,
                -x - width, y, width, height
            );
        } else {
            ctx.drawImage(
                this.image,
                sourceX, sourceY, this.frameWidth, this.frameHeight,
                x, y, width, height
            );
        }
        
        ctx.restore();
    }

    /**
     * Установка скорости анимации
     * @param {number} speed - Скорость анимации
     */
    setAnimationSpeed(speed) {
        this.animationSpeed = speed;
    }
}

/**
 * Менеджер спрайтов для загрузки и хранения всех спрайтов
 */
class SpriteManager {
    constructor() {
        this.sprites = {};
        this.loadedCount = 0;
        this.totalCount = 0;
    }

    /**
     * Загрузка спрайта
     * @param {string} name - Имя спрайта
     * @param {string} path - Путь к изображению
     * @param {number} frameWidth - Ширина кадра
     * @param {number} frameHeight - Высота кадра
     * @param {number} frames - Количество кадров
     * @returns {Promise}
     */
    loadSprite(name, path, frameWidth, frameHeight, frames = 1) {
        return new Promise((resolve, reject) => {
            this.totalCount++;
            const sprite = new Sprite(path, frameWidth, frameHeight, frames);
            
            sprite.image.onload = () => {
                sprite.loaded = true;
                this.loadedCount++;
                this.sprites[name] = sprite;
                resolve(sprite);
            };
            
            sprite.image.onerror = () => {
                reject(new Error(`Не удалось загрузить спрайт: ${path}`));
            };
        });
    }

    /**
     * Получение спрайта по имени
     * @param {string} name - Имя спрайта
     * @returns {Sprite}
     */
    getSprite(name) {
        return this.sprites[name];
    }

    /**
     * Проверка, все ли спрайты загружены
     * @returns {boolean}
     */
    allLoaded() {
        return this.loadedCount === this.totalCount && this.totalCount > 0;
    }
}

