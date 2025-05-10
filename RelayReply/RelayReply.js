const { SmsClient } = require("@azure/communication-sms");

module.exports = async function (context, req) {
    const event = req.body[0];
    const data = event.data;

    const smsClient = new SmsClient(process.env["ACS_CONNECTION_STRING"]);
    const forwardMsg = `SMS from ${data.from}: "${data.message}"`;

    try {
        const result = await smsClient.send({
            from: process.env["ACS_PHONE_NUMBER"],
            to: [process.env["RELAY_PHONE_NUMBER"]],
            message: forwardMsg
        });

        context.res = { status: 200, body: result };
    } catch (err) {
        context.res = { status: 500, body: { error: err.message } };
    }
};
