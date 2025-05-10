# 📲 Azure Communication Services SMS Bot

This project provides a two-function serverless solution for sending and receiving SMS messages using **Azure Communication Services (ACS)**, deployed via **Azure Functions**.

## 🔧 Features

- **SendSMS**: Triggered via HTTP POST (e.g. from Power Automate), sends SMS to one or more phone numbers.
- **RelayReply**: Triggered by Event Grid when a reply SMS is received; forwards the message to your personal phone.

## 📁 Project Structure
acs-sms-bot/
├── SendSMS/ # Sends SMS via ACS
│ ├── function.json
│ └── index.js
├── RelayReply/ # Forwards incoming replies to your phone
│ ├── function.json
│ └── index.js
├── host.json # Global settings for Azure Functions
├── local.settings.json # Local secrets (DO NOT COMMIT)
├── package.json
├── .gitignore
└── README.md


