const nodemailer = require("nodemailer");
const env = require("../config/env");

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.mailHost,
      port: env.mailPort,
      secure: env.mailSecure,
      auth:
        env.mailUser && env.mailPass
          ? {
              user: env.mailUser,
              pass: env.mailPass
            }
          : undefined
    });
  }

  return transporter;
};

const sendMail = async ({ to, subject, html, text }) => {
  const client = getTransporter();

  return client.sendMail({
    from: env.mailFrom,
    to,
    subject,
    html,
    text
  });
};

module.exports = {
  sendMail
};
