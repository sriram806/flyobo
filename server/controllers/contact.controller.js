import Contact from "../models/contact.model.js";
import sendMail from "../config/nodemailer.js";
import { SMTP_EMAIL } from "../config/env.js";

// -----------------------------
// CREATE CONTACT + SEND MAIL
// -----------------------------
export const handleContact = async (req, res) => {
  try {
    const { name, email, subject, message, phone } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, Email & Message are required.",
      });
    }

    const saved = await Contact.create({
      name,
      email,
      subject,
      message,
      phone,
    });

    // Email to admin
    await sendMail({
      email: SMTP_EMAIL,
      subject: subject || `New contact message from ${name}`,
      template: "contact",
      data: {
        name,
        email,
        subject,
        message,
        phone,
        id: saved._id,
      },
    });

    // Auto reply to user
    await sendMail({
      email,
      subject: "Thanks for contacting Flyobo",
      template: "contact-ack",
      data: { name },
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: saved,
    });

  } catch (err) {
    console.error("Contact error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to submit message",
    });
  }
};

// -----------------------------
// LIST CONTACTS (Basic Pagination)
// -----------------------------
export const listContacts = async (req, res) => {
  try {
    let { page = 1, limit = 20 } = req.query;

    page = Number(page);
    limit = Number(limit);

    const skip = (page - 1) * limit;

    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments();

    return res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (err) {
    console.error("List error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load contacts",
    });
  }
};

// -----------------------------
// GET SINGLE CONTACT
// -----------------------------
export const getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: contact,
    });

  } catch (err) {
    console.error("Get error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load contact",
    });
  }
};

// -----------------------------
// MARK AS READ
// -----------------------------
export const markAsRead = async (req, res) => {
  try {
    const updated = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updated,
    });

  } catch (err) {
    console.error("Mark read error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to mark as read",
    });
  }
};

// -----------------------------
// UPDATE STATUS
// -----------------------------
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "in-progress", "resolved", "closed"];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const updated = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("Update status error:", err);
    return res.status(500).json({ success: false, message: "Failed to update status" });
  }
};

// -----------------------------
// DELETE CONTACT
// -----------------------------
export const deleteContact = async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
    });

  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete contact",
    });
  }
};
