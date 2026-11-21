import { afterEach, expect, test, vi } from "vitest";
import { addBlogRead, groupBlogYears, markBlogRead, parseBlogRead, readBlogSnapshot } from "@/app/(main)/blog/mailState";

const post = (slug: string, date: string) => ({ slug, date, title: slug, excerpt: "Message preview" });

afterEach(() => vi.unstubAllGlobals());

test("groups newest years and messages first without mutating the source", () => {
  const messages = [post("old", "2025-02-08"), post("early", "2026-01-09"), post("late", "2026-05-01")];
  expect(groupBlogYears(messages)).toEqual([
    { year: "2026", posts: [messages[2], messages[1]] }, { year: "2025", posts: [messages[0]] },
  ]);
  expect(messages.map(({ slug }) => slug)).toEqual(["old", "early", "late"]);
  expect(groupBlogYears([])).toEqual([]);
});

test("read history ignores malformed entries, keeps newest first and caps at 200", () => {
  expect(parseBlogRead("{!")).toEqual([]);
  expect(parseBlogRead('{"one":true}')).toEqual([]);
  expect(parseBlogRead('["one", "two-two", "one", null, "../unsafe"]')).toEqual(["one", "two-two"]);
  const history = JSON.stringify(Array.from({ length: 200 }, (_, i) => `post-${i}`));
  expect(parseBlogRead(addBlogRead(history, "post-3"))[0]).toBe("post-3");
  const next = parseBlogRead(addBlogRead(history, "new"));
  expect(next).toHaveLength(200);
  expect(next[0]).toBe("new");
  expect(next).not.toContain("post-199");
});

test("blocked storage keeps the read-neutral view and never breaks opening a message", () => {
  vi.stubGlobal("localStorage", {
    getItem: () => { throw new Error("blocked"); },
    setItem: vi.fn(),
  });
  expect(readBlogSnapshot()).toBeNull();
  expect(() => markBlogRead("hello")).not.toThrow();
  expect(localStorage.setItem).not.toHaveBeenCalled();
});
