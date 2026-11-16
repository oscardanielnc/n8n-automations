import { Inject, Injectable } from '@nestjs/common';
import { readFile, readdir } from 'node:fs/promises';
import { join, normalize } from 'node:path';
import { ENV, Env } from '../../config/env';
import { SharedFiles } from '../application/shared-files.port';

@Injectable()
export class FsSharedFiles extends SharedFiles {
  constructor(@Inject(ENV) private readonly env: Env) {
    super();
  }

  private resolve(rel: string): string {
    const full = normalize(join(this.env.SHARED_DIR, rel));
    if (!full.startsWith(normalize(this.env.SHARED_DIR))) throw new Error('path outside the shared folder');
    return full;
  }

  async readJson(rel: string): Promise<unknown | null> {
    try {
      return JSON.parse(await readFile(this.resolve(rel), 'utf8'));
    } catch {
      return null;
    }
  }

  async newest(relDir: string, pattern: RegExp): Promise<string | null> {
    try {
      const names = (await readdir(this.resolve(relDir))).filter((n) => pattern.test(n)).sort();
      const last = names.at(-1);
      return last ? join(relDir, last) : null;
    } catch {
      return null;
    }
  }
}
