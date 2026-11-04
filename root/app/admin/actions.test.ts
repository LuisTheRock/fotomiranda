import { beforeEach, describe, expect, it, vi } from "vitest";

const from = vi.fn();
const requireUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({ requireUser: () => requireUser(), createClient: vi.fn() }));
vi.mock("next/cache", () => ({ updateTag: vi.fn(), cacheTag: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/categories", () => ({ CATEGORIES: ["casamento", "casal", "bebes"] }));

import { addPhoto, deletePhotos, setCategory } from "./actions";

const blur = "data:image/jpeg;base64,AAAA";

beforeEach(() => {
  from.mockReset();
  requireUser.mockReset().mockResolvedValue({ from });
});

describe("admin actions", () => {
  it("checks the session before anything else", async () => {
    requireUser.mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(addPhoto("casamento-1.jpg", "casamento", blur)).rejects.toThrow("NEXT_REDIRECT");
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects bad paths, categories and blur without touching the database", async () => {
    for (const [p, c, b] of [["../x.jpg", "casal", blur], ["a.jpg", "boda", blur], ["a.jpg", "casal", "javascript:1"]]) {
      expect(await addPhoto(p, c, b)).toEqual({ error: "Fotografia inválida." });
    }
    expect(await setCategory("id", "boda")).toEqual({ error: "Categoria inválida." });
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects an empty or malformed delete selection", async () => {
    expect(await deletePhotos([])).toEqual({ error: "Seleção inválida." });
    expect(await deletePhotos(["x'); drop table photos;--"])).toEqual({ error: "Seleção inválida." });
    expect(from).not.toHaveBeenCalled();
  });

  it("still succeeds when the files cannot be removed from storage, and logs it", async () => {
    const id = "11111111-1111-1111-1111-111111111111";
    const remove = vi.fn().mockResolvedValue({ error: { message: "boom" } });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    requireUser.mockResolvedValue({
      from: () => ({ select: () => ({ in: async () => ({ data: [{ path: "a.jpg" }] }) }), delete: () => ({ in: async () => ({ error: null }) }) }),
      storage: { from: () => ({ remove }) },
    });
    expect(await deletePhotos([id])).toEqual({});
    expect(remove).toHaveBeenCalledWith(["a.jpg"]);
    expect(log).toHaveBeenCalled();
  });

  it("appends a valid photo after the last position", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    from.mockReturnValueOnce({ select: () => ({ order: () => ({ limit: async () => ({ data: [{ position: 4 }] }) }) }) }).mockReturnValueOnce({ insert });
    expect(await addPhoto("casal-ab12.jpg", "casal", blur)).toEqual({});
    expect(insert).toHaveBeenCalledWith({ path: "casal-ab12.jpg", category: "casal", blur, position: 5 });
  });
});
