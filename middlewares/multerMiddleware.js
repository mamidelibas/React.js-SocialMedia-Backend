const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const multerMiddleware = (req, res, next) => {
  upload.fields([{ name: "image", maxCount: 1 }])(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: "Görsel yüklenemedi" });
    } else if (err) {
      return res.status(500).json({ error: "Sunucu hatası" });
    }

    const imageFile =
      req.files && req.files["image"] ? req.files["image"][0] : null;

    req.body.image = imageFile;

    next();
  });
};

module.exports = multerMiddleware;
