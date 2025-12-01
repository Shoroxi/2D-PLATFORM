/**
 * Класс для загрузки отдельных спрайтов
 */
class SpriteLoader {
    constructor() {
        this.sprites = {};
        this.loadedCount = 0;
        this.totalCount = 0;
    }

    /**
     * Загрузка одного спрайта
     */
    async loadSprite(name, path) {
        return new Promise((resolve, reject) => {
            this.totalCount++;
            const img = new Image();
            img.onload = () => {
                this.sprites[name] = img;
                this.loadedCount++;
                resolve(img);
            };
            img.onerror = () => {
                Logger.warn(`Не удалось загрузить спрайт: ${path}`);
                reject(new Error(`Не удалось загрузить: ${path}`));
            };
            img.src = path;
        });
    }

    /**
     * Загрузка нескольких спрайтов
     */
    async loadSprites(spriteList) {
        const promises = spriteList.map(({ name, path }) => 
            this.loadSprite(name, path).catch(err => {
                Logger.warn(`Ошибка загрузки ${name}:`, err);
                return null;
            })
        );
        await Promise.all(promises);
    }

    /**
     * Получение спрайта по имени
     */
    getSprite(name) {
        return this.sprites[name] || null;
    }

    /**
     * Проверка, загружен ли спрайт
     */
    isLoaded(name) {
        return name in this.sprites && this.sprites[name] !== null;
    }

    /**
     * Отрисовка спрайта
     */
    render(ctx, name, x, y, width, height, flip = false) {
        const sprite = this.getSprite(name);
        if (!sprite) {
            // Fallback
            ctx.fillStyle = '#6a6a6a';
            ctx.fillRect(x, y, width, height);
            return;
        }

        ctx.save();
        if (flip) {
            ctx.scale(-1, 1);
            ctx.drawImage(sprite, -x - width, y, width, height);
        } else {
            ctx.drawImage(sprite, x, y, width, height);
        }
        ctx.restore();
    }
}

