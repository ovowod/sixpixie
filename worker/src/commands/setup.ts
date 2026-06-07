import { setUserConfig } from "../kv";
import type { UserConfig } from "../types";

export async function handleSetupCommand(): Promise<Response> {
  return Response.json({
    type: 9,
    data: {
      custom_id: "sixpixie_setup_modal",
      title: "sixpixie 설정",
      components: [
        {
          type: 1,
          components: [{
            type: 4, label: "출발역", custom_id: "departure",
            style: 1, placeholder: "성균관대", required: true,
          }],
        },
        {
          type: 1,
          components: [{
            type: 4, label: "호선", custom_id: "line",
            style: 1, placeholder: "1", required: true,
          }],
        },
        {
          type: 1,
          components: [{
            type: 4, label: "도착역 (표시용)", custom_id: "destination",
            style: 1, placeholder: "수원", required: true,
          }],
        },
      ],
    },
  });
}

function dirButton(label: string, direction: string, departure: string, line: string, destination: string) {
  return {
    type: 2,
    label,
    style: 2,
    custom_id: `dir|${direction}|${departure}|${line}|${destination}`,
  };
}

export async function handleSetupModal(components: any[]): Promise<Response> {
  const val = (id: string) =>
    components.find((r: any) => r.components[0].custom_id === id)?.components[0].value ?? "";

  const departure = val("departure");
  const line = val("line");
  const destination = val("destination");

  return Response.json({
    type: 4,
    data: {
      content: `**${departure} (${line}호선) → ${destination}**\n방향을 선택해주세요:`,
      flags: 64,
      components: [{
        type: 1,
        components: [
          dirButton("상행", "상행", departure, line, destination),
          dirButton("하행", "하행", departure, line, destination),
          dirButton("내선", "내선", departure, line, destination),
          dirButton("외선", "외선", departure, line, destination),
        ],
      }],
    },
  });
}

export async function handleDirectionButton(
  kv: KVNamespace,
  userId: string,
  customId: string,
): Promise<Response> {
  const [, direction, departure, line, destination] = customId.split("|");
  const config: UserConfig = { departure_station: departure, line, direction, destination_station: destination };
  await setUserConfig(kv, userId, config);

  return Response.json({
    type: 7,
    data: {
      content: `✅ 설정 완료!\n출발역: ${departure} (${line}호선) ${direction}\n도착역: ${destination}`,
      flags: 64,
      components: [],
    },
  });
}
