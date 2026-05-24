import twilio from 'twilio';
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
export async function sendSMS(phone, message) {
  return client.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to: phone });
}
export async function sendOTP(phone, code) {
  return sendSMS(phone, `TrustLayer - Votre code : ${code}. Valable 10 minutes.`);
}
