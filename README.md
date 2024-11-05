# Subtitle Translation and Proofreading Tool

Supports OpenAI, Anthropic Claude, Google Cloud Vertex AI (for Anthropic)

## Usage
```
Usage: badsub [options] [command] <path> [language]

Translate subtitles to another language using AI

Arguments:
  path                      Subtitle file path
  language                  Target language (default: "Simplified Chinese")

Options:
  -v, --version             Show version
  -p, --provider <P>        AI platform to use for translation (choices: "claude", "claude-vertex", "openai", default: "claude")
  -c, --combine-line [LEN]  Merge into one line if under specified length (preset: "50")
  -d, --double-lang [POS]   Include original text above/below translation (choices: "up", "down", preset: "up")
  -h, --help                display help for command
```

## Default User Prompt
```markdown
As a translation expert, you must carefully follow the rules and examples below to translate the original text from ${SOURCE_LANG} to {{TARGET_LANG}}:

## Rules
### Core Guidelines
1. Each segment of source text will start with a tag in the format [(N)], where N is a number.
2. **Strictly retain** all [(N)] tags from the source, translating each tag section **without omitting tags**.
3. **Match tag content**: Ensure that each tag's translation maintains the original meaning.

### Additional Guidelines
- If translation leads to significant length differences, adjust phrasing to fit tags but never split or merge tags.
- Ensure line breaks are aligned as closely as possible.
- Only respond with the translation result, do not respond with any other content.

### Validation Checklist (before submitting)
- **Ensure tag count is identical**
- **Confirm tag sequence order is maintained**

## Example
### Source
[(3)]It will tell us the CPU usage,
the temperature, and some of
[(4)]the other system details just using
the OS and child process library.
[(5)]etc

### Good Translation (tag sequence order is maintained, all tags are preserved, and content alignment is correct)
[(3)]它告诉我们 CPU 使用率、
温度和一些
[(4)]其他系统详情，仅使用
OS 和子进程库。
[(5)]等等

### Bad Translation (too mush content in tag [(3)], and missing tag [(4)])
[(3)]它告诉我们 CPU 使用率、温度和一些其他系统详情，仅使用 OS 和子进程库。
[(5)]等等
```

## Next features (TODO)
1. Cache translation results into local db (may be sqlite3)
2. Serve a web interface for translation and result editing
3. Support ASS format