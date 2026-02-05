import Client from "./client.js";
import Config from "./config.js";
import ActivitySmithError from "./errors.js";

/**
 * Orchestrate the action job happenings from inputs to logic to outputs.
 * @param {core} core - GitHub Actions core utilities.
 * @throws if an error happens but might not cause the job to fail.
 */
export default async function send(core) {
  const config = new Config(core);
  try {
    await new Client().run(config);
    config.core.setOutput("time", Math.floor(Date.now() / 1000));
  } catch (/** @type {any} */ error) {
    config.core.setOutput("time", Math.floor(Date.now() / 1000));
    if (config.inputs.errors) {
      core.setFailed(error);
      throw new ActivitySmithError(core, error);
    }
  }
}
