import { describe, expect, it } from "vitest";
import { byCategory } from "./categories";

describe("byCategory", () => {
  it("groups by category in the fixed order and keeps the drag order inside a group", () => {
    const rows = [
      { category: "bebes", id: 1 },
      { category: "casamento", id: 2 },
      { category: "casal", id: 3 },
      { category: "casamento", id: 4 },
      { category: "bebes", id: 5 },
    ];
    expect(byCategory(rows).map((r) => r.id)).toEqual([2, 4, 3, 1, 5]);
  });
});
