const { SmsClient } = require("@azure/communication-sms");

module.exports = async function (context, req) {
    const { to, message } = req.body;
    const smsClient = new SmsClient(process.env["ACS_CONNECTION_STRING"]);

    try {
        const result = await smsClient.send({
            from: process.env["ACS_PHONE_NUMBER"],
            to: Array.isArray(to) ? to : [to],
            message
        });

        context.res = { status: 200, body: result };
    } catch (err) {
        context.res = { status: 500, body: { error: err.message } };
    }
};
