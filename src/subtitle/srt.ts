import type { Formatter, SubtitleEntity } from "./types.ts";

/**
 * SRT subtitle formatter.
 */
export class SRT implements Formatter {
  private subtitles: SubtitleEntity[] = [];

  async parse(path: string): Promise<SubtitleEntity[]> {
    const decoder = new TextDecoder("utf-8");
    const data = await Deno.readFile(path);
    const content = decoder.decode(data);
    const blocks = content.split(/^\s*$/m);
    for (const block of blocks) {
      const lines = block.replace(/^\n+|\n+$/g, "").split("\n");
      if (lines.length >= 3 && /^\d+$/.test(lines[0])) {
        const index = parseInt(lines[0]);
        const times = lines[1].split(" --> ");
        const start = times[0];
        const end = times[1];
        const text = lines.slice(2).join("\n");
        this.subtitles.push({ index, start, end, text, done: false });
      }
    }
    return this.subtitles;
  }

  toBlocks(): string[] {
    const maxLength = Number(Deno.env.get("BLOCK_MAX_LEN") || "1500");
    const blocks: string[] = [];
    let block: string[] = [];
    let blockTxtLength = 0;
    for (const subtitle of this.subtitles) {
      const text = `[(${subtitle.index})]${subtitle.text}`;
      if (blockTxtLength + text.length > maxLength) {
        blocks.push(block.join("\n"));
        block = [text];
        blockTxtLength = text.length;
      } else {
        block.push(text);
        blockTxtLength += text.length;
      }
    }
    blocks.push(block.join("\n"));
    return blocks;
  }

  async write(subtitles: SubtitleEntity[], path: string): Promise<void> {
    const content = subtitles
      .map((s) =>
        `${s.index}\n${s.start} --> ${s.end}\n${
          s.text.replace(/^\n+|\n+$/g, "")
        }`
      )
      .join("\n\n");
    const encoder = new TextEncoder();
    await Deno.writeFile(path, encoder.encode(content));
  }
}
