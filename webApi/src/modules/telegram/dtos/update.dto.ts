import { z } from "zod";

// Update do Telegram: só o que o estagiário usa (mensagem de texto em chat privado).
// `.passthrough()` porque o Telegram manda muitos outros campos que não interessam.

const ChatSchema = z.object({ id: z.number().int(), type: z.string() }).passthrough();

const RemetenteSchema = z
  .object({ id: z.number().int(), is_bot: z.boolean().optional(), first_name: z.string().optional(), username: z.string().optional() })
  .passthrough();

const MensagemSchema = z
  .object({ message_id: z.number().int(), chat: ChatSchema, from: RemetenteSchema.optional(), text: z.string().optional() })
  .passthrough();

export const UpdateTelegramSchema = z.object({ update_id: z.number().int(), message: MensagemSchema.optional() }).passthrough();
export type UpdateTelegramDto = z.infer<typeof UpdateTelegramSchema>;
