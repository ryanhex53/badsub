import "@std/dotenv/load";
import { assertEquals, assertStringIncludes } from "@std/assert";

import { SRT } from "./subtitle/srt.ts";
import { Openai } from "./provider/openai.ts";

Deno.test({
  name: "srt formatter",
  fn: async () => {
    const srt = new SRT();
    const subtitles = await srt.parse("./demo.srt");
    assertEquals(subtitles.length, 322);
    const blocks = srt.toBlocks();
    assertEquals(blocks.length, 14);
  },
});

Deno.test({
  name: "open ai translation",
  fn: async () => {
    const srt = new SRT();
    const subtitles = await srt.parse("./demo.srt");
    const blocks = srt.toBlocks();
    const provider = new Openai();
    try {
      const result = await provider.translate(blocks[0], "Simplified Chinese");
      assertStringIncludes(result, "[(1)]");
    } catch (err) {
      const error = err as Error;
      console.error(error.message);
    }
  },
});
