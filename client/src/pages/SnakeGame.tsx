import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Pause,
  Play,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useInterval } from "@/lib/useInterval";

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 2;
const MIN_SPEED = 80;
const FOOD_EMOJIS = ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍒", "🍑", "🥭", "🍍"];
const HIGH_SCORE_KEY = "snakeHighScore";

type Point = { x: number; y: number };
type Food = Point & { emoji: string };
type GameStatus = "idle" | "playing" | "paused" | "gameover";

type ControlButtonProps = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
};

function ControlButton({ label, icon: Icon, onClick }: ControlButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="h-16 w-16 rounded-2xl border-2 border-b-4 bg-white transition-all active:translate-y-[2px] active:border-b-2"
      onClick={onClick}
      aria-label={label}
    >
      <Icon className="h-8 w-8" />
    </Button>
  );
}

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Food | null>({ x: 5, y: 5, emoji: "🍎" });
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [nextDirection, setNextDirection] = useState<Point>(INITIAL_DIRECTION);
  const [status, setStatus] = useState<GameStatus>("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const generateFood = useCallback((currentSnake: Point[]): Food | null => {
    const occupied = new Set(currentSnake.map(({ x, y }) => `${x},${y}`));
    const available: Point[] = [];

    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        if (!occupied.has(`${x},${y}`)) available.push({ x, y });
      }
    }

    if (available.length === 0) return null;

    const point = available[Math.floor(Math.random() * available.length)];
    return {
      ...point,
      emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
    };
  }, []);

  const finishGame = (finalScore = score) => {
    setStatus("gameover");
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem(HIGH_SCORE_KEY, finalScore.toString());
    }
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setNextDirection(INITIAL_DIRECTION);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setStatus("playing");
    setFood(generateFood(INITIAL_SNAKE));
  };

  const gameLoop = () => {
    const head = snake[0];
    const newHead = {
      x: head.x + nextDirection.x,
      y: head.y + nextDirection.y,
    };

    if (
      newHead.x < 0 ||
      newHead.x >= GRID_SIZE ||
      newHead.y < 0 ||
      newHead.y >= GRID_SIZE
    ) {
      finishGame();
      return;
    }

    const isEating = food !== null && newHead.x === food.x && newHead.y === food.y;
    const body = isEating ? snake : snake.slice(0, -1);
    if (body.some(({ x, y }) => x === newHead.x && y === newHead.y)) {
      finishGame();
      return;
    }

    const newSnake = [newHead, ...snake];
    setDirection(nextDirection);

    if (isEating) {
      const nextScore = score + 1;
      const nextFood = generateFood(newSnake);
      setScore(nextScore);
      setSpeed((currentSpeed) => Math.max(MIN_SPEED, currentSpeed - SPEED_INCREMENT));
      setFood(nextFood);

      if (nextScore % 5 === 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#A855F7", "#EC4899", "#F59E0B"],
        });
      }

      if (nextFood === null) {
        setSnake(newSnake);
        finishGame(nextScore);
        return;
      }
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  useEffect(() => {
    const savedScore = localStorage.getItem(HIGH_SCORE_KEY);
    if (savedScore !== null) {
      const parsedScore = Number(savedScore);
      if (Number.isSafeInteger(parsedScore) && parsedScore >= 0) {
        setHighScore(parsedScore);
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (status !== "playing") return;

      const directions: Record<string, Point> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      };
      const requestedDirection = directions[event.key];
      if (!requestedDirection) return;

      event.preventDefault();
      if (
        requestedDirection.x !== -direction.x ||
        requestedDirection.y !== -direction.y
      ) {
        setNextDirection(requestedDirection);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction, status]);

  useInterval(gameLoop, status === "playing" ? speed : null);

  const getCellContent = (x: number, y: number) => {
    if (snake[0].x === x && snake[0].y === y) {
      if (status === "gameover") return "😵";
      if (food && Math.abs(x - food.x) + Math.abs(y - food.y) < 2) return "😮";
      return "😳";
    }

    if (snake.some((segment) => segment.x === x && segment.y === y)) return "🟢";
    if (food?.x === x && food.y === y) return food.emoji;
    return null;
  };

  const changeDirection = (requestedDirection: Point) => {
    if (
      requestedDirection.x !== -direction.x ||
      requestedDirection.y !== -direction.y
    ) {
      setNextDirection(requestedDirection);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4 font-display">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-20" />

      <header className="z-10 mb-6 text-center">
        <h1 className="mb-2 text-5xl font-extrabold text-primary drop-shadow-sm md:text-6xl">
          Snakemoji
        </h1>
        <div className="flex items-center justify-center gap-8 text-xl font-bold text-muted-foreground">
          <div className="flex flex-col items-center">
            <span className="text-sm uppercase tracking-wider opacity-70">Score</span>
            <span className="text-3xl text-foreground">{score}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm uppercase tracking-wider opacity-70">High Score</span>
            <span className="text-3xl text-accent">{highScore}</span>
          </div>
        </div>
      </header>

      <Card className="relative z-10 rounded-xl border-4 border-primary/20 bg-white/80 p-1 shadow-xl backdrop-blur-sm">
        <div
          className="relative grid aspect-square overflow-hidden rounded-lg bg-yellow-50/50"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            width: "min(90vw, 500px)",
          }}
          role="grid"
          aria-label="Snake game board"
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);
            const content = getCellContent(x, y);
            const isSnake = content === "🟢" || content === "😳" || content === "😮" || content === "😵";

            return (
              <div
                key={index}
                className={`flex select-none items-center justify-center text-lg leading-none md:text-2xl ${
                  (x + y) % 2 === 0 ? "bg-black/[0.02]" : ""
                }`}
                role="gridcell"
              >
                {content && (
                  <motion.span
                    initial={isSnake ? { scale: 0.8 } : { scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    {content}
                  </motion.span>
                )}
              </div>
            );
          })}

          <AnimatePresence>
            {status === "idle" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white backdrop-blur-[2px]"
              >
                <Button
                  size="lg"
                  onClick={resetGame}
                  className="rounded-2xl border-b-4 border-primary-foreground/20 px-10 py-8 text-2xl shadow-lg transition-transform hover:scale-105"
                >
                  <Play className="h-8 w-8" fill="currentColor" />
                  Start Game
                </Button>
              </motion.div>
            )}

            {status === "gameover" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-6 text-center text-white backdrop-blur-[2px]"
              >
                <div className="mb-4 text-6xl">💀</div>
                <h2 className="mb-2 text-4xl font-bold">Game Over!</h2>
                <p className="mb-8 text-xl opacity-90">You scored {score} points</p>
                <Button
                  size="lg"
                  onClick={resetGame}
                  className="rounded-xl border-b-4 border-primary-foreground/20 px-8 py-6 text-xl shadow-lg transition-transform hover:scale-105"
                >
                  <RotateCcw className="h-6 w-6" />
                  Play Again
                </Button>
              </motion.div>
            )}

            {status === "paused" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]"
              >
                <div className="flex items-center gap-3 rounded-full bg-white px-8 py-4 shadow-lg">
                  <Pause className="h-6 w-6 text-primary" fill="currentColor" />
                  <span className="text-xl font-bold text-foreground">Paused</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      <div className="z-10 mt-8 flex flex-col items-center gap-4">
        <div className="flex gap-4">
          {status === "playing" && (
            <Button
              variant="ghost"
              onClick={() => setStatus("paused")}
              className="rounded-full"
              aria-label="Pause game"
            >
              <Pause className="h-6 w-6" />
            </Button>
          )}
          {status === "paused" && (
            <Button
              variant="ghost"
              onClick={() => setStatus("playing")}
              className="rounded-full"
              aria-label="Resume game"
            >
              <Play className="h-6 w-6" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div />
          <ControlButton
            label="Move up"
            icon={ArrowUp}
            onClick={() => changeDirection({ x: 0, y: -1 })}
          />
          <div />
          <ControlButton
            label="Move left"
            icon={ArrowLeft}
            onClick={() => changeDirection({ x: -1, y: 0 })}
          />
          <ControlButton
            label="Move down"
            icon={ArrowDown}
            onClick={() => changeDirection({ x: 0, y: 1 })}
          />
          <ControlButton
            label="Move right"
            icon={ArrowRight}
            onClick={() => changeDirection({ x: 1, y: 0 })}
          />
        </div>

        <p className="mt-4 text-sm text-muted-foreground opacity-60">
          Use <kbd className="rounded border bg-white px-2 py-1 shadow-sm">Arrow Keys</kbd> or buttons
        </p>
      </div>
    </main>
  );
}
