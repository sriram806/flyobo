import Contact from "../models/contact.model.js";

export const listContacts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const contacts = await Contact.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    const total = await Contact.countDocuments();
    return res.status(200).json({ success: true, data: contacts, pagination: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to load contacts" });
  }
};

export const getContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);
    if (!contact) return res.status(404).json({ success: false, message: "Not found" });
    return res.status(200).json({ success: true, data: contact });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to load contact" });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to delete" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndUpdate(id, { isRead: true }, { new: true });
    return res.status(200).json({ success: true, data: contact });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to mark as read" });
  }
};

export default { listContacts, getContact, deleteContact, markAsRead };
