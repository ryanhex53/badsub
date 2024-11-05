import { Provider } from "./provider/types.ts";
import { Formatter } from "./subtitle/types.ts";
import { join as pathJoin, parse as pathParse } from "node:path";

export enum ProviderType {
  CLAUDE = "claude",
  CLAUDE_VERTEX = "claude-vertex",
  OPENAI = "openai",
}

export type TranslateOptions = {
  provider: ProviderType;
  combineLine?: number;
  doubleLang?: "up" | "down";
};

export async function run(
  path: string,
  toLang: string,
  provider: Provider,
  formatter: Formatter,
  options: TranslateOptions,
): Promise<void> {
  const subtitles = await formatter.parse(path);
  // Translate each block of subtitles.
  const blocks = formatter.toBlocks();
  console.log(`${blocks.length} blocks total`);
  const translated = [];
  for (const block of blocks) {
    // console.log(block);
    const text = await provider.translate(block, toLang);
    // console.log(text.replace(/^\s*[\r\n]/gm, ""));
    translated.push(text.replace(/^\s*[\r\n]/gm, ""));
    //TODO: cache translated text in hard drive (or database) by md5 hash of block
    console.log(`${translated.length}/${blocks.length} blocks translated`);
    // Wait for 1.2 seconds to avoid rate limiting 50 requests per minute.
    if (translated.length !== blocks.length) {
      await new Promise((resolve) => setTimeout(resolve, 60 / 50 * 1000));
    }
  }
  // Extract translated text and update subtitle entities.
  const regex = /\[\((\d+)\)\]([\s\S]*?)(?=\[\(\d+\)\]|$)/g;
  translated.forEach((text) => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const index = parseInt(match[1]);
      const subtitle = subtitles.find((s) => s.index === index);
      if (subtitle) {
        let newText = match[2];
        if (options.combineLine && newText.length < options.combineLine) {
          newText = newText.replace(/\n/g, "");
        }
        if (options.doubleLang) {
          if (
            options.combineLine && subtitle.text.length < options.combineLine
          ) {
            subtitle.text = subtitle.text.replace(/\n/g, " ");
          }
          if (options.doubleLang === "up") {
            newText = `${subtitle.text}\n${newText}`;
          } else {
            newText = `${newText}\n${subtitle.text}`;
          }
        }
        subtitle.text = newText;
        subtitle.done = true;
      }
    }
  });
  // Output translated subtitles to a new file.
  const parsedPath = pathParse(path);
  parsedPath.name += "_translated";
  const outputPath = pathJoin(parsedPath.dir, parsedPath.name + parsedPath.ext);
  await formatter.write(subtitles, outputPath);
}
