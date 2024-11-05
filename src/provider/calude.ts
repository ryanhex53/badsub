import { Anthropic } from "@anthropic-ai/sdk";
import type { Provider } from "./types.ts";

const systemPrompt = Deno.env.get("SYS_PROMPT") ||
  "You are a document translation expert.";
const maxTokens = Number(Deno.env.get("MAX_TOKENS") || "3000");

export class Calude implements Provider {
  private anthropic: Anthropic;
  readonly model: string = Deno.env.get("CLAUDE_MODEL") ||
    "claude-3-5-sonnet-20240620";

  constructor() {
    this.anthropic = new Anthropic();
  }

  async translate(text: string, toLang: string): Promise<string> {
    const userPrompt = Deno.env.get("USER_PROMPT") ||
      "Translate the following English text to {{TARGET_LANG}}:";
    const msg = await this.anthropic.messages.create({
      model: this.model,
      system: systemPrompt,
      max_tokens: maxTokens,
      messages: [
        {
          role: "user",
          content: userPrompt.replaceAll("{{TARGET_LANG}}", toLang),
        },
        {
          role: "assistant",
          content: "Ok, send me the text you want to translate.",
        },
        { role: "user", content: text },
      ],
    });
    return msg.content.filter((m) => m.type === "text")
      .map((m) => m.text).join("\n");
  }
}
