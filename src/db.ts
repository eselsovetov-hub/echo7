import { CONFIG } from './config';

// Seeded random
class SeededRandom {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (this.seed >>> 0) / 0xFFFFFFFF;
  }
  pick<T>(arr: T[]): T { return arr[Math.floor(this.next() * arr.length)]; }
  int(min: number, max: number): number { return min + Math.floor(this.next() * (max - min + 1)); }
}

const SECTORS = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron'];
const CLEARANCES = ['Basic', 'Advanced', 'Omega'];
const STATUSES = ['active', 'missing', 'deceased'];
const ROLES = ['Scout', 'Technician', 'Analyst', 'Engineer', 'Medic', 'Operator', 'Guard', 'Biologist'];
const FIRST_NAMES = ['Viktor', 'Alexei', 'Ivan', 'Pavel', 'Dmitri', 'Sergei', 'Nikolai', 'Andrei', 'Mikhail', 'Oleg', 'Boris', 'Yuri', 'Vladimir', 'Petr', 'Grigori'];
const LAST_NAMES = ['Orel', 'Vogel', 'Kraus', 'Weber', 'Fischer', 'Mueller', 'Schneider', 'Becker', 'Hoffmann', 'Schwarz', 'Koch', 'Richter', 'Wolf', 'Klein', 'Neumann'];

export interface Employee {
  id: number;
  name: string;
  password: string;
  hiring_from: string;
  role: string;
  sector: string;
  clearance: string;
  status: string;
}

export interface Note {
  id: number;
  note: string;
}

function generatePassword(rng: SeededRandom): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let p = '';
  for (let i = 0; i < 8; i++) p += chars[Math.floor(rng.next() * chars.length)];
  return p;
}

function generateDate(rng: SeededRandom): string {
  const year = 2014 + rng.int(0, 8);
  const month = String(rng.int(1, 12)).padStart(2, '0');
  const day = String(rng.int(1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateDatabase(): { employees: Employee[]; notes: Note[] } {
  const rng = new SeededRandom(7);
  const employees: Employee[] = [];
  const notes: Note[] = [];

  // Generate 150 employees
  // First, ensure target employee at id 87
  const targetIdx = 86; // 0-indexed for id 87

  for (let i = 0; i < 150; i++) {
    const id = i + 1;
    if (id === 87) {
      employees.push({
        id: 87,
        name: CONFIG.target.name,
        password: CONFIG.target.password,
        hiring_from: CONFIG.target.hiringFrom,
        role: CONFIG.target.role,
        sector: CONFIG.target.sector,
        clearance: CONFIG.target.clearance,
        status: CONFIG.target.status,
      });
    } else {
      const firstName = rng.pick(FIRST_NAMES);
      const lastName = rng.pick(LAST_NAMES);
      const sector = rng.pick(SECTORS);
      const clearance = rng.pick(CLEARANCES);
      const status = rng.next() < 0.85 ? 'active' : (rng.next() < 0.6 ? 'missing' : 'deceased');
      employees.push({
        id,
        name: `${firstName} ${lastName}`,
        password: generatePassword(rng),
        hiring_from: generateDate(rng),
        role: rng.pick(ROLES),
        sector,
        clearance,
        status,
      });
    }
  }

  // Ensure Lambda+Omega uniqueness check works
  // Count Lambda+Omega employees (excluding id 87)
  const lambdaOmegaCount = employees.filter(e => e.id !== 87 && e.sector === 'Lambda' && e.clearance === 'Omega').length;
  // If there are others, change them
  if (lambdaOmegaCount > 0) {
    employees.forEach(e => {
      if (e.id !== 87 && e.sector === 'Lambda' && e.clearance === 'Omega') {
        e.clearance = rng.next() < 0.5 ? 'Basic' : 'Advanced';
      }
    });
  }

  // Generate 150 notes
  const noteTexts = [
    'Плановая проверка оборудования завершена',
    'Запрос на замену фильтра одобрён',
    'Отчёт по калибровке отправлен',
    'Совещание перенесено на 15:00',
    'Обход территории — отклонений нет',
    'Запрос материалов со склада DELTA',
    'Протокол испытаний подписан',
    'Замена аккумулятора AP-12 запланирована',
    'Доклад о состоянии приборов',
    'Координация с полевыми группами',
  ];

  const decoyIds = [6, 23, 35, 47, 58, 63, 139];

  for (let i = 0; i < 150; i++) {
    const id = i + 1;
    if (id === 87) {
      // Double-encoded diary path
      notes.push({ id: 87, note: 'WkdsaGNua3RkbTl5Wld3dE1EZzNMbWgwYld3PQ==' });
    } else if (decoyIds.includes(id)) {
      // Single-encoded decoy
      const text = rng.pick(['Запрос на отпуск средств', 'Пропуск планового ТО', 'См. архив за прошлый месяц', 'Данные переданы в отдел', 'Перенос срока отчётности']);
      notes.push({ id, note: btoa(text) });
    } else {
      notes.push({ id, note: rng.pick(noteTexts) });
    }
  }

  return { employees, notes };
}

// SQL.js database instance
let db: any = null;
let SQL: any = null;

export async function initDatabase(): Promise<void> {
  if (db) return;
  
  // Load sql.js from CDN
  if (!(window as any).initSqlJs) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://sql.js.org/dist/sql-wasm.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load sql.js'));
      document.head.appendChild(script);
    });
  }
  
  const initSqlJs = (window as any).initSqlJs;
  SQL = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`
  });
  
  db = new SQL.Database();
  
  // Create tables
  db.run(`CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name TEXT,
    password TEXT,
    hiring_from TEXT,
    role TEXT,
    sector TEXT,
    clearance TEXT,
    status TEXT
  )`);
  
  db.run(`CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    note TEXT
  )`);
  
  // Generate and insert data
  const { employees, notes } = generateDatabase();
  
  for (const emp of employees) {
    db.run(`INSERT INTO employees VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
      emp.id, emp.name, emp.password, emp.hiring_from, emp.role, emp.sector, emp.clearance, emp.status
    ]);
  }
  
  for (const note of notes) {
    db.run(`INSERT INTO notes VALUES (?, ?)`, [note.id, note.note]);
  }
}

export function executeQuery(sql: string): { columns: string[]; values: any[][] } | { error: string } {
  if (!db) return { error: 'База данных не инициализирована' };
  
  try {
    const result = db.exec(sql);
    if (result.length === 0) return { columns: [], values: [] };
    return { columns: result[0].columns, values: result[0].values };
  } catch (e: any) {
    return { error: e.message || 'Ошибка выполнения запроса' };
  }
}

export function getDb() { return db; }
