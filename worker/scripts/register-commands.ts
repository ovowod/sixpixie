const APP_ID = process.env.DISCORD_APPLICATION_ID!;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;

const command = {
  name: "sixpixie",
  description: "sixpixie 지하철 알림 봇",
  options: [
    { name: "setup",  description: "역, 호선, 방향 설정",        type: 1 },
    { name: "status", description: "현재 설정 확인",              type: 1 },
    { name: "test",   description: "테스트 알림 전송 (~1분 후 DM)", type: 1 },
  ],
};

const resp = await fetch(
  `https://discord.com/api/v10/applications/${APP_ID}/commands`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([command]),
  }
);

if (resp.ok) {
  console.log("✅ Slash commands registered");
} else {
  console.error("❌ Failed:", await resp.text());
  process.exit(1);
}
