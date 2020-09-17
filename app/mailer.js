const sgMail = require('@sendgrid/mail');

const { SENDGRID_API_KEY } = process.env;
if (!SENDGRID_API_KEY) {
  console.error('No SENDGRID_API_KEY env var found');
  process.exit(1);
}

sgMail.setApiKey(SENDGRID_API_KEY);

module.exports = sgMail;
