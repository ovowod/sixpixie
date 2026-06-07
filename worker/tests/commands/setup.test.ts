import { describe, it, expect, vi } from "vitest";
import { handleSetupCommand, handleSetupModal, handleDirectionButton } from "../../src/commands/setup";

describe("handleSetupCommand", () => {
  it("returns a modal with 3 text inputs", async () => {
    const resp = await handleSetupCommand();
    const body = await resp.json() as any;
    expect(body.type).toBe(9);
    expect(body.data.custom_id).toBe("sixpixie_setup_modal");
    expect(body.data.components).toHaveLength(3);
  });
});

describe("handleSetupModal", () => {
  const components = [
    { components: [{ custom_id: "departure", value: "성균관대" }] },
    { components: [{ custom_id: "line",      value: "1" }] },
    { components: [{ custom_id: "destination", value: "수원" }] },
  ];

  it("returns ephemeral message with 4 direction buttons", async () => {
    const resp = await handleSetupModal(components);
    const body = await resp.json() as any;
    expect(body.type).toBe(4);
    expect(body.data.flags).toBe(64);
    const buttons = body.data.components[0].components;
    expect(buttons).toHaveLength(4);
  });

  it("encodes partial config in each button custom_id", async () => {
    const resp = await handleSetupModal(components);
    const body = await resp.json() as any;
    const buttons = body.data.components[0].components;
    expect(buttons.some((b: any) => b.custom_id === "dir|하행|성균관대|1|수원")).toBe(true);
    expect(buttons.some((b: any) => b.custom_id === "dir|상행|성균관대|1|수원")).toBe(true);
  });
});

describe("handleDirectionButton", () => {
  it("saves config and confirms", async () => {
    const mockKV = { put: vi.fn().mockResolvedValue(undefined) };
    const resp = await handleDirectionButton(mockKV as any, "user_1", "dir|하행|성균관대|1|수원");
    const body = await resp.json() as any;

    const saved = JSON.parse(mockKV.put.mock.calls[0][1]);
    expect(saved.direction).toBe("하행");
    expect(saved.departure_station).toBe("성균관대");
    expect(body.type).toBe(7);
    expect(body.data.content).toContain("✅");
    expect(body.data.flags).toBe(64);
  });
});
