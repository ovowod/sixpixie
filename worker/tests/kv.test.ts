import { describe, it, expect, vi } from "vitest";
import { getUserConfig, setUserConfig } from "../src/kv";
import type { UserConfig } from "../src/types";

const testConfig: UserConfig = {
  departure_station: "성균관대",
  line: "1",
  direction: "하행",
  destination_station: "수원",
};

describe("getUserConfig", () => {
  it("returns parsed config when key exists", async () => {
    const mockKV = { get: vi.fn().mockResolvedValue(JSON.stringify(testConfig)) };
    const result = await getUserConfig(mockKV as any, "123456");
    expect(result).toEqual(testConfig);
  });

  it("returns null when key does not exist", async () => {
    const mockKV = { get: vi.fn().mockResolvedValue(null) };
    const result = await getUserConfig(mockKV as any, "unknown");
    expect(result).toBeNull();
  });
});

describe("setUserConfig", () => {
  it("stores config as JSON string", async () => {
    const mockKV = { put: vi.fn().mockResolvedValue(undefined) };
    await setUserConfig(mockKV as any, "123456", testConfig);
    expect(mockKV.put).toHaveBeenCalledWith("123456", JSON.stringify(testConfig));
  });
});
