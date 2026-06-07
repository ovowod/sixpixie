import { describe, it, expect, vi } from "vitest";
import { handleStatus } from "../../src/commands/status";
import type { UserConfig } from "../../src/types";

const testConfig: UserConfig = {
  departure_station: "성균관대",
  line: "1",
  direction: "하행",
  destination_station: "수원",
};

describe("handleStatus", () => {
  it("shows config when user has settings", async () => {
    const mockKV = { get: vi.fn().mockResolvedValue(JSON.stringify(testConfig)) };
    const resp = await handleStatus(mockKV as any, "user_123");
    const body = await resp.json() as any;

    expect(body.type).toBe(4);
    expect(body.data.flags).toBe(64);
    expect(body.data.content).toContain("성균관대");
    expect(body.data.content).toContain("하행");
    expect(body.data.content).toContain("수원");
  });

  it("prompts setup when user has no settings", async () => {
    const mockKV = { get: vi.fn().mockResolvedValue(null) };
    const resp = await handleStatus(mockKV as any, "user_456");
    const body = await resp.json() as any;

    expect(body.data.flags).toBe(64);
    expect(body.data.content).toContain("/sixpixie setup");
  });
});
