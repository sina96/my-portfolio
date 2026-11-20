import { afterEach, expect, test, vi } from "vitest";
import { adminAuthFailure } from "@/lib/basicAuth";

afterEach(() => vi.unstubAllEnvs());

function authorize(password: string, header = `Basic ${btoa(`test-admin:${password}`)}`) {
  vi.stubEnv("ADMIN_USERNAME", "test-admin");
  vi.stubEnv("ADMIN_PASSWORD", password);
  return adminAuthFailure(header);
}

test.each(["replace-with-a-long-random-password", "short-password"])("refuses placeholder or short credentials", (password) => {
  const response = authorize(password);
  expect(response?.status).toBe(503);
  expect(response?.headers.get("Cache-Control")).toBe("no-store");
});

test("accepts configured strong credentials", () => {
  expect(authorize("test-only-long-password")).toBeNull();
});

test("challenges malformed credentials", () => {
  const response = authorize("test-only-long-password", "Basic !!!");
  expect(response?.status).toBe(401);
  expect(response?.headers.get("WWW-Authenticate")).toMatch(/^Basic /);
});
