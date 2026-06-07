import { getUserConfig } from "../kv";

export async function handleStatus(kv: KVNamespace, userId: string): Promise<Response> {
  const config = await getUserConfig(kv, userId);

  const content = config
    ? `**현재 설정**\n출발역: ${config.departure_station} (${config.line}호선)\n방향: ${config.direction}\n도착역: ${config.destination_station}`
    : "설정이 없어요. `/sixpixie setup`으로 설정해주세요.";

  return Response.json({ type: 4, data: { content, flags: 64 } });
}
