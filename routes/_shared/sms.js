const twilio = require("twilio");

function sendSMS(to, body) {
  const sid = process.env.TWILIO_ACCOUNT_SID || "";
  const token = process.env.TWILIO_AUTH_TOKEN || "";
  const from = process.env.TWILIO_FROM || "";

  if (!sid || !token || !from) {
    console.log(`SMS MOCK → ${to}: ${body}`);
    return Promise.resolve({ mock: true });
  }

  const client = twilio(sid, token);
  return client.messages.create({ from, to, body });
}

module.exports = { sendSMS };
