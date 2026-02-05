/**
 * @typedef Cause
 * @property {Error[]} [values] - Caught exceptions.
 */

/**
 * ActivitySmithError is a custom error wrapper for known errors of ActivitySmith GitHub Action.
 */
export default class ActivitySmithError extends Error {
  /**
   * @typedef Options
   * @property {Cause} [cause] - Reason for an error.
   */

  /**
   * @param {core} _core - GitHub Actions core utilities.
   * @param {any} error - The error message to throw.
   * @param {Options} options - configurations of erroring.
   */
  constructor(_core, error, options = {}) {
    if (error instanceof Error) {
      super(error.message, { cause: options.cause });
    } else {
      super(error, { cause: options.cause });
    }
    this.name = "ActivitySmithError";
    if (error.stack) {
      this.stack = error.stack;
    }
  }
}
