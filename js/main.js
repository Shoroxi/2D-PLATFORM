/**
 * Главный файл инициализации игры
 */
let game;

// Инициализация игры после загрузки страницы
window.addEventListener('DOMContentLoaded', () => {
    try {
        game = new Game('gameCanvas');
        Logger.log('Игра инициализирована успешно');
    } catch (error) {
        Logger.error('Критическая ошибка инициализации игры:', error);
        // Показываем сообщение об ошибке пользователю
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; 
                        background: #1a1a1a; color: #ff6b6b; font-family: Arial; text-align: center; padding: 20px;">
                <div>
                    <h1>Ошибка загрузки игры</h1>
                    <p>${error.message}</p>
                    <p style="font-size: 12px; color: #888;">Проверьте консоль для подробностей</p>
                </div>
            </div>
        `;
    }
});

