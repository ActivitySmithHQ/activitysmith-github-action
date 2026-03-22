# ActivitySmith GitHub Action

The official ActivitySmith GitHub Action. Send [Push Notifications](#push-notifications) with optional rich media, and trigger stateless or manual [Live Activities](#live-activities) directly from your workflows.

## Live Activities

<p align="center">
  <img src="https://cdn.activitysmith.com/features/metrics-live-activity-action.png" alt="Live Activities example" width="680" />
</p>

ActivitySmith supports two ways to drive Live Activities from GitHub Actions:

- Recommended: stream updates with `action: stream_live_activity`
- Advanced: manual lifecycle control with `start_live_activity`, `update_live_activity`, and `end_live_activity`

Use stream updates when you want the easiest, stateless flow. You do not need to
store `live_activity_id` or manage lifecycle state yourself. Send the latest
state for a stable `stream-key` and ActivitySmith will start or update the Live
Activity for you. When the tracked process is over, call
`action: end_live_activity_stream`.

Use the manual lifecycle actions when you need direct control over a specific
Live Activity instance.

Live Activity UI types:

- `metrics`: best for live operational stats like server CPU and memory, queue depth, or replica lag
- `segmented_progress`: best for step-based workflows like deployments, backups, and ETL pipelines
- `progress`: best for continuous jobs like uploads, reindexes, and long-running migrations tracked as a percentage

### Recommended: Stream updates

Use a stable `stream-key` to identify the system or workflow you are tracking,
such as a server, deployment, build pipeline, scheduled workflow, or charging
session. This is especially useful for scheduled workflows where you do not
want to store `live_activity_id` between runs.

#### Metrics

<p align="center">
  <img src="https://cdn.activitysmith.com/features/metrics-live-activity-start.png" alt="Metrics stream example" width="680" />
</p>

```yaml
- name: Stream server health
  id: stream_activity
  uses: ActivitySmithHQ/activitysmith-github-action@v1
  with:
    action: stream_live_activity
    api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
    stream-key: prod-web-1
    payload: |
      content_state:
        title: "Server Health"
        subtitle: "prod-web-1"
        type: "metrics"
        metrics:
          - label: "CPU"
            value: 9
            unit: "%"
          - label: "MEM"
            value: 45
            unit: "%"
```

#### Segmented progress

<p align="center">
  <img src="https://cdn.activitysmith.com/features/update-live-activity.png" alt="Segmented progress stream example" width="680" />
</p>

```yaml
- name: Stream nightly backup progress
  uses: ActivitySmithHQ/activitysmith-github-action@v1
  with:
    action: stream_live_activity
    api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
    stream-key: nightly-backup
    payload: |
      content_state:
        title: "Nightly Backup"
        subtitle: "upload archive"
        type: "segmented_progress"
        number_of_steps: 3
        current_step: 2
```

#### Progress

<p align="center">
  <img src="https://cdn.activitysmith.com/features/progress-live-activity.png" alt="Progress stream example" width="680" />
</p>

```yaml
- name: Stream search reindex progress
  uses: ActivitySmithHQ/activitysmith-github-action@v1
  with:
    action: stream_live_activity
    api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
    stream-key: search-reindex
    payload: |
      content_state:
        title: "Search Reindex"
        subtitle: "catalog-v2"
        type: "progress"
        percentage: 42
```

Run `stream_live_activity` again with the same `stream-key` whenever the state
changes.

#### End a stream

Use this when the tracked process is finished and you no longer want the Live
Activity on devices. `payload` is optional here; include it if you want to end
the stream with a final state.

```yaml
- name: End server health stream
  uses: ActivitySmithHQ/activitysmith-github-action@v1
  with:
    action: end_live_activity_stream
    api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
    stream-key: prod-web-1
    payload: |
      content_state:
        title: "Server Health"
        subtitle: "prod-web-1"
        type: "metrics"
        metrics:
          - label: "CPU"
            value: 7
            unit: "%"
          - label: "MEM"
            value: 38
            unit: "%"
```

If you later send another `stream_live_activity` request with the same
`stream-key`, ActivitySmith starts a new Live Activity for that stream again.

Stream responses include an `operation` field, also exposed as
`steps.<id>.outputs.operation`:

- `started`: ActivitySmith started a new Live Activity for this `stream-key`
- `updated`: ActivitySmith updated the current Live Activity
- `rotated`: ActivitySmith ended the previous Live Activity and started a new one
- `noop`: the incoming state matched the current state, so no update was sent
- `paused`: the stream is paused, so no Live Activity was started or updated
- `ended`: returned by `end_live_activity_stream` after the stream is ended

### Advanced: Manual lifecycle control

Use these actions when you want to manage the Live Activity lifecycle yourself.

#### Shared flow

1. Run `start_live_activity`.
2. Save the returned `live_activity_id`.
3. Run `update_live_activity` as progress changes.
4. Run `end_live_activity` when the work is finished.

### Metrics Type

Use `metrics` when you want to keep a small set of live stats visible, such as
server health, queue pressure, or database load.

#### Start

<p align="center">
  <img src="https://cdn.activitysmith.com/features/metrics-live-activity-start.png" alt="Metrics start example" width="680" />
</p>

```yaml
- name: Start metrics Live Activity
  id: start_activity
  uses: ActivitySmithHQ/activitysmith-github-action@v1
  with:
    action: start_live_activity
    api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
    payload: |
      content_state:
        title: "Server Health"
        subtitle: "prod-web-1"
        type: "metrics"
        metrics:
          - label: "CPU"
            value: 9
            unit: "%"
          - label: "MEM"
            value: 45
            unit: "%"
```

#### Update

<p align="center">
  <img src="https://cdn.activitysmith.com/features/metrics-live-activity-update.png" alt="Metrics update example" width="680" />
</p>

```yaml
- name: Update metrics Live Activity
  uses: ActivitySmithHQ/activitysmith-github-action@v1
  with:
    action: update_live_activity
    api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
    live-activity-id: ${{ steps.start_activity.outputs.live_activity_id }}
    payload: |
      content_state:
        title: "Server Health"
        subtitle: "prod-web-1"
        type: "metrics"
        metrics:
          - label: "CPU"
            value: 76
            unit: "%"
          - label: "MEM"
            value: 52
            unit: "%"
```

#### End

<p align="center">
  <img src="https://cdn.activitysmith.com/features/metrics-live-activity-end.png" alt="Metrics end example" width="680" />
</p>

```yaml
- name: End metrics Live Activity
  uses: ActivitySmithHQ/activitysmith-github-action@v1
  with:
    action: end_live_activity
    api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
    live-activity-id: ${{ steps.start_activity.outputs.live_activity_id }}
    payload: |
      content_state:
        title: "Server Health"
        subtitle: "prod-web-1"
        type: "metrics"
        metrics:
          - label: "CPU"
            value: 7
            unit: "%"
          - label: "MEM"
            value: 38
            unit: "%"
        auto_dismiss_minutes: 2
```

### Segmented Progress Type

Use `segmented_progress` when progress is easier to follow as steps instead of a
raw percentage. It fits deployments, backups, ETL pipelines, and checklists
where "step 2 of 3" is more useful than "67%". `number_of_steps` is dynamic, so
you can increase or decrease it later if the workflow changes.

#### Start

<p align="center">
  <img src="https://cdn.activitysmith.com/features/start-live-activity.png" alt="Segmented progress start example" width="680" />
</p>

```yaml
- name: Start segmented progress Live Activity
  id: start_activity
  uses: ActivitySmithHQ/activitysmith-github-action@v1
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
  uses: ActivitySmithHQ/activitysmith-github-action@v1
  with:
    action: update_live_activity
    api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
    live-activity-id: ${{ steps.start_activity.outputs.live_activity_id }}
    payload: |
      content_state:
        title: "Nightly database backup"
        subtitle: "upload archive"
        number_of_steps: 3
        current_step: 2
        color: "yellow"
```

#### End

<p align="center">
  <img src="https://cdn.activitysmith.com/features/end-live-activity.png" alt="Segmented progress end example" width="680" />
</p>

```yaml
- name: End segmented progress Live Activity
  uses: ActivitySmithHQ/activitysmith-github-action@v1
  with:
    action: end_live_activity
    api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
    live-activity-id: ${{ steps.start_activity.outputs.live_activity_id }}
    payload: |
      content_state:
        title: "Nightly database backup"
        subtitle: "verify restore"
        number_of_steps: 3
        current_step: 3
        auto_dismiss_minutes: 2
```

### Progress Type

Use `progress` when the state is naturally continuous. It fits charging,
downloads, sync jobs, uploads, timers, and any flow where a percentage or
numeric range is clearer than step counts.

#### Start

<p align="center">
  <img src="https://cdn.activitysmith.com/features/progress-live-activity-start.png" alt="Progress start example" width="680" />
</p>

```yaml
- name: Start progress Live Activity
  id: start_activity
  uses: ActivitySmithHQ/activitysmith-github-action@v1
  with:
    action: start_live_activity
    api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
    payload: |
      content_state:
        title: "EV Charging"
        subtitle: "Added 30 mi range"
        type: "progress"
        percentage: 15
```

#### Update

<p align="center">
  <img src="https://cdn.activitysmith.com/features/progress-live-activity-update.png" alt="Progress update example" width="680" />
</p>

```yaml
- name: Update progress Live Activity
  uses: ActivitySmithHQ/activitysmith-github-action@v1
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
  uses: ActivitySmithHQ/activitysmith-github-action@v1
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

### Live Activity Action

Just like Actionable Push Notifications, Live Activities can have a button that opens provided URL in a browser or triggers a webhook. Webhooks are executed by the ActivitySmith backend.

#### Open URL action

<p align="center">
  <img src="https://cdn.activitysmith.com/features/metrics-live-activity-action.png" alt="Metrics Live Activity with action" width="680" />
</p>

```yaml
- name: Start Live Activity with open URL action
  id: start_activity
  uses: ActivitySmithHQ/activitysmith-github-action@v1
  with:
    action: start_live_activity
    api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
    payload: |
      content_state:
        title: "Server Health"
        subtitle: "prod-web-1"
        type: "metrics"
        metrics:
          - label: "CPU"
            value: 76
            unit: "%"
          - label: "MEM"
            value: 52
            unit: "%"
      action:
        title: "Open Dashboard"
        type: "open_url"
        url: "https://ops.example.com/servers/prod-web-1"
```

#### Webhook action

<p align="center">
  <img src="https://cdn.activitysmith.com/features/live-activity-with-action.png?v=20260319-1" alt="Live Activity with action" width="680" />
</p>

```yaml
- name: Update Live Activity with webhook action
  uses: ActivitySmithHQ/activitysmith-github-action@v1
  with:
    action: update_live_activity
    api-key: ${{ secrets.ACTIVITYSMITH_API_KEY }}
    live-activity-id: ${{ steps.start_activity.outputs.live_activity_id }}
    payload: |
      content_state:
        title: "Reindexing product search"
        subtitle: "Shard 7 of 12"
        number_of_steps: 12
        current_step: 7
      action:
        title: "Pause Reindex"
        type: "webhook"
        url: "https://ops.example.com/hooks/search/reindex/pause"
        method: "POST"
        body:
          job_id: "reindex-2026-03-19"
          requested_by: "activitysmith-github-action"
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
  uses: ActivitySmithHQ/activitysmith-github-action@v1
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
  uses: ActivitySmithHQ/activitysmith-github-action@v1
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
  uses: ActivitySmithHQ/activitysmith-github-action@v1
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

- `action` (required): `send_push_notification`, `stream_live_activity`, `end_live_activity_stream`, `start_live_activity`, `update_live_activity`, or `end_live_activity`
- `api-key` (required): ActivitySmith API key
- `payload` (optional): inline JSON or YAML payload. Push notifications support optional `media`, `redirection`, and up to 4 `actions`. Live Activities support `metrics`, `segmented_progress`, or `progress` `content_state` plus one optional `action`. For `end_live_activity_stream`, `payload` is optional.
- `payload-file-path` (optional): path to a `.json`, `.yml`, or `.yaml` payload file
- `live-activity-id` (required for `update_live_activity` and `end_live_activity`): Live Activity ID
- `stream-key` (required for `stream_live_activity` and `end_live_activity_stream`): stable key used to identify the tracked stream
- `channels` (optional): comma-separated channels for `send_push_notification`, `stream_live_activity`, and `start_live_activity`
- `errors` (optional, default `false`): set to `true` to fail the step when the API request fails
- `payload-delimiter` (optional): advanced override for nested payload flattening

## Outputs

- `ok`: `true` when the request succeeds, otherwise `false`
- `response`: JSON stringified API response or error response
- `time`: Unix epoch time (seconds) when the step finished
- `live_activity_id`: returned when a Live Activity start or stream request returns an activity ID
- `operation`: returned by stream actions, such as `started`, `updated`, `rotated`, `noop`, `paused`, or `ended`

## Notes

- Use either `payload` or `payload-file-path`.
- Both inline payloads and payload files can be JSON or YAML.
- Live Activity payloads go under `content_state` and should use snake_case keys.
- `live-activity-id` is required for update and end actions.
- `stream-key` is required for stream start/update and stream end actions.
- Push notification payloads support optional `media`, `redirection`, and up to 4 `actions`.
- Live Activity payloads support one optional `action`.
- `media` can be combined with `redirection`, but not with `actions`.
- `channels` only applies to `send_push_notification`, `stream_live_activity`, and `start_live_activity`. If your payload already includes `target` or `channels`, the action leaves it unchanged.
