import { describe, it, expect, vi } from "vitest";
import { handleTestCommand } from "../../src/commands/test_cmd";

const mockEnv = {
  GITHUB_TOKEN: "gh_test",
  GITHUB_REPO: "user/sixpixie",
  GITHUB_WORKFLOW_FILE: "notify.yml",
  GITHUB_REF: "master",
};

describe("handleTestCommand", () => {
  it("calls workflow_dispatch and returns confirmation", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    const resp = await handleTestCommand(mockEnv as any);
    const body = await resp.json() as any;

    expect(fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/user/sixpixie/actions/workflows/notify.yml/dispatches",
      expect.objectContaining({ method: "POST" }),
    );
    expect(body.data.content).toContain("잠시 후");
    expect(body.data.flags).toBe(64);
  });

  it("returns error message when GitHub API fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 422 })));

    const resp = await handleTestCommand(mockEnv as any);
    const body = await resp.json() as any;

    expect(body.data.content).toContain("⚠️");
    expect(body.data.flags).toBe(64);
  });
});
