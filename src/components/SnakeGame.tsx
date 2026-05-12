import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart } from 'lucide-react';

type Point = { x: number; y: number };

const INITIAL_SPEED = 150;
const MIN_SPEED = 50;

const SnakeGame: React.FC = () => {
    const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'>('IDLE');
    const [snake, setSnake] = useState<Point[]>([{ x: 20, y: 15 }, { x: 19, y: 15 }, { x: 18, y: 15 }]);
    const [food, setFood] = useState<Point>({ x: 30, y: 10 });
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [speed, setSpeed] = useState(INITIAL_SPEED);
    const snakeDirection = useRef<Point>({ x: 1, y: 0 });

    const generateFood = useCallback((): Point => ({
        x: Math.floor(Math.random() * 40),
        y: Math.floor(Math.random() * 30),
    }), []);

    const resetSnake = () => {
        setSnake([{ x: 20, y: 15 }, { x: 19, y: 15 }, { x: 18, y: 15 }]);
        snakeDirection.current = { x: 1, y: 0 };
    };

    const resetGame = () => {
        resetSnake();
        setFood(generateFood());
        setScore(0);
        setLives(3);
        setSpeed(INITIAL_SPEED);
        setGameState('PLAYING');
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === ' ') {
                e.preventDefault();
                if (gameState === 'IDLE' || gameState === 'GAMEOVER') resetGame();
                return;
            }
            if (e.key.toLowerCase() === 'p') {
                if (gameState === 'PLAYING') setGameState('PAUSED');
                else if (gameState === 'PAUSED') setGameState('PLAYING');
                return;
            }
            if (e.key.toLowerCase() === 'r') {
                if (gameState === 'GAMEOVER') resetGame();
                return;
            }
            
            if (gameState !== 'PLAYING') return;

            switch (e.key) {
                case 'ArrowUp': if (snakeDirection.current.y !== 1) snakeDirection.current = { x: 0, y: -1 }; break;
                case 'ArrowDown': if (snakeDirection.current.y !== -1) snakeDirection.current = { x: 0, y: 1 }; break;
                case 'ArrowLeft': if (snakeDirection.current.x !== 1) snakeDirection.current = { x: -1, y: 0 }; break;
                case 'ArrowRight': if (snakeDirection.current.x !== -1) snakeDirection.current = { x: 1, y: 0 }; break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState]);

    useEffect(() => {
        if (gameState !== 'PLAYING') return;

        const moveSnake = () => {
            setSnake((prev) => {
                const newSnake = [...prev];
                const head = { x: newSnake[0].x + snakeDirection.current.x, y: newSnake[0].y + snakeDirection.current.y };

                if (head.x < 0 || head.x >= 40 || head.y < 0 || head.y >= 30 || 
                    newSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
                    
                    if (lives > 1) {
                        setLives(l => l - 1);
                        resetSnake();
                        return prev;
                    } else {
                        setGameState('GAMEOVER');
                        return prev;
                    }
                }

                newSnake.unshift(head);

                if (head.x === food.x && head.y === food.y) {
                    setScore(s => s + 10);
                    setSpeed(s => Math.max(MIN_SPEED, s - 2));
                    setFood(generateFood());
                } else {
                    newSnake.pop();
                }

                return newSnake;
            });
        };

        const interval = setInterval(moveSnake, speed);
        return () => clearInterval(interval);
    }, [gameState, speed, food, lives, generateFood]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] text-[#f8fafc] font-mono p-4">
            <div className="w-[1024px]">
                <header className="flex justify-between items-end mb-5 border-b-2 border-[#1e293b] pb-2">
                    <div>
                        <h1 className="text-3xl tracking-[4px] text-[#22c55e] [text-shadow:0_0_10px_rgba(34,197,94,0.5)]">NEON_SNAKE_V1.0</h1>
                        <p className="text-[#475569] text-xs mt-1">Vite + React + TS Engine Running...</p>
                    </div>
                    <div className="flex gap-10">
                        <div className="text-right">
                            <div className="text-[12px] text-[#64748b] uppercase mb-1">Lives</div>
                            <div className="flex gap-1 text-[#ef4444]">
                                {[...Array(Math.max(0, lives))].map((_, i) => <Heart key={i} size={18} fill="currentColor" />)}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[12px] text-[#64748b] uppercase mb-1">Score</div>
                            <div className="text-2xl font-bold">{score.toString().padStart(5, '0')}</div>
                        </div>
                    </div>
                </header>

                <div 
                    className="relative w-[800px] h-[600px] bg-[#0f172a] border-[4px] border-[#1e293b] mx-auto [box-shadow:inset_0_0_40px_rgba(0,0,0,0.8),_0_0_20px_rgba(34,197,94,0.1)] grid"
                    style={{ gridTemplateColumns: 'repeat(40, 1fr)', gridTemplateRows: 'repeat(30, 1fr)' }}
                >
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    
                    {snake.map((segment, i) => (
                        <div
                            key={i}
                            className={`snake-segment ${i === 0 ? 'snake-head' : ''} bg-[#22c55e] border border-[#064e3b] rounded-sm [box-shadow:0_0_8px_rgba(34,197,94,0.6)]`}
                            style={{ gridArea: `${segment.y + 1} / ${segment.x + 1}` }}
                        />
                    ))}
                    
                    <div
                        className="food bg-[#ef4444] rounded-full [box-shadow:0_0_12px_rgba(239,68,68,0.8)]"
                        style={{ gridArea: `${food.y + 1} / ${food.x + 1}` }}
                    />

                    {gameState !== 'PLAYING' && (
                        <div className="absolute inset-0 bg-[#020617]/85 flex flex-col items-center justify-center z-50 border border-[#ef4444]/30">
                            {gameState === 'IDLE' && (
                                <button onClick={() => setGameState('PLAYING')} className="px-8 py-3 bg-[#1e293b] border border-[#334155] rounded text-[#f8fafc] hover:bg-[#334155] tracking-widest">
                                    PRESS SPACE TO START
                                </button>
                            )}
                            {gameState === 'PAUSED' && <h2 className="text-5xl font-black text-yellow-500 tracking-[8px]">PAUSED</h2>}
                            {gameState === 'GAMEOVER' && (
                                <>
                                    <h2 className="text-5xl font-black text-[#ef4444] mb-2 tracking-[8px] [text-shadow:0_0_20px_rgba(239,68,68,0.5)]">GAME OVER</h2>
                                    <p className="text-xl text-[#94a3b8] mb-8">FINAL SCORE: {score}</p>
                                    <button onClick={resetGame} className="px-6 py-2 bg-[#1e293b] border border-[#334155] rounded text-[#94a3b8] hover:bg-[#334155] tracking-widest text-sm">
                                        PRESS SPACE TO RESTART
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
                <div className="mt-5 flex justify-center gap-10 text-[#475569] text-xs">
                    <div className="flex items-center gap-2"><span className="bg-[#1e293b] border border-[#334155] p-1 rounded text-[#94a3b8]">↑↓←→</span> MOVE</div>
                    <div className="flex items-center gap-2"><span className="bg-[#1e293b] border border-[#334155] p-1 rounded text-[#94a3b8]">P</span> PAUSE</div>
                    <div className="flex items-center gap-2"><span className="bg-[#1e293b] border border-[#334155] p-1 rounded text-[#94a3b8]">R</span> RESET</div>
                </div>
            </div>
        </div>
    );
};

export default SnakeGame;
