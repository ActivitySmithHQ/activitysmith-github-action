# ActivitySmith GitHub Action

The official ActivitySmith GitHub Action. Send [Push Notifications](#push-notifications) with optional rich media, and start, update, or end [Live Activities](#live-activities) directly from your workflows.

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
  uses: ActivitySmithHQ/activitysmith-github-action@v0.1.4
  with:
    action: start_live_activity
    api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
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
  uses: ActivitySmithHQ/activitysmith-github-action@v0.1.4
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
  uses: ActivitySmithHQ/activitysmith-github-action@v0.1.4
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
  uses: ActivitySmithHQ/activitysmith-github-action@v0.1.4
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
  uses: ActivitySmithHQ/activitysmith-github-action@v0.1.4
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
  uses: ActivitySmithHQ/activitysmith-github-action@v0.1.4
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

## Push Notifications

Push Notifications support three common patterns:

- simple delivery alerts
- rich media previews
- actionable follow-up from the notification itself

### Simple Push Notifications

<p align="center">
  <img src="https://cdn.activitysmith.com/features/deployment-push-notification.png" alt="Deployment push notification" width="680" />
</p>

```yaml
- name: Send push notification
  uses: ActivitySmithHQ/activitysmith-github-action@v0.1.4
  with:
    action: send_push_notification
    api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
    payload: |
      title: "API Deployment"
      message: "New release deployed to production!"
```

### Rich Push Notifications with Media

<p align="center">
  <img src="https://cdn.activitysmith.com/features/rich-push-notification-with-image.png" alt="Rich push notification with image" width="680" />
</p>

```yaml
- name: Send rich push notification
  uses: ActivitySmithHQ/activitysmith-github-action@v0.1.4
  with:
    action: send_push_notification
    api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
    payload: |
      title: "Homepage ready"
      message: "Your agent finished the redesign."
      media: "https://cdn.example.com/output/homepage-v2.png"
      redirection: "https://github.com/acme/web/pull/482"
```

Send images, videos, or audio with your push notifications, press and hold to preview media directly from the notification, then tap through to open the linked content.

<p align="center">
  <img src="https://cdn.activitysmith.com/features/rich-push-notification-with-audio.png" alt="Rich push notification with audio" width="680" />
</p>

What will work:

- direct image URL: `.jpg`, `.png`, `.gif`, etc.
- direct audio file URL: `.mp3`, `.m4a`, etc.
- direct video file URL: `.mp4`, `.mov`, etc.
- URL that responds with a proper media `Content-Type`, even if the path has no extension

`media` can be combined with `redirection`, but not with `actions`.

### Actionable Push Notifications

<p align="center">
  <img src="https://cdn.activitysmith.com/features/actionable-push-notifications-3.png" alt="Actionable push notification" width="680" />
</p>

Add redirection when tapping the notification should open a specific URL, and use action buttons when someone should be able to act on the notification immediately. Webhook actions are executed by ActivitySmith backend.

```yaml
- name: Send actionable push notification
  uses: ActivitySmithHQ/activitysmith-github-action@v0.1.4
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

## Inputs

- `action` (required): `send_push_notification`, `start_live_activity`, `update_live_activity`, or `end_live_activity`
- `api-key` (required): ActivitySmith API key
- `payload` (optional): inline JSON or YAML payload
- `payload-file-path` (optional): path to a `.json`, `.yml`, or `.yaml` payload file
- `live-activity-id` (required for `update_live_activity` and `end_live_activity`): Live Activity ID
- `channels` (optional): comma-separated channels for `send_push_notification` and `start_live_activity`
- `errors` (optional, default `false`): set to `true` to fail the step when the API request fails
- `payload-delimiter` (optional): advanced override for nested payload flattening

## Outputs

- `ok`: `true` when the request succeeds, otherwise `false`
- `response`: JSON stringified API response or error response
- `time`: Unix epoch time (seconds) when the step finished
- `live_activity_id`: returned by `start_live_activity`

## Notes

- Use either `payload` or `payload-file-path`.
- Both inline payloads and payload files can be JSON or YAML.
- Live Activity payloads go under `content_state` and should use snake_case keys.
- `live-activity-id` is required for update and end actions.
- Push notification payloads support optional `media`, `redirection`, and up to 4 `actions`.
- `media` can be combined with `redirection`, but not with `actions`.
- `channels` only applies to `send_push_notification` and `start_live_activity`. If your payload already includes `target` or `channels`, the action leaves it unchanged.
