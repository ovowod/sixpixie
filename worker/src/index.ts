import { verifyKey, InteractionType } from "discord-interactions";
import { handleSetupCommand, handleSetupModal, handleDirectionButton } from "./commands/setup";
import { handleStatus } from "./commands/status";
import { handleTestCommand } from "./commands/test_cmd";
import type { Env } from "./types";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const signature = request.headers.get("x-signature-ed25519") ?? "";
    const timestamp  = request.headers.get("x-signature-timestamp") ?? "";
    const body = await request.text();

    const isValid = await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);
    if (!isValid) return new Response("Invalid signature", { status: 401 });

    const interaction = JSON.parse(body);
    const userId: string = interaction.member?.user?.id ?? interaction.user?.id ?? "";

    if (interaction.type === InteractionType.PING) {
      return Response.json({ type: 1 });
    }

    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      const sub: string = interaction.data.options?.[0]?.name ?? "";
      if (sub === "setup")  return handleSetupCommand();
      if (sub === "status") return handleStatus(env.USER_CONFIG, userId);
      if (sub === "test")   return handleTestCommand(env);
    }

    if (interaction.type === InteractionType.MODAL_SUBMIT &&
        interaction.data.custom_id === "sixpixie_setup_modal") {
      return handleSetupModal(interaction.data.components);
    }

    if (interaction.type === InteractionType.MESSAGE_COMPONENT &&
        interaction.data.custom_id?.startsWith("dir|")) {
      return handleDirectionButton(env.USER_CONFIG, userId, interaction.data.custom_id);
    }

    return new Response("Unknown interaction", { status: 400 });
  },
};
