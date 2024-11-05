export interface SubtitleEntity {
  index: number;
  start: string;
  end: string;
  text: string;
  done?: boolean;
}

export interface Formatter {
  /**
   * Parse subtitle file.
   * @param path subtitle file path
   * @returns {Promise<SubtitleEntity[]>} Array of subtitle entities.
   */
  parse(path: string): Promise<SubtitleEntity[]>;
  /**
   * Mix entity index tag and text into subtitle blocks for translation.
   * @returns {string[]} Array of subtitle blocks.
   */
  toBlocks(): string[];
  /**
   * Write translated subtitles back to file.
   * @param subtitles Array of subtitle entities.
   * @param path Output file path.
   */
  write(subtitles: SubtitleEntity[], path: string): Promise<void>;
}
