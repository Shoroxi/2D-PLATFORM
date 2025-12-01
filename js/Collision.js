/**
 * Система обработки коллизий
 */
class Collision {
    /**
     * Проверка коллизии между двумя прямоугольными объектами
     * @param {Object} obj1 - Первый объект (должен иметь getBounds())
     * @param {Object} obj2 - Второй объект (должен иметь getBounds())
     * @returns {Object|null} - Информация о коллизии или null
     */
    static check(obj1, obj2) {
        const bounds1 = obj1.getBounds();
        const bounds2 = obj2.getBounds();

        // Проверка пересечения прямоугольников
        if (bounds1.x < bounds2.x + bounds2.width &&
            bounds1.x + bounds1.width > bounds2.x &&
            bounds1.y < bounds2.y + bounds2.height &&
            bounds1.y + bounds1.height > bounds2.y) {
            
            // Определяем сторону коллизии
            const overlapX = Math.min(
                bounds1.x + bounds1.width - bounds2.x,
                bounds2.x + bounds2.width - bounds1.x
            );
            const overlapY = Math.min(
                bounds1.y + bounds1.height - bounds2.y,
                bounds2.y + bounds2.height - bounds1.y
            );

            let side;
            if (overlapY < overlapX) {
                // Вертикальная коллизия
                if (bounds1.y < bounds2.y) {
                    side = 'top'; // obj1 сверху obj2
                } else {
                    side = 'bottom'; // obj1 снизу obj2
                }
            } else {
                // Горизонтальная коллизия
                if (bounds1.x < bounds2.x) {
                    side = 'left'; // obj1 слева от obj2
                } else {
                    side = 'right'; // obj1 справа от obj2
                }
            }

            return {
                collided: true,
                side: side,
                overlapX: overlapX,
                overlapY: overlapY
            };
        }

        return null;
    }

    /**
     * Проверка, находится ли точка внутри прямоугольника
     * @param {number} x - X координата точки
     * @param {number} y - Y координата точки
     * @param {Object} bounds - Границы объекта
     * @returns {boolean}
     */
    static pointInRect(x, y, bounds) {
        return x >= bounds.x &&
               x <= bounds.x + bounds.width &&
               y >= bounds.y &&
               y <= bounds.y + bounds.height;
    }

    /**
     * Проверка, находится ли объект полностью внутри другого объекта
     * @param {Object} inner - Внутренний объект
     * @param {Object} outer - Внешний объект
     * @returns {boolean}
     */
    static isInside(inner, outer) {
        const innerBounds = inner.getBounds();
        const outerBounds = outer.getBounds();

        return innerBounds.x >= outerBounds.x &&
               innerBounds.y >= outerBounds.y &&
               innerBounds.x + innerBounds.width <= outerBounds.x + outerBounds.width &&
               innerBounds.y + innerBounds.height <= outerBounds.y + outerBounds.height;
    }
}

