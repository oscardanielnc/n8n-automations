// Time enters as a port so business rules ("closed before today") are testable with a fixed date.
export abstract class Clock {
  abstract now(): Date;
  /** Today in Lima as YYYY-MM-DD. */
  abstract today(): string;
}
