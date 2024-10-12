'use strict';
const { Service } = require('egg');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class EmailService extends Service {
  async sendOTP(server_ref) {
    console.log('-----------------Send OTP-----------------');
    const { app } = this;
    const mail = app.config.mail;
    const userVerification = await this.app.model.UserVerification.findOne({ where: { server_ref } });

    if (!userVerification) {
      throw new Error('Invalid server_ref');
    }

    const OTP = userVerification.code;
    const user = await this.app.model.ApplicationUser.findByPk(userVerification.app_user_id);
    if (!user) {
      throw new Error('User not found');
    }

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      service: mail.service, // Gmail
      secure: false, // true for 465, false for other ports
      auth: {
        user: mail.user,
        pass: mail.pass,
      },
    });

    // Read the HTML template
    const htmlTemplatePath = path.join(app.baseDir, 'app/public/emails/verification_email.html');
    let htmlContent = fs.readFileSync(htmlTemplatePath, 'utf8');
    htmlContent = htmlContent.replace('{{verificationCode}}', OTP);

    // Email Options
    // const mailOptions = {
    //   from: `"${mail.sender}" <${mail.user}>`, // sender address
    //   to: user.email, // list of receivers
    //   subject: 'Your Verification Code(No Reply)', // Subject line
    //   text: `Your OTP is: ${OTP}`,
    //   html: `<b>Your OTP is: ${OTP}</b>`, // html body
    // };
    const mailOptions = {
      from: `"${mail.sender}" <${mail.user}>`, // sender address
      to: user.email, // list of receivers
      subject: 'Your Verification Code(No Reply)', // Subject line
      html: htmlContent,
    };
    // Send Email
    await transporter.sendMail(mailOptions);
    return OTP;
  }
}

module.exports = EmailService;
