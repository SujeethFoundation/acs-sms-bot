# acs-sms-bot

Two Azure Functions that send and receive text messages for the Sujeeth Foundation through Azure Communication Services (ACS) SMS.

The Foundation's admin app uses it to text mentors when a substitute request comes in. See the platform docs in [`architecture/`](https://github.com/SujeethFoundation/sujeethfoundation.github.io/tree/main/architecture) in the website repo for how this fits with the rest of the platform.

## Functions

Both are HTTP POST triggers with `authLevel: function`, so every call needs a function key.

| Function | Trigger | What it does |
|---|---|---|
| `SendSMS` | HTTP POST, called from Power Automate | Sends a text from the ACS number to one or more recipients. |
| `RelayReply` | Event Grid delivery of an ACS inbound SMS event | Forwards each reply to one fixed phone number. |

### SendSMS

Request body:

```json
{ "to": "+15555550100", "message": "Can you cover Tuesday's circle?" }
```

`to` can be a single number or an array of numbers. Use E.164 format.

- Success: `200` with the ACS send result.
- Failure: `500` with `{ "error": "<message>" }`.

The function does not validate `to` or `message`. Anyone who holds the function key can text any number from the Foundation's number, so keep the key out of flows other people can edit.

### RelayReply

- Answers the Event Grid subscription validation handshake (`Microsoft.EventGrid.SubscriptionValidationEvent`).
- Ignores messages sent from its own ACS number.
- Forwards any other inbound message to `RELAY_PHONE_NUMBER` as `SMS from <sender>: "<message>"`.

Replies go to one person's phone. They are not written back to Dataverse, so a mentor's "I can cover" is read by a human and is not recorded on the substitute request.

## Settings

| Setting | Meaning |
|---|---|
| `ACS_CONNECTION_STRING` | Connection string for the ACS resource. Secret. |
| `ACS_PHONE_NUMBER` | The ACS number texts are sent from. |
| `RELAY_PHONE_NUMBER` | The phone that receives forwarded replies. |

Set these as Function App application settings in Azure. For local runs, put them in `local.settings.json`, which is git-ignored. Never commit values.

## Event Grid setup

For replies to reach `RelayReply`, the ACS resource needs an Event Grid subscription:

1. In the ACS resource, open Events and add an event subscription.
2. Filter to the `Microsoft.Communication.SMSReceived` event type.
3. Set the endpoint type to Web Hook and point it at `https://<function-app-host>/api/RelayReply?code=<function-key>`.
4. Event Grid sends the validation event first. `RelayReply` answers it automatically.

## Run locally

```bash
npm install
func start
```

Requires [Azure Functions Core Tools](https://learn.microsoft.com/azure/azure-functions/functions-run-local) and a `local.settings.json` with the three settings above. This project uses the Node.js v3 programming model, with `function.json` beside each function.

## Project structure

```
acs-sms-bot/
├── SendSMS/
│   ├── SendSMS.js
│   └── function.json
├── RelayReply/
│   ├── RelayReply.js
│   └── function.json
├── host.json
├── package.json
└── .github/workflows/main_acs-sms-bot.yml   # deploy
```

## Deploy

Pushing to `main` runs the workflow in `.github/workflows/main_acs-sms-bot.yml`, which deploys to the Function App.

## Known limits

- `@azure/communication-sms` is pinned to a prerelease (`^1.2.0-beta.3`).
- There are no tests.
- Opt-out handling (STOP replies) is not in this code. Confirm what ACS applies to the number in use.

## License

Apache-2.0. See `LICENSE`.
