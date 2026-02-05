import core from "@actions/core";
import Content from "./content.js";
import ActivitySmithError from "./errors.js";
import { ActionType } from "./actionType.js";
import Logger from "./logger.js";

/**
 * Options and settings set as inputs to this action.
 *
 * @see {@link ../action.yml}
 */
export default class Config {
  /**
   * @typedef Inputs - Values provided to this job.
   * @property {string} action - Action type.
   * @property {string?} apiKey - The authentication value used with the ActivitySmith API.
   * @property {boolean} errors - If the job should exit after errors or succeed.
   * @property {string?} liveActivityId - Id of live activity to update/end.
   * @property {string?} payload - Request contents from the provided input.
   * @property {string?} payloadDelimiter - Seperators of nested attributes.
   * @property {string?} payloadFilePath - Location of a JSON request payload.
   */

  /**
   * @type {Inputs} - The actual action input values.
   */
  inputs;

  /**
   * @type {Content} - The parsed payload data to send.
   */
  content;

  /**
   * Shared utilities specific to the GitHub action workflow.
   * @type {import("@actions/core")}
   */
  core;

  /**
   * The logger of outputs.
   * @type {import("@slack/logger").Logger}
   */
  logger;

  /**
   * Gather values from the job inputs and use defaults or error for the missing
   * ones.
   *
   * The content of the payload is also parsed, proxies set, and a shared "core"
   * kept for later use.
   *
   * @constructor
   * @param {core} core - GitHub Actions core utilities.
   */
  constructor(core) {
    this.core = core;
    this.logger = new Logger(core).logger;
    this.inputs = {
      action: core.getInput("action"),
      apiKey: core.getInput("api-key"),
      errors: core.getBooleanInput("errors"),
      liveActivityId: core.getInput("live-activity-id"),
      payload: core.getInput("payload"),
      payloadDelimiter: core.getInput("payload-delimiter"),
      payloadFilePath: core.getInput("payload-file-path"),
    };
    this.mask();
    this.validate(core);
    core.debug(`Gathered action inputs: ${JSON.stringify(this.inputs)}`);
    this.content = new Content().get(this);
    core.debug(`Parsed request content: ${JSON.stringify(this.content)}`);
  }

  /**
   * Hide secret values provided in the inputs from appearing.
   */
  mask() {
    if (this.inputs.apiKey) {
      core.debug("Setting the provided API key as a secret variable.");
      core.setSecret(this.inputs.apiKey);
    }
  }

  /**
   * Confirm the configurations are correct enough to continue.
   * @param {core} core - GitHub Actions core utilities.
   */
  validate(core) {
    if (!this.inputs.apiKey) {
      throw new ActivitySmithError(core, "Missing input! An API key must be provided.");
    }

    if (!this.inputs.action) {
      throw new ActivitySmithError(core, "Missing input! An action must be provided.");
    }

    switch (this.inputs.action) {
      case ActionType.UpdateLiveActivity:
      case ActionType.EndLiveActivity:
        if (!this.inputs.liveActivityId) {
          throw new ActivitySmithError(core, "Missing input! A live activity id must be provided.");
        }
      default:
        break;
    }
  }
}
