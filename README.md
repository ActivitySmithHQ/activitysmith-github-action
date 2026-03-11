# ActivitySmith GitHub Action

The official ActivitySmith GitHub Action. Send push notifications and start, update or end Live Activities directly from your workflows.

Examples below use `@v0.1.3`.

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

## Live Activities

Live Activities come in two UI types, but the lifecycle stays the same:

1. Start the activity.
2. Save the returned `live_activity_id`.
3. Update it as progress changes.
4. End it when the work is finished.

- `segmented_progress`: best for jobs tracked in steps
- `progress`: best for jobs tracked as a percentage or numeric range

### Segmented Progress

Use `segmented_progress` when progress is easier to follow as steps instead of a raw percentage. It fits deployments, backups, ETL pipelines, and checklists.

`number_of_steps` is dynamic, so you can increase or decrease it later if the workflow changes.

#### Start

<p align="center">
  <img src="https://cdn.activitysmith.com/features/start-live-activity.png" alt="Segmented progress start example" width="680" />
</p>

```yaml
- name: Start segmented progress Live Activity
  id: start_activity
  uses: ActivitySmithHQ/activitysmith-github-action@v0.1.3
  with:
    action: start_live_activity
    api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
    channels: ios-builds,engineering
    payload: |
      content_state:
        title: "Nightly database backup"
        subtitle: "create snapshot"
        number_of_steps: 3
        current_step: 1
        type: "segmented_progress"
        color: "yellow"
```

#### Update

<p align="center">
  <img src="https://cdn.activitysmith.com/features/update-live-activity.png" alt="Segmented progress update example" width="680" />
</p>

```yaml
- name: Update segmented progress Live Activity
  uses: ActivitySmithHQ/activitysmith-github-action@v0.1.3
  with:
    action: update_live_activity
    api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
    live-activity-id: ${{ steps.start_activity.outputs.live_activity_id }}
    payload: |
      content_state:
        title: "Nightly database backup"
        subtitle: "upload archive"
        number_of_steps: 4
        current_step: 2
        color: "yellow"
```

#### End

<p align="center">
  <img src="https://cdn.activitysmith.com/features/end-live-activity.png" alt="Segmented progress end example" width="680" />
</p>

```yaml
- name: End segmented progress Live Activity
  uses: ActivitySmithHQ/activitysmith-github-action@v0.1.3
  with:
    action: end_live_activity
    api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
    live-activity-id: ${{ steps.start_activity.outputs.live_activity_id }}
    payload: |
      content_state:
        title: "Nightly database backup"
        subtitle: "done"
        number_of_steps: 4
        current_step: 4
        auto_dismiss_minutes: 2
```

### Progress

Use `progress` when the state is naturally continuous. It fits charging, downloads, sync jobs, uploads, timers, and any flow where a percentage or numeric range is clearer than step counts.

Send either `percentage` or `value` with `upper_limit`.

#### Start

<p align="center">
  <img src="https://cdn.activitysmith.com/features/progress-live-activity-start.png" alt="Progress start example" width="680" />
</p>

```yaml
- name: Start progress Live Activity
  id: start_activity
  uses: ActivitySmithHQ/activitysmith-github-action@v0.1.3
  with:
    action: start_live_activity
    api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
    payload: |
      content_state:
        title: "EV Charging"
        subtitle: "Added 30 mi range"
        type: "progress"
        percentage: 15
        color: "lime"
```

#### Update

<p align="center">
  <img src="https://cdn.activitysmith.com/features/progress-live-activity-update.png" alt="Progress update example" width="680" />
</p>

```yaml
- name: Update progress Live Activity
  uses: ActivitySmithHQ/activitysmith-github-action@v0.1.3
  with:
    action: update_live_activity
    api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
    live-activity-id: ${{ steps.start_activity.outputs.live_activity_id }}
    payload: |
      content_state:
        title: "EV Charging"
        subtitle: "Added 120 mi range"
        percentage: 60
```

#### End

<p align="center">
  <img src="https://cdn.activitysmith.com/features/progress-live-activity-end.png" alt="Progress end example" width="680" />
</p>

```yaml
- name: End progress Live Activity
  uses: ActivitySmithHQ/activitysmith-github-action@v0.1.3
  with:
    action: end_live_activity
    api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
    live-activity-id: ${{ steps.start_activity.outputs.live_activity_id }}
    payload: |
      content_state:
        title: "EV Charging"
        subtitle: "Added 200 mi range"
        percentage: 100
        auto_dismiss_minutes: 2
```

### Push notifications

```yaml
- name: Send push notification
  uses: ActivitySmithHQ/activitysmith-github-action@v0.1.3
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
  uses: ActivitySmithHQ/activitysmith-github-action@v0.1.3
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
- For `segmented_progress` start payloads, include `title`, `type`, `number_of_steps`, and `current_step`.
- For `progress` start payloads, include `title`, `type`, and either `percentage`, or `value` with `upper_limit`.
- For `segmented_progress` update/end payloads, include `title`, `current_step`, and optionally `number_of_steps`.
- For `progress` update/end payloads, include `title`, and either `percentage`, or `value` with `upper_limit`.
- For update/end, `live-activity-id` is required. The action will set `activity_id` in the request body.
