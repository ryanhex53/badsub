import { load } from "@std/dotenv";

export async function setup() {
  await load({ export: true });

  Deno.env.set("MAX_TOKENS", "4000");
  Deno.env.set("BLOCK_MAX_LEN", "2500");

  const SOURCE_LANG = Deno.env.get("SOURCE_LANG") || "English";

  if (Deno.env.get("SYS_PROMPT") === undefined) {
    Deno.env.set(
      "SYS_PROMPT",
      `You are a document translation expert.`,
    );
  }

  if (Deno.env.get("USER_PROMPT") === undefined) {
    Deno.env.set(
      "USER_PROMPT",
      `As a translation expert, you must carefully follow the rules and examples below to translate the original text from ${SOURCE_LANG} to {{TARGET_LANG}}:

## Rules
### Core Guidelines
1. Each segment of source text will start with a tag in the format [(N)], where N is a number.
2. **Strictly retain** all [(N)] tags from the source, translating each tag section **without omitting tags**.
3. **Match tag content**: Ensure that each tag's translation maintains the original meaning.

### Additional Guidelines
- If translation leads to significant length differences, adjust phrasing to fit tags but never split or merge tags.
- Ensure line breaks are aligned as closely as possible.
- Only respond with the translation result, do not respond with any other content.

### Validation Checklist (should retry if any of these fail)
1. **Ensure tag count is identical**
2. **Confirm tag sequence order is maintained**

## Example
### Source
[(3)]It will tell us the CPU usage,
the temperature, and some of
[(4)]the other system details just using
the OS and child process library.

### Good Translation (tag sequence order is maintained, all tags are preserved, and content alignment is correct)
[(3)]它告诉我们 CPU 使用率、
温度和一些
[(4)]其他系统详情，仅使用
OS 和子进程库。

### Bad Translation (too mush content in tag [(3)], and missing tag [(4)])
[(3)]它告诉我们 CPU 使用率、温度和一些其他系统详情，仅使用 OS 和子进程库。
`,
    );
  }
}
