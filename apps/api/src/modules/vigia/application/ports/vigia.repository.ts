import type { VigiaRow } from '../../domain/vigia';

export abstract class VigiaRepository {
  /** Rows of the latest Vigía run only (F2 already deletes older runs; this guards against a half-written run). */
  abstract findLatestRun(): Promise<VigiaRow[]>;
}
