import { OpenAI } from "openai";
import type { Provider } from "./types.ts";

const systemPrompt = Deno.env.get("SYS_PROMPT") ||
  "You are a document translation expert.";
const maxTokens = Number(Deno.env.get("MAX_TOKENS") || "3000");

export class Openai implements Provider {
  private openai: OpenAI;
  readonly model: string = Deno.env.get("OPENAI_MODEL") || "gpt-4o";

  constructor() {
    this.openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
      baseURL: Deno.env.get("OPENAI_BASE_URL") || "https://api.openai.com/v1",
    });
  }

  async translate(text: string, toLang: string): Promise<string> {
    const userPrompt = Deno.env.get("USER_PROMPT") ||
      "Translate the following English text to {{TARGET_LANG}}:";
    const completion = await this.openai.chat.completions.create({
      model: this.model,
      max_completion_tokens: maxTokens,
      modalities: ["text"],
      messages: [
        { role: "system", content: systemPrompt },
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
    return completion.choices[0].message.content!;
  }
}
