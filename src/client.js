import { ActionType } from "./actionType.js";
import ActivitySmithError from "./errors.js";
import ActivitySmith from "activitysmith";

/**
 * The Client class creates a client for use when calling
 * various ActivitySmith API methods.
 */
export default class Client {
  /**
   * Perform the API call configured with the input payload.
   * @param {Config} config
   */
  async run(config) {
    try {
      const client = new ActivitySmith({ apiKey: config.inputs.apiKey });
      let response;

      switch (config.inputs.action) {
        case ActionType.SendPushNotification:
          config.logger.info("Making ActivitySmith push notification request...");
          response = await client.notifications.sendPushNotificationRaw({
            pushNotificationRequest: config.content.values,
          });
          break;
        case ActionType.StartLiveActivity:
          config.logger.info("Making ActivitySmith start live activity request...");
          response = await client.liveActivities.startLiveActivityRaw({
            liveActivityStartRequest: config.content.values,
          });
          break;
        case ActionType.UpdateLiveActivity:
          config.logger.info("Making ActivitySmith update live activity request...");
          response = await client.liveActivities.updateLiveActivityRaw({
            liveActivityUpdateRequest: config.content.values,
          });
          break;
        case ActionType.EndLiveActivity:
          config.logger.info("Making ActivitySmith end live activity request...");
          response = await client.liveActivities.endLiveActivityRaw({
            liveActivityEndRequest: config.content.values,
          });
          break;
        default:
          break;
      }

      if (!response) {
        throw new ActivitySmithError(config.core, "Unknown action.");
      }

      const data = await response.value();
      const status = response.raw.status;

      config.logger.info(`✅ Success! - ${status}`);
      config.logger.info(`Response: ${JSON.stringify(data)}`);

      config.core.setOutput("ok", status >= 200 && status < 300);
      config.core.setOutput("response", JSON.stringify(data));

      if (data?.activity_id) {
        config.core.setOutput("live_activity_id", data.activity_id);
      }

      config.core.debug(JSON.stringify(data));
    } catch (/** @type {any} */ err) {
      let apiResponse = null;
      let errorMessage = err?.message ?? "Unknown error";
      let status = null;

      // Extract API response body if available
      if (err?.response) {
        status = err.response.status ?? null;
        // Extract the error message from the API response if available
        try {
          apiResponse = await err.response.json();
          if (apiResponse?.error) {
            errorMessage = apiResponse.error;
          }
        } catch (error) {
          apiResponse = null;
        }
      }

      if (!config.inputs.errors) {
        config.logger.error(`❌ ${errorMessage}`);
        // Log the API error message if different from error message
        if (apiResponse && apiResponse.error && apiResponse.error !== errorMessage) {
          config.logger.error(`API Error: ${apiResponse.error}`);
        }
        // Log the API message field if available
        if (apiResponse && apiResponse.message) {
          config.logger.error(`API Message: ${apiResponse.message}`);
        }
        if (status) {
          config.logger.error(`Status: ${status}`);
        }
      }

      config.core.setOutput("ok", false);
      config.core.setOutput("response", JSON.stringify(apiResponse || errorMessage));

      config.core.debug(JSON.stringify(apiResponse || { message: errorMessage }));

      throw new ActivitySmithError(config.core, errorMessage);
    }
  }
}
