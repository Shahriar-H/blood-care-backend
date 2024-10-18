const nodemailer = require("nodemailer");

const emailsender=async (details)=>{
  const {email,message,subject} = details || {};
  // let testAccount = await nodemailer.createTestAccount();

  //emailTemplate
  

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "zas71.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'tourbd@zas71.com', // generated ethereal user
      pass: 'tourbd2024', // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `"Village Tour BD" <no-replay@zas71.com>`, // sender address
    to: `${email},shakisk23@gmail.com`, // list of receivers
    subject: subject, // Subject line
    // text: message, // plain text body
    html: message, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  return {message:"Email send success!"}
  // Preview only available when sending through an Ethereal account
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...




}
// emailsender().catch(console.error);

module.exports =  {emailsender}