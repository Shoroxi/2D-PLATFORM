/**
 * Класс для работы со спрайт-листами (spritesheets)
 */
class SpriteSheet {
    constructor(imagePath, xmlPath) {
        this.image = new Image();
        this.image.src = imagePath;
        this.frames = {};
        this.loaded = false;
        this.xmlLoaded = false;
        
        // Загружаем XML файл с координатами спрайтов
        this.loadXML(xmlPath);
        
        this.image.onload = () => {
            this.loaded = true;
        };
        
        this.image.onerror = () => {
            Logger.warn(`Не удалось загрузить спрайт-лист: ${imagePath}`);
        };
    }

    /**
     * Загрузка XML файла с координатами
     */
    async loadXML(xmlPath) {
        try {
            const response = await fetch(xmlPath);
            const text = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');
            
            const subTextures = xmlDoc.getElementsByTagName('SubTexture');
            for (let i = 0; i < subTextures.length; i++) {
                const subTexture = subTextures[i];
                const name = subTexture.getAttribute('name');
                const x = parseInt(subTexture.getAttribute('x'));
                const y = parseInt(subTexture.getAttribute('y'));
                const width = parseInt(subTexture.getAttribute('width'));
                const height = parseInt(subTexture.getAttribute('height'));
                
                this.frames[name] = { x, y, width, height };
            }
            
            this.xmlLoaded = true;
        } catch (error) {
            Logger.warn(`Не удалось загрузить XML: ${xmlPath}`, error);
        }
    }

    /**
     * Получение координат кадра по имени
     */
    getFrame(name) {
        return this.frames[name] || null;
    }

    /**
     * Отрисовка спрайта из спрайт-листа
     */
    render(ctx, frameName, x, y, width, height, flip = false) {
        if (!this.loaded || !this.xmlLoaded) {
            // Placeholder
            ctx.fillStyle = '#8b0000';
            ctx.fillRect(x, y, width, height);
            return;
        }

        const frame = this.getFrame(frameName);
        if (!frame) {
            Logger.warn(`Кадр не найден: ${frameName}`);
            return;
        }

        ctx.save();
        
        if (flip) {
            ctx.scale(-1, 1);
            ctx.drawImage(
                this.image,
                frame.x, frame.y, frame.width, frame.height,
                -x - width, y, width, height
            );
        } else {
            ctx.drawImage(
                this.image,
                frame.x, frame.y, frame.width, frame.height,
                x, y, width, height
            );
        }
        
        ctx.restore();
    }

    /**
     * Проверка готовности
     */
    isReady() {
        return this.loaded && this.xmlLoaded;
    }
}

