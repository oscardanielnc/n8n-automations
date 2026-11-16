// Files the VM cron jobs write next to n8n (mounted read-only into the panel container).
export abstract class SharedFiles {
  /** Parsed JSON, or null when the file is missing or unreadable. */
  abstract readJson(relativePath: string): Promise<unknown | null>;
  /** Newest file in a folder whose name matches the pattern, or null. */
  abstract newest(relativeDir: string, pattern: RegExp): Promise<string | null>;
}
