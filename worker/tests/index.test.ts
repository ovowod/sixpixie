import { describe, it, expect, vi } from "vitest";

vi.mock("discord-interactions", () => ({
  verifyKey: vi.fn().mockResolvedValue(true),
  InteractionType: { PING: 1, APPLICATION_COMMAND: 2, MESSAGE_COMPONENT: 3, MODAL_SUBMIT: 5 },
}));

import worker from "../src/index";

const mockEnv = {
  USER_CONFIG: { get: vi.fn().mockResolvedValue(null), put: vi.fn() },
  DISCORD_PUBLIC_KEY: "test_key",
  DISCORD_BOT_TOKEN: "bot_tok",
  DISCORD_APPLICATION_ID: "app_id",
  SUBWAY_API_KEY: "subway_key",
  GITHUB_TOKEN: "gh_tok",
  GITHUB_REPO: "user/sixpixie",
  GITHUB_WORKFLOW_FILE: "notify.yml",
  GITHUB_REF: "master",
};

function req(body: object, sig = "valid_sig") {
  return new Request("https://example.com", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-signature-ed25519": sig,
      "x-signature-timestamp": "12345",
    },
    body: JSON.stringify(body),
  });
}

describe("Worker entry point", () => {
  it("responds to PING with PONG (type 1)", async () => {
    const resp = await worker.fetch(req({ type: 1 }), mockEnv as any, {} as any);
    const body = await resp.json() as any;
    expect(body.type).toBe(1);
  });

  it("routes APPLICATION_COMMAND status to status handler", async () => {
    const r = req({ type: 2, data: { name: "sixpixie", options: [{ name: "status" }] }, member: { user: { id: "u1" } } });
    const resp = await worker.fetch(r, mockEnv as any, {} as any);
    expect(resp.status).toBe(200);
  });

  it("returns 401 for invalid signature", async () => {
    const { verifyKey } = await import("discord-interactions");
    vi.mocked(verifyKey).mockResolvedValueOnce(false);
    const resp = await worker.fetch(req({ type: 1 }, "bad_sig"), mockEnv as any, {} as any);
    expect(resp.status).toBe(401);
  });
});
