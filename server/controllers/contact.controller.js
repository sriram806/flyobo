import { SMTP_EMAIL } from "../config/env.js";
import sendMail from "../config/nodemailer.js";
import Contact from "../models/contact.model.js";

export const handleContact = async (req, res) => {
  try {
    const { name, email, subject, message, phone } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Please provide name, email and message." });
    }

    // Persist message to database before sending emails
    const saved = await Contact.create({ name, email, subject, message, phone });

    await sendMail({
      email: SMTP_EMAIL,
      subject: subject || `New contact message from ${name}`,
      template: "contact",
      data: { name, email, subject, message, phone, id: saved._id }
    });

    // Send acknowledgement to user (non-blocking - errors logged by sendMail)
    await sendMail({
      email,
      subject: "Thanks for contacting Flyobo",
      template: "contact-ack",
      data: { name }
    });

    return res.status(200).json({ success: true, message: "Your message has been sent. We'll get back to you soon." });
  } catch (err) {
    console.error("Contact handler error:", err);
    return res.status(500).json({ success: false, message: "Failed to send your message. Please try again later." });
  }
};

export default handleContact;
