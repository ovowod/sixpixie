import type { Env } from "../types";

export async function handleTestCommand(env: Env): Promise<Response> {
  const url = `https://api.github.com/repos/${env.GITHUB_REPO}/actions/workflows/${env.GITHUB_WORKFLOW_FILE}/dispatches`;

  const ghResp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `token ${env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "sixpixie-bot",
    },
    body: JSON.stringify({ ref: env.GITHUB_REF, inputs: { skip_holiday_check: "true" } }),
  });

  if (!ghResp.ok) {
    return Response.json({
      type: 4,
      data: { content: "⚠️ 테스트 알림 전송에 실패했어요. GitHub Actions 설정을 확인해주세요.", flags: 64 },
    });
  }

  return Response.json({
    type: 4,
    data: { content: "🧚 잠시 후 DM으로 테스트 알림이 와요! (~1분 소요)", flags: 64 },
  });
}
