export type Category = "чашки" | "тарелки" | "миски" | "сервизы";
export type Glaze = "пепел" | "мох" | "молоко" | "глина";
export type PriceBand = "до 2 000" | "2 000–4 000" | "от 4 000";

export type Piece = {
  id: string;
  name: string;
  category: Category;
  glaze: Glaze;
  price: number;
  leadDays: number;
  inStock: boolean;
  diameter: number;
  height: number;
  note: string;
};

export type CatalogQuery = {
  q: string;
  category: Category | "все";
  glaze: Glaze | "все";
  price: PriceBand | "все";
  stock: boolean;
};

export const categories: Category[] = ["чашки", "тарелки", "миски", "сервизы"];
export const glazes: Glaze[] = ["пепел", "мох", "молоко", "глина"];
export const priceBands: PriceBand[] = ["до 2 000", "2 000–4 000", "от 4 000"];

export const pieces: Piece[] = [
  { id: "cup-ash", name: "Чашка «Утро»", category: "чашки", glaze: "пепел", price: 1800, leadDays: 4, inStock: true, diameter: 8, height: 7, note: "Тонкие стенки, ручка не греется." },
  { id: "cup-moss", name: "Чашка «Смена»", category: "чашки", glaze: "мох", price: 1900, leadDays: 6, inStock: true, diameter: 9, height: 8, note: "Потемнее к низу, край светлый." },
  { id: "cup-milk", name: "Чашка «Полдень»", category: "чашки", glaze: "молоко", price: 2100, leadDays: 5, inStock: false, diameter: 8, height: 9, note: "Белая, без рисунка, матовая." },
  { id: "plate-ash", name: "Тарелка «Поле»", category: "тарелки", glaze: "пепел", price: 2400, leadDays: 7, inStock: true, diameter: 22, height: 3, note: "Плоская, для подачи, край чуть поднят." },
  { id: "plate-clay", name: "Тарелка «Корка»", category: "тарелки", glaze: "глина", price: 2200, leadDays: 5, inStock: true, diameter: 20, height: 3, note: "Неглазурованное кольцо по борту." },
  { id: "plate-milk", name: "Тарелка «Свет»", category: "тарелки", glaze: "молоко", price: 2600, leadDays: 8, inStock: true, diameter: 24, height: 3, note: "Широкое дно, спокойный белый." },
  { id: "bowl-moss", name: "Миска «Дождь»", category: "миски", glaze: "мох", price: 2800, leadDays: 6, inStock: true, diameter: 16, height: 8, note: "Глубокая, для супа и хлопьев." },
  { id: "bowl-ash", name: "Миска «Зола»", category: "миски", glaze: "пепел", price: 2700, leadDays: 6, inStock: false, diameter: 15, height: 7, note: "Серая, внутри темнее, чем снаружи." },
  { id: "bowl-clay", name: "Миска «Двор»", category: "миски", glaze: "глина", price: 2500, leadDays: 4, inStock: true, diameter: 14, height: 7, note: "Тяжёлая, устойчивая." },
  { id: "set-morning", name: "Сервиз «Будни»", category: "сервизы", glaze: "молоко", price: 9200, leadDays: 14, inStock: true, diameter: 22, height: 9, note: "Две чашки, две тарелки, одна миска." },
  { id: "set-guest", name: "Сервиз «Гости»", category: "сервизы", glaze: "пепел", price: 12400, leadDays: 18, inStock: false, diameter: 24, height: 9, note: "Четыре посадки, одна большая миска." },
  { id: "set-moss", name: "Сервиз «Огород»", category: "сервизы", glaze: "мох", price: 10800, leadDays: 16, inStock: true, diameter: 22, height: 8, note: "Чашки и миски, без плоских тарелок." },
];

export function priceBand(price: number): PriceBand {
  if (price < 2000) return "до 2 000";
  if (price <= 4000) return "2 000–4 000";
  return "от 4 000";
}

export function filterPieces(list: Piece[], query: CatalogQuery): Piece[] {
  const needle = query.q.trim().toLowerCase();
  return list.filter((piece) => {
    if (query.category !== "все" && piece.category !== query.category) return false;
    if (query.glaze !== "все" && piece.glaze !== query.glaze) return false;
    if (query.price !== "все" && priceBand(piece.price) !== query.price) return false;
    if (query.stock && !piece.inStock) return false;
    if (!needle) return true;
    return `${piece.name} ${piece.note} ${piece.glaze}`.toLowerCase().includes(needle);
  });
}

export function toggleCompare(selected: string[], id: string, max = 3) {
  if (selected.includes(id)) {
    return { selected: selected.filter((item) => item !== id), rejected: false };
  }
  if (selected.length >= max) return { selected, rejected: true };
  return { selected: [...selected, id], rejected: false };
}

export function formatPrice(price: number) {
  return `${price.toLocaleString("ru-RU")} ₽`;
}
