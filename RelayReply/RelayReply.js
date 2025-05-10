const { SmsClient } = require("@azure/communication-sms");

module.exports = async function (context, req) {
    try {
        const event = req.body[0];
        const data = event.data;

        const myNumber = process.env["ACS_PHONE_NUMBER"];
        const from = data.from;
        const to = data.to;
        const message = data.message;

        // Ignore messages sent from our own ACS number
        if (from === myNumber) {
            context.log(`Skipping self-sent message from ${from}`);
            context.res = { status: 200, body: { skipped: true } };
            return;
        }

        const forwardMsg = `SMS from ${from}: "${message}"`;

        const smsClient = new SmsClient(process.env["ACS_CONNECTION_STRING"]);
        const result = await smsClient.send({
            from: myNumber,
            to: [process.env["RELAY_PHONE_NUMBER"]],
            message: forwardMsg
        });

        context.res = { status: 200, body: { forwarded: true, result } };
    } catch (err) {
        context.log.error("RelayReply failed:", err.message);
        context.res = {
            status: 500,
            body: { error: err.message }
        };
    }
};
