import path from "path";
import Layout from "../models/layout.model.js";
import { getFileUrl, deleteFile, getFilenameFromUrl } from "../middleware/multerConfig.js";

/* -----------------------------------------------------------
   CREATE LAYOUT
------------------------------------------------------------*/
export const createLayout = async (req, res) => {
  try {
    const { type } = req.body;
    if (!type) return res.status(400).json({ success: false, message: "Type is required" });

    let newLayout;

    if (type === "FAQ") {
      if (!req.user || req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admins only" });

      let { faq } = req.body;
      if (!faq) return res.status(400).json({ success: false, message: "FAQ items required" });

      if (typeof faq === "string") {
        try { faq = JSON.parse(faq); } catch { }
      }
      if (!Array.isArray(faq)) faq = [faq];

      const faqData = faq.filter(i => i?.question && i?.answer);
      if (faqData.length === 0)
        return res.status(400).json({ success: false, message: "Invalid FAQ items" });

      const existing = await Layout.findOne({ type: "FAQ" });

      if (existing) {
        existing.faq = [...existing.faq, ...faqData];
        await existing.save();
        newLayout = existing;
      } else {
        newLayout = await Layout.create({ type: "FAQ", faq: faqData });
      }
    }

    /* ------------------ HERO ------------------ */
    else if (type === "Hero") {
      if (!req.user || req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admins only" });

      const { destination } = req.body;
      if (!destination)
        return res.status(400).json({ success: false, message: "Destination required" });

      let imageData = [];

      if (req.files?.length > 0) {
        imageData = req.files.map(f => ({ url: getFileUrl(req, f.filename, "hero") }));
      } else {
        let images = req.body.images || [];
        if (typeof images === "string") {
          try { images = JSON.parse(images); } catch {
            images = images.split(",").map(s => s.trim());
          }
        }
        if (!Array.isArray(images) || images.length === 0)
          return res.status(400).json({ success: false, message: "Images required" });

        imageData = images.map(u => ({ url: typeof u === "string" ? u : u.url }));
      }

      newLayout = await Layout.findOneAndUpdate(
        { type: "Hero" },
        {
          type: "Hero",
          hero: {
            images: imageData,
            destinations: [{ name: destination, slug: "", description: "" }],
          },
        },
        { new: true, upsert: true }
      );
    }

    else {
      return res.status(400).json({ success: false, message: `Invalid type: ${type}` });
    }

    return res.status(201).json({ success: true, message: `${type} created`, layout: newLayout });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal error", error: error.message });
  }
};

/* -----------------------------------------------------------
   GET LAYOUT
------------------------------------------------------------*/
export const getLayout = async (req, res) => {
  try {
    const { type } = req.query;

    if (type) {
      const layout = await Layout.findOne({ type }).lean();
      if (!layout) return res.status(404).json({ success: false, message: `${type} not found` });
      return res.status(200).json({ success: true, layout });
    }

    const layouts = await Layout.find({}).lean();
    return res.status(200).json({ success: true, layouts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

/* -----------------------------------------------------------
   EDIT LAYOUT
------------------------------------------------------------*/
export const editLayout = async (req, res) => {
  try {
    const { type } = req.body;
    if (!type) return res.status(400).json({ success: false, message: "Type required" });

    let updatedLayout;

    /* ------------------ FAQ ------------------ */
    if (type === "FAQ") {
      if (req.user.role !== "admin")
        return res.status(403).json({ success: false, message: "Admins only" });

      const layout = await Layout.findOne({ type: "FAQ" });
      if (!layout) return res.status(404).json({ success: false, message: "FAQ layout not found" });

      const { id, question, answer } = req.body;
      if (id || (question && answer && !req.body.faq)) {
        if (!id) return res.status(400).json({ success: false, message: "FAQ ID required for update" });
        if (!question || !answer) return res.status(400).json({ success: false, message: "Both question & answer required" });

        const index = layout.faq.findIndex(item => item._id.toString() === id);
        if (index === -1) return res.status(404).json({ success: false, message: "FAQ item not found" });

        layout.faq[index].question = question;
        layout.faq[index].answer = answer;

        await layout.save();
        updatedLayout = layout;
      } else {
        // New shape: faq can be object or array
        let { faq } = req.body;
        if (!faq) return res.status(400).json({ success: false, message: "FAQ items required" });

        if (typeof faq === 'string') {
          try { faq = JSON.parse(faq); } catch { }
        }
        if (!Array.isArray(faq)) faq = [faq];

        const toUpdate = faq.filter(i => i && (i._id || i.id));
        const toAppend = faq.filter(i => i && !i._id && !i.id).map(i => ({ question: i.question, answer: i.answer }));

        for (const item of toUpdate) {
          const fid = item._id || item.id;
          const idx = layout.faq.findIndex(x => x._id.toString() === fid);
          if (idx !== -1) {
            if (item.question) layout.faq[idx].question = item.question;
            if (item.answer) layout.faq[idx].answer = item.answer;
          }
        }

        if (toAppend.length > 0) {
          const valid = toAppend.filter(i => i.question && i.answer);
          layout.faq = Array.isArray(layout.faq) ? layout.faq.concat(valid) : valid;
        }

        await layout.save();
        updatedLayout = layout;
      }
    }

    /* ------------------ HERO ------------------ */
    else if (type === "Hero") {
      if (!req.user || req.user.role !== "admin")
        return res.status(403).json({ success: false, message: "Admins only" });

      const layout = await Layout.findOne({ type: "Hero" });
      if (!layout) return res.status(404).json({ success: false, message: "Hero not found" });

      // Support JSON updates via `req.body.hero` (images/destinations)
      if (req.body && req.body.hero) {
        let { hero } = req.body;
        if (typeof hero === 'string') {
          try { hero = JSON.parse(hero); } catch { }
        }

        const updatedHero = { ...(layout.hero ? layout.hero.toObject ? layout.hero.toObject() : layout.hero : {}) };

        if (hero.images) {
          let imgs = hero.images;
          if (typeof imgs === 'string') {
            try { imgs = JSON.parse(imgs); } catch { imgs = [imgs]; }
          }
          if (Array.isArray(imgs)) {
            updatedHero.images = imgs.map(u => (typeof u === 'string' ? { url: u } : { url: u.url || '' }));
          }
        }

        if (hero.destinations) {
          let dests = hero.destinations;
          if (typeof dests === 'string') {
            try { dests = JSON.parse(dests); } catch { dests = [dests]; }
          }
          if (Array.isArray(dests)) {
            updatedHero.destinations = dests.map(d => ({ name: d.name || d, slug: d.slug || '', description: d.description || '' }));
          }
        }

        layout.hero = updatedHero;
        await layout.save();
        updatedLayout = layout;
      } else {
        // File upload flow: replace images with uploaded files
        let imageData = layout.hero?.images || [];
        if (req.files?.length > 0) {
          // remove previous uploaded files
          (layout.hero?.images || []).forEach(img => {
            const fname = getFilenameFromUrl(img?.url || '');
            if (fname) deleteFile(path.join(process.cwd(), 'uploads', 'hero', fname));
          });

          imageData = req.files.map(f => ({ url: getFileUrl(req, f.filename, 'hero') }));
        }

        updatedLayout = await Layout.findOneAndUpdate(
          { type: 'Hero' },
          { hero: { images: imageData, destinations: layout.hero?.destinations || [] } },
          { new: true }
        );
      }
    }

    else {
      return res.status(400).json({ success: false, message: "Invalid type" });
    }

    return res.status(200).json({ success: true, message: `${type} updated`, layout: updatedLayout });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal error", error: error.message });
  }
};

/* -----------------------------------------------------------
   DELETE LAYOUT
------------------------------------------------------------*/
export const deleteLayout = async (req, res) => {
  try {
    const { type, id } = req.query;
    if (!type) return res.status(400).json({ success: false, message: "Type required" });

    const layout = await Layout.findOne({ type });
    if (!layout) return res.status(404).json({ success: false, message: `${type} not found` });

    /* Delete specific FAQ item */
    if (type === "FAQ" && id) {
      layout.faq = layout.faq.filter(i => i._id.toString() !== id);
      await layout.save();
      return res.status(200).json({ success: true, message: "FAQ item deleted", layout });
    }

    /* Delete Hero images from server */
    if (type === "Hero") {
      layout.hero?.images?.forEach(img => {
        const fname = getFilenameFromUrl(img.url);
        if (fname) deleteFile(path.join(process.cwd(), "uploads", "hero", fname));
      });
    }

    await Layout.deleteOne({ type });
    return res.status(200).json({ success: true, message: `${type} deleted` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal error", error: error.message });
  }
};
