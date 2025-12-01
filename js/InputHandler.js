/**
 * Класс для обработки пользовательского ввода
 */
class InputHandler {
    constructor() {
        this.keys = {};
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Обработка нажатий клавиш
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            // Предотвращаем стандартное поведение для игровых клавиш
            if (['a', 'd', 'w', ' ', 'arrowleft', 'arrowright', 'arrowup'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Обработка потери фокуса (отпускаем все клавиши)
        window.addEventListener('blur', () => {
            this.keys = {};
        });
    }

    /**
     * Проверяет, нажата ли клавиша
     * @param {string} key - Клавиша для проверки
     * @returns {boolean}
     */
    isPressed(key) {
        const keyLower = key.toLowerCase();
        // Поддержка альтернативных клавиш
        if (keyLower === 'a' || keyLower === 'arrowleft') {
            return this.keys['a'] || this.keys['arrowleft'];
        }
        if (keyLower === 'd' || keyLower === 'arrowright') {
            return this.keys['d'] || this.keys['arrowright'];
        }
        if (keyLower === 'w' || keyLower === ' ' || keyLower === 'arrowup') {
            return this.keys['w'] || this.keys[' '] || this.keys['arrowup'];
        }
        return this.keys[keyLower] || false;
    }

    /**
     * Проверяет, нажата ли клавиша для движения влево
     */
    isLeftPressed() {
        return this.isPressed('a') || this.isPressed('arrowleft');
    }

    /**
     * Проверяет, нажата ли клавиша для движения вправо
     */
    isRightPressed() {
        return this.isPressed('d') || this.isPressed('arrowright');
    }

    /**
     * Проверяет, нажата ли клавиша для прыжка
     */
    isJumpPressed() {
        return this.isPressed('w') || this.isPressed(' ') || this.isPressed('arrowup');
    }
}

