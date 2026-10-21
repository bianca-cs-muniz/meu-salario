import { z } from "zod";

export type RequestQueryDto = z.output<typeof RequestQuery>;
export const RequestQuery = z.object({
  tipo: z.string().optional(),
  data: z.string().optional(),
  semana: z.string().optional(),
});
