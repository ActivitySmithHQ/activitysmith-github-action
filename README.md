# ActivitySmith GitHub Action

The official ActivitySmith GitHub Action. Send push notifications and start, update or end Live Activities directly from your workflows.

## Inputs

- `action` (required): `send_push_notification`, `start_live_activity`, `update_live_activity`, `end_live_activity`
- `api-key` (required): ActivitySmith API key
- `errors` (optional, default `false`): fail the step on error when `true`
- `live-activity-id` (required for update/end): Live Activity ID
- `payload` (optional): JSON or YAML string payload
- `channels` (optional): comma-separated channels for `send_push_notification` and `start_live_activity`
- `payload-delimiter` (optional): delimiter used to flatten nested payload values
- `payload-file-path` (optional): path to a JSON/YAML payload file

## Outputs

- `ok`: `true` when the request succeeded
- `response`: JSON stringified API response (or error response)
- `time`: Unix epoch time (seconds) when the step finished
- `live_activity_id`: Live Activity ID returned from `start_live_activity`

## Example workflow

Full workflow format using the same examples as below:

```yaml
name: ActivitySmith Demo

on:
  workflow_dispatch:

jobs:
  activitysmith_demo:
    runs-on: ubuntu-latest
    steps:
      - name: Start live activity
        id: start_activity
        uses: ActivitySmithHQ/activitysmith-github-action@v0.1.2
        with:
          action: start_live_activity
          api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
          channels: ios-builds,engineering
          payload: |
            content_state:
              title: "ActivitySmith API Deployment"
              subtitle: "ci: install & build"
              number_of_steps: 3
              current_step: 1
              type: "segmented_progress"
              color: "green"

      - name: Update live activity
        uses: ActivitySmithHQ/activitysmith-github-action@v0.1.2
        with:
          action: update_live_activity
          api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
          live-activity-id: ${{ steps.start_activity.outputs.live_activity_id }}
          payload-file-path: ./activitysmith/payloads/update.yml

      - name: End live activity
        uses: ActivitySmithHQ/activitysmith-github-action@v0.1.2
        with:
          action: end_live_activity
          api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
          live-activity-id: ${{ steps.start_activity.outputs.live_activity_id }}
          payload: |
            content_state:
              title: "ActivitySmith API Deployment"
              subtitle: "done"
              current_step: 3

      - name: Send push notification
        uses: ActivitySmithHQ/activitysmith-github-action@v0.1.2
        with:
          action: send_push_notification
          api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
          channels: ios-builds
          payload: |
            title: "ActivitySmith Deployment"
            message: "New release deployed to production!"
```

Push notification redirection and actions are optional and can be used to redirect the user to a specific URL when they tap the notification or to trigger a specific action when they long-press the notification. Webhooks are executed by ActivitySmith backend.

```yaml
- name: Send actionable push notification
  uses: ActivitySmithHQ/activitysmith-github-action@v0.1.2
  with:
    action: send_push_notification
    api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
    payload: |
      title: "Build Failed 🚨"
      message: "CI pipeline failed on main branch"
      redirection: "https://github.com/org/repo/actions/runs/123456789"
      actions:
        - title: "Open Failing Run"
          type: "open_url"
          url: "https://github.com/org/repo/actions/runs/123456789"
        - title: "Create Incident"
          type: "webhook"
          url: "https://hooks.example.com/incidents/create"
          method: "POST"
          body:
            service: "payments-api"
            severity: "high"
```

## Notes

- `payload` supports JSON or YAML.
- `payload-file-path` supports `.json`, `.yml`, or `.yaml`.
- Push notification payload supports optional `redirection` and `actions` (max 4 actions).
- Live Activity payloads must include `content_state` (snake_case).
- Required fields for `start_live_activity` content_state: `title`, `number_of_steps`, `current_step`, `type`.
- Required fields for `update_live_activity`/`end_live_activity` content_state: `title`, `current_step` (number_of_steps optional).
- For update/end, `live-activity-id` is required. The action will set `activity_id` in the request body.
