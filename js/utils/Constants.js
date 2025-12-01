/**
 * Константы игры
 */
class Constants {
    // Размеры canvas
    static CANVAS_WIDTH = 1200;
    static CANVAS_HEIGHT = 700;
    
    // Размеры спрайтов
    static TILE_SIZE = 64;
    static PLAYER_WIDTH = 64;
    static PLAYER_HEIGHT = 64;
    static ENEMY_SIZE = 48;
    static COIN_SIZE = 32;
    
    // Физика игрока
    static PLAYER_SPEED = 5;
    static PLAYER_JUMP_POWER = -15;
    static PLAYER_GRAVITY = 0.8;
    static PLAYER_FRICTION = 0.85;
    static PLAYER_MAX_VELOCITY_Y = 20;
    
    // Физика врагов
    static ENEMY_SPEED = 1.5;
    static ENEMY_GRAVITY = 0.8;
    static ENEMY_PATROL_DISTANCE = 120;
    
    // Анимации
    static ANIMATION_SPEED_PLAYER = 0.075;
    static ANIMATION_SPEED_ENEMY = 0.05;
    static ANIMATION_THRESHOLD_PLAYER = 0.5;
    static ANIMATION_THRESHOLD_ENEMY = 0.6;
    
    // Игровые параметры
    static INITIAL_LIVES = 3;
    static COIN_SCORE = 10;
    static ENEMY_SCORE = 20;
    static LEVEL_BONUS_MULTIPLIER = 100;
    
    // Состояния игры
    static GAME_STATE = {
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'gameOver',
        LEVEL_COMPLETE: 'levelComplete'
    };
}


