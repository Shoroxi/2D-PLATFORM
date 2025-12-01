/**
 * Главный файл инициализации игры
 */
let game;

// Инициализация игры после загрузки страницы
window.addEventListener('DOMContentLoaded', () => {
    game = new Game('gameCanvas');
    
    // Автоматический запуск игры (можно закомментировать)
    // game.start();
});

