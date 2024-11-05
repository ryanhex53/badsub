export interface Provider {
  readonly model: string;
  translate(text: string, toLang: string): Promise<string>;
}