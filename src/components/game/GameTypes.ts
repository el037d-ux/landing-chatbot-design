export const GENERATE_GAME_URL = "https://functions.poehali.dev/5626bab5-bf92-4e3d-9994-865dfeda70ec";

export const CLASS_OPTIONS = [
  "1 класс","2 класс","3 класс","4 класс","5 класс","6 класс","7 класс",
  "8 класс","9 класс","10 класс","11 класс","Студенты / взрослые",
];
export const DURATION_OPTIONS = ["10 мин","15 мин","20 мин","25 мин","30 мин","45 мин"];
export const SUBJECTS = ["Биология","История","Математика","Русский язык","Физика","Химия","Литература","География","Информатика","Английский язык"];
export const FORMAT_OPTIONS = ["Квиз","Командная настольная игра","Квест-станция","Ролевая симуляция","Цифровая игра","Без гаджетов"];
export const TECH_OPTIONS = ["Доска и маркеры","Можно распечатать","Проектор","Компьютеры у учеников","Нет техники"];
export const STUDENTS_OPTIONS = ["До 10","10–15","15–20","20–25","25–30","30+"];

export const STEPS = [
  { label: "Предмет и класс", icon: "BookOpen" },
  { label: "Тема и цель", icon: "Target" },
  { label: "Формат и время", icon: "Gamepad2" },
  { label: "Условия", icon: "Settings" },
];

export type GameMaterial = { type: string; content: string };
export type GameStep = { step: number; duration: string; action: string };

export type Game = {
  name: string;
  legend: string;
  type: string;
  duration: string;
  subject: string;
  grade: string;
  topic: string;
  goal: string;
  description: string;
  teams: string;
  materials: string;
  rules: string[];
  steps: GameStep[];
  scoring: string;
  game_materials: GameMaterial[];
  adaptation: string;
  digital_tools: string;
  teacher_tips: string[];
  variations: string;
};

export type GameForm = {
  subject: string;
  grade: string;
  topic: string;
  lesson_goal: string;
  game_format: string;
  duration: string;
  students_count: string;
  tech: string;
};

export function downloadGame(game: Game) {
  const sep = "=".repeat(60);
  const lines: string[] = [
    sep, `ИГРА: ${game.name}`, sep,
    `${game.legend}`, "",
    `Тип: ${game.type} | Предмет: ${game.subject} | Класс: ${game.grade}`,
    `Тема: ${game.topic} | Время: ${game.duration}`, "",
    "ЦЕЛЬ:", game.goal, "",
    "ОПИСАНИЕ:", game.description, "",
    "КОМАНДЫ / РОЛИ:", game.teams, "",
    sep, "МАТЕРИАЛЫ ДЛЯ ПОДГОТОВКИ:", sep, game.materials, "",
    sep, "ПРАВИЛА:", sep,
    ...game.rules.map((r, i) => `${i + 1}. ${r}`), "",
    sep, "ХОД ИГРЫ:", sep,
    ...game.steps.map(s => `Шаг ${s.step} (${s.duration}):\n${s.action}\n`),
    sep, "БАЛЛЫ И ПОБЕДА:", sep, game.scoring, "",
  ];
  if (game.game_materials?.length) {
    lines.push(sep, "ИГРОВЫЕ МАТЕРИАЛЫ (к печати):", sep);
    game.game_materials.forEach((m, i) => lines.push(`${i + 1}. [${m.type}]\n${m.content}\n`));
  }
  lines.push(sep, "АДАПТАЦИЯ:", sep, game.adaptation, "");
  if (game.digital_tools) lines.push("ЦИФРОВЫЕ ИНСТРУМЕНТЫ:", game.digital_tools, "");
  lines.push(sep, "ЛАЙФХАКИ УЧИТЕЛЮ:", sep, ...game.teacher_tips.map((t, i) => `${i + 1}. ${t}`), "");
  if (game.variations) lines.push(sep, "ВАРИАНТЫ:", sep, game.variations);

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `игра_${game.name.slice(0, 30)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
