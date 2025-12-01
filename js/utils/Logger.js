/**
 * Система логирования (можно отключить в продакшене)
 */
class Logger {
    static enabled = true; // Установить false для продакшена
    
    static log(...args) {
        if (this.enabled) {
            console.log('[GAME]', ...args);
        }
    }
    
    static warn(...args) {
        if (this.enabled) {
            console.warn('[GAME]', ...args);
        }
    }
    
    static error(...args) {
        // Ошибки всегда логируем
        console.error('[GAME ERROR]', ...args);
    }
}

