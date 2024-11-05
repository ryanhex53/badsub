import { Option, program } from "commander";
import { resolve as pathResolve } from "node:path";
import process from "node:process";
import { setup } from "./env.ts";
import { Calude } from "./provider/calude.ts";
import { ClaudeVertex } from "./provider/claude-vertex.ts";
import { Openai } from "./provider/openai.ts";
import { SRT } from "./subtitle/srt.ts";
import { ProviderType, run, TranslateOptions } from "./translate.ts";

await setup();
// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  program.name("badsub").version(
    "1.0.0",
    "-v, --version",
    "Show version",
  );

  program
    .description(
      "Translate subtitles to another language using AI",
    )
    .argument("<path>", "Subtitle file path")
    .argument(
      "[language]",
      "Target language",
      "Simplified Chinese",
    )
    .addOption(
      new Option(
        "-p, --provider <P>",
        "AI platform to use for translation",
      ).default("claude").choices(Object.values(ProviderType)),
    )
    .addOption(
      new Option(
        "-c, --combine-line [LEN]",
        "Merge into one line if under specified length",
      ).preset("50").argParser(parseInt),
    )
    .addOption(
      new Option(
        "-d, --double-lang [POS]",
        "Include original text above/below translation",
      ).preset("up").choices(["up", "down"]),
    )
    //TODO: add option to disable cache
    // .option("--no-cache", "Translation without cache")
    .action(
      async (
        path: string,
        language: string,
        options: TranslateOptions,
      ) => {
        // console.log("path:", path, "language:", language, "Options:", options);
        const { provider } = options;
        if (!path.endsWith(".srt")) {
          console.error("Only SRT files are supported for now");
          process.exit(1);
        }
        const p = (() => {
          switch (provider) {
            case ProviderType.CLAUDE:
              return new Calude();
            case ProviderType.OPENAI:
              return new Openai();
            case ProviderType.CLAUDE_VERTEX:
              return new ClaudeVertex();
            default:
              throw new Error(`Unsupported provider: ${provider}`);
          }
        })();
        const f = new SRT();
        const absolutePath = pathResolve(process.cwd(), path);
        console.log(
          `Translating '${path}' to ${language} using '${provider}' provider with model '${p.model}'`,
        );
        await run(absolutePath, language, p, f, options);
        console.log("Translation complete");
      },
    );

  //TODO: clear cache
  program.command("clear-cache").action(() => {});

  //TODO: serve a web interface for translation and result editing
  // program.command("serve").option("-p, --port <PORT>").action(() => {});

  program.parse(process.argv);
}
