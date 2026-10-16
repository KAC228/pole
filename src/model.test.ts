import { describe, expect, it } from "vitest";
import { filterPieces, pieces, priceBand, toggleCompare } from "./model";

const all = {
  q: "",
  category: "все" as const,
  glaze: "все" as const,
  price: "все" as const,
  stock: false,
};

describe("priceBand", () => {
  it("режет цену на три полки", () => {
    expect(priceBand(1800)).toBe("до 2 000");
    expect(priceBand(2400)).toBe("2 000–4 000");
    expect(priceBand(9200)).toBe("от 4 000");
  });
});

describe("filterPieces", () => {
  it("фильтрует категорию, глазурь и наличие", () => {
    const found = filterPieces(pieces, {
      ...all,
      category: "чашки",
      glaze: "молоко",
      stock: true,
    });
    expect(found).toEqual([]);
  });

  it("ищет по названию", () => {
    expect(filterPieces(pieces, { ...all, q: "огород" }).map((item) => item.id)).toEqual([
      "set-moss",
    ]);
  });
});

describe("toggleCompare", () => {
  it("снимает повторный клик и не пускает четвёртую позицию", () => {
    expect(toggleCompare(["a"], "a").selected).toEqual([]);
    const full = toggleCompare(["a", "b", "c"], "d");
    expect(full.rejected).toBe(true);
    expect(full.selected).toEqual(["a", "b", "c"]);
  });
});
