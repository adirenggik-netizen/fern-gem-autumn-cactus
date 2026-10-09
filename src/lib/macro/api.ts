import { createServerFn } from "@tanstack/react-start";
import { loadTerminal } from "@/lib/macro/fetch.server";

export const getMacroTerminal = createServerFn({ method: "GET" })
  .validator((input: unknown) => {
    const refresh =
      typeof input === "object" &&
      input !== null &&
      "refresh" in input &&
      (input as { refresh?: unknown }).refresh === true;
    return { refresh };
  })
  .handler(async ({ data }) => loadTerminal(data.refresh));
