/**
 * Редактор уровней
 */
class LevelEditor {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1200;
        this.canvas.height = 700;

        // Состояние редактора
        this.currentTool = 'platform';
        this.platforms = [];
        this.coins = [];
        this.enemies = [];
        this.start = { x: 50, y: this.canvas.height - 128 };
        this.goal = { x: 1100, y: this.canvas.height - 128 };
        
        // Для создания платформ
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        this.currentPlatform = null;

        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Кнопки инструментов
        document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTool = e.target.dataset.tool;
            });
        });

        // Кнопка очистки
        document.getElementById('clearBtn').addEventListener('click', () => this.clear());
        
        // Кнопка экспорта
        document.getElementById('exportBtn').addEventListener('click', () => this.exportLevel());
        
        // Кнопка импорта
        document.getElementById('importBtn').addEventListener('click', () => this.importLevel());
        
        // Кнопка тестирования
        document.getElementById('testBtn').addEventListener('click', () => this.testLevel());

        // События canvas
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('click', (e) => this.onClick(e));
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    onMouseDown(e) {
        if (this.currentTool === 'platform') {
            const pos = this.getMousePos(e);
            this.isDrawing = true;
            this.startX = pos.x;
            this.startY = pos.y;
            this.currentPlatform = {
                x: pos.x,
                y: pos.y,
                width: 0,
                height: 64
            };
        }
    }

    onMouseMove(e) {
        if (this.isDrawing && this.currentTool === 'platform' && this.currentPlatform) {
            const pos = this.getMousePos(e);
            this.currentPlatform.width = Math.max(64, pos.x - this.startX);
            this.currentPlatform.y = pos.y;
            this.render();
        }
    }

    onMouseUp(e) {
        if (this.isDrawing && this.currentTool === 'platform' && this.currentPlatform) {
            const pos = this.getMousePos(e);
            const width = Math.max(64, pos.x - this.startX);
            const height = 64;
            
            // Выравниваем по сетке 64x64
            const x = Math.floor(this.startX / 64) * 64;
            const y = Math.floor(pos.y / 64) * 64;
            
            this.platforms.push({
                x: x,
                y: y,
                width: Math.ceil(width / 64) * 64,
                height: height
            });
            
            this.isDrawing = false;
            this.currentPlatform = null;
            this.render();
        }
    }

    onClick(e) {
        const pos = this.getMousePos(e);
        
        // Выравниваем по сетке
        const gridX = Math.floor(pos.x / 64) * 64;
        const gridY = Math.floor(pos.y / 64) * 64;

        switch (this.currentTool) {
            case 'coin':
                this.coins.push({ x: gridX, y: gridY, width: 32, height: 32 });
                break;
            case 'enemy':
                this.enemies.push({ x: gridX, y: gridY });
                break;
            case 'start':
                this.start = { x: gridX, y: gridY };
                break;
            case 'goal':
                this.goal = { x: gridX, y: gridY };
                break;
            case 'delete':
                this.deleteAt(pos.x, pos.y);
                break;
        }
        
        this.render();
    }

    deleteAt(x, y) {
        // Удаляем платформы
        this.platforms = this.platforms.filter(p => 
            !(x >= p.x && x <= p.x + p.width && y >= p.y && y <= p.y + p.height)
        );
        
        // Удаляем монеты
        this.coins = this.coins.filter(c => 
            !(x >= c.x && x <= c.x + c.width && y >= c.y && y <= c.y + c.height)
        );
        
        // Удаляем врагов
        this.enemies = this.enemies.filter(e => 
            !(x >= e.x - 24 && x <= e.x + 24 && y >= e.y - 24 && y <= e.y + 24)
        );
    }

    render() {
        // Очистка
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Фон
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#98D8C8');
        gradient.addColorStop(1, '#6B8E23');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Сетка
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += 64) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += 64) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        // Рисуем платформы
        this.platforms.forEach(p => {
            this.ctx.fillStyle = '#4a2c2a';
            this.ctx.fillRect(p.x, p.y, p.width, p.height);
            this.ctx.strokeStyle = '#2a1a1a';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(p.x, p.y, p.width, p.height);
        });

        // Рисуем текущую платформу (при создании)
        if (this.currentPlatform) {
            this.ctx.fillStyle = 'rgba(74, 44, 42, 0.5)';
            this.ctx.fillRect(this.currentPlatform.x, this.currentPlatform.y, this.currentPlatform.width, this.currentPlatform.height);
            this.ctx.strokeStyle = '#ffd700';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(this.currentPlatform.x, this.currentPlatform.y, this.currentPlatform.width, this.currentPlatform.height);
        }

        // Рисуем монеты
        this.coins.forEach(c => {
            this.ctx.fillStyle = '#ffd700';
            this.ctx.beginPath();
            this.ctx.arc(c.x + c.width/2, c.y + c.height/2, c.width/2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = '#d4af37';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });

        // Рисуем врагов
        this.enemies.forEach(e => {
            this.ctx.fillStyle = '#8b0000';
            this.ctx.fillRect(e.x - 24, e.y - 24, 48, 48);
            this.ctx.strokeStyle = '#4a0000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(e.x - 24, e.y - 24, 48, 48);
        });

        // Рисуем старт
        this.ctx.fillStyle = '#4ade80';
        this.ctx.fillRect(this.start.x - 16, this.start.y - 16, 32, 32);
        this.ctx.strokeStyle = '#22c55e';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(this.start.x - 16, this.start.y - 16, 32, 32);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('S', this.start.x, this.start.y + 5);

        // Рисуем финиш
        this.ctx.fillStyle = '#8b0000';
        this.ctx.fillRect(this.goal.x - 25, this.goal.y - 25, 50, 50);
        this.ctx.strokeStyle = '#a00000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(this.goal.x - 25, this.goal.y - 25, 50, 50);
        this.ctx.fillStyle = '#d4af37';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText('⚡', this.goal.x, this.goal.y + 7);
    }

    clear() {
        if (confirm('Очистить весь уровень?')) {
            this.platforms = [];
            this.coins = [];
            this.enemies = [];
            this.start = { x: 50, y: this.canvas.height - 128 };
            this.goal = { x: 1100, y: this.canvas.height - 128 };
            this.render();
        }
    }

    exportLevel() {
        const level = {
            platforms: this.platforms.map(p => ({
                x: p.x,
                y: p.y,
                width: p.width,
                height: p.height
            })),
            coins: this.coins.map(c => ({
                x: c.x,
                y: c.y
            })),
            enemies: this.enemies.map(e => ({
                x: e.x,
                y: e.y
            })),
            startX: this.start.x,
            startY: this.start.y,
            goalX: this.goal.x,
            goalY: this.goal.y
        };

        const json = JSON.stringify(level, null, 2);
        document.getElementById('jsonOutput').value = json;
        
        // Копируем в буфер обмена
        navigator.clipboard.writeText(json).then(() => {
            alert('Уровень скопирован в буфер обмена!');
        });
    }

    importLevel() {
        const json = document.getElementById('jsonOutput').value;
        try {
            const level = JSON.parse(json);
            
            this.platforms = level.platforms || [];
            this.coins = level.coins || [];
            this.enemies = level.enemies || [];
            this.start = { x: level.startX || 50, y: level.startY || this.canvas.height - 128 };
            this.goal = { x: level.goalX || 1100, y: level.goalY || this.canvas.height - 128 };
            
            this.render();
            alert('Уровень загружен!');
        } catch (e) {
            alert('Ошибка загрузки уровня: ' + e.message);
        }
    }

    testLevel() {
        // Сохраняем уровень в localStorage
        const level = {
            platforms: this.platforms.map(p => ({
                x: p.x,
                y: p.y,
                width: p.width,
                height: p.height
            })),
            coins: this.coins.map(c => ({
                x: c.x,
                y: c.y
            })),
            enemies: this.enemies.map(e => ({
                x: e.x,
                y: e.y
            })),
            startX: this.start.x,
            startY: this.start.y,
            goalX: this.goal.x,
            goalY: this.goal.y
        };

        localStorage.setItem('editorLevel', JSON.stringify(level));
        window.open('index.html?testLevel=true', '_blank');
    }
}

// Инициализация редактора
window.addEventListener('DOMContentLoaded', () => {
    const editor = new LevelEditor('editorCanvas');
    
    // Активируем первую кнопку
    document.querySelector('.tool-btn[data-tool]').classList.add('active');
});


