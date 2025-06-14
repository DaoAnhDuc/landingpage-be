const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Middleware để parse form-data
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.get("/api/banner", (req, res) => {
  const dataPath = "banner.json";

  if (!fs.existsSync(dataPath)) {
    return res.json([]);
  }

  try {
    const content = fs.readFileSync(dataPath, "utf8");
    const banners = JSON.parse(content);
    res.json(banners);
  } catch (err) {
    console.log(err);

    res.status(500).json({ error: "Lỗi đọc dữ liệu banner." });
  }
});

app.post("/api/banner", upload.single("background"), (req, res) => {
  const { text1, text2, text3 } = req.body;
  const background = req.background;

  if (!text1 || !text2 || !text3 || !file) {
    return res.status(400).json({ error: "Thiếu thông tin đầu vào." });
  }

  const newBanner = {
    id: uuidv4(),
    text1,
    text2,
    text3,
    background: background.path,
    createdAt: new Date().toISOString(),
  };

  const dataPath = "banner.json";
  let currentData = [];

  if (fs.existsSync(dataPath)) {
    const fileContent = fs.readFileSync(dataPath, "utf8");
    try {
      currentData = JSON.parse(fileContent);
    } catch (e) {
      currentData = [];
    }
  }

  currentData.push(newBanner);

  fs.writeFileSync(dataPath, JSON.stringify(currentData, null, 2));

  res.json({ message: "Update banner thành công!", banner: newBanner });
});

app.put("/api/banner/:id", upload.single("background"), (req, res) => {
  const { id } = req.params;
  const { text1, text2, text3 } = req.body;
  const backgroundFile = req.file;
  console.log(req);

  const bannerFile = "banner.json";
  if (!fs.existsSync(bannerFile)) {
    return res.status(404).json({ error: "banners file not found" });
  }

  const rawData = fs.readFileSync(bannerFile);
  let banners = JSON.parse(rawData);

  const bannerIndex = banners.findIndex((banners) => String(banners.id) === String(id));
  if (bannerIndex === -1) {
    return res.status(404).json({ error: "banners not found" });
  }

  // Update các trường nếu có
  banners[bannerIndex].text1 = text1;
  banners[bannerIndex].text2 = text2;
  banners[bannerIndex].text3 = text3;

  // Nếu có file background mới, thay đổi và xóa file cũ (nếu muốn)
  if (backgroundFile) {
    // Xóa file cũ nếu cần (nên thêm xử lý an toàn)
    const oldBackground = banners[bannerIndex].background;
    if (oldBackground && fs.existsSync(oldBackground)) {
      fs.unlinkSync(oldBackground);
    }

    banners[bannerIndex].background = backgroundFile.path;
  }

  banners[bannerIndex].updatedAt = new Date().toISOString();

  // Ghi lại file JSON
  fs.writeFileSync(bannerFile, JSON.stringify(banners, null, 2), "utf-8");

  res.status(200).json({ message: "Banner updated successfully", banners: banners[bannerIndex] });
});

// ABOUT US
app.get("/api/about-us", (req, res) => {
  const dataPath = "about-us.json";

  if (!fs.existsSync(dataPath)) {
    return res.json(null);
  }

  try {
    const content = fs.readFileSync(dataPath, "utf8");
    const aboutUs = JSON.parse(content);
    res.json(aboutUs);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error get about us!" });
  }
});

app.put("/api/about-us", upload.single("image"), (req, res) => {
  const { title, description } = req.body;
  const backgroundFile = req.file;

  const aboutUsFile = "about-us.json";
  if (!fs.existsSync(aboutUsFile)) {
    return res.status(404).json({ error: "aboutUs file not found" });
  }

  const rawData = fs.readFileSync(aboutUsFile);
  let aboutUs = JSON.parse(rawData);
  aboutUs.title = title;
  aboutUs.description = description;

  // Nếu có file background mới, thay đổi và xóa file cũ (nếu muốn)
  if (backgroundFile) {
    // Xóa file cũ nếu cần (nên thêm xử lý an toàn)
    const oldBackground = aboutUs.image;
    if (oldBackground && fs.existsSync(oldBackground)) {
      fs.unlinkSync(oldBackground);
    }

    aboutUs.image = backgroundFile.path;
  }

  aboutUs.updatedAt = new Date().toISOString();
  // Ghi lại file JSON
  fs.writeFileSync(aboutUsFile, JSON.stringify(aboutUs, null, 2), "utf-8");

  res.status(200).json({ message: "About Us updated successfully", aboutUs: aboutUs });
});

// OUR VISION
app.get("/api/our-vision", (req, res) => {
  const dataPath = "our-vision.json";
  if (!fs.existsSync(dataPath)) {
    return res.json(null);
  }
  try {
    const content = fs.readFileSync(dataPath, "utf8");
    const ourVision = JSON.parse(content);
    res.json(ourVision);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error get about us!" });
  }
});
app.put("/api/our-vision", (req, res) => {
  const { title, description, data } = req.body;

  const ourVisionFile = "our-vision.json";
  if (!fs.existsSync(ourVisionFile)) {
    return res.status(404).json({ error: "aboutUs file not found" });
  }

  const rawData = fs.readFileSync(ourVisionFile);
  let ourVision = JSON.parse(rawData);
  ourVision.title = title;
  ourVision.description = description;
  ourVision.data = data;
  ourVision.updatedAt = new Date().toISOString();
  // Ghi lại file JSON
  fs.writeFileSync(ourVisionFile, JSON.stringify(ourVision, null, 2), "utf-8");

  res.status(200).json({ message: "About Us updated successfully", ourVision: ourVision });
});

// OUR VISION
app.get("/api/product-list", (req, res) => {
  const dataPath = "product-list.json";
  if (!fs.existsSync(dataPath)) {
    return res.json(null);
  }
  try {
    const content = fs.readFileSync(dataPath, "utf8");
    const productList = JSON.parse(content);
    res.json(productList);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error get about us!" });
  }
});

app.put("/api/product-list", (req, res) => {
  const { title, description, data } = req.body;

  const productListFile = "product-list.json";
  if (!fs.existsSync(productListFile)) {
    return res.status(404).json({ error: "product-list file not found" });
  }

  const rawData = fs.readFileSync(productListFile);
  let productList = JSON.parse(rawData);
  productList.title = title;
  productList.description = description;
  productList.data = data;
  productList.updatedAt = new Date().toISOString();
  // Ghi lại file JSON
  fs.writeFileSync(productListFile, JSON.stringify(productList, null, 2), "utf-8");

  res.status(200).json({ message: "productList updated successfully", productList: productList });
});

// OUR VISION
app.get("/api/partner", (req, res) => {
  const dataPath = "partner.json";
  if (!fs.existsSync(dataPath)) {
    return res.json(null);
  }
  try {
    const content = fs.readFileSync(dataPath, "utf8");
    const partner = JSON.parse(content);
    res.json(partner);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error get about us!" });
  }
});

app.post("/api/partner", upload.single("imagePath"), (req, res) => {
  const { position } = req.body;
  const imagePath = req.file;
  const dataPath = "partner.json";

  if (!imagePath) {
    return res.status(400).json({ message: "Missing imagePath or position" });
  }

  let data = JSON.parse(fs.readFileSync(dataPath));

  if (position < 0 || position > data.length) {
    return res.status(400).json({ message: "Invalid position" });
  }

  data.splice(position, 0, imagePath.path);
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

  res.json({ message: "Image inserted successfully", data });
});

app.delete("/api/partner/:index", (req, res) => {
  const index = parseInt(req.params.index);
  if (isNaN(index)) return res.status(400).json({ message: "Invalid index" });

  const dataPath = "partner.json";
  let data = JSON.parse(fs.readFileSync(dataPath));

  if (index < 0 || index >= data.length) {
    return res.status(404).json({ message: "Index out of range" });
  }

  const imagePath = path.join(__dirname, data[index]);

  // Xóa file nếu tồn tại
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  // Xóa dòng trong JSON
  data.splice(index, 1);
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

  res.json({ message: "Đã xóa ảnh thành công", removedIndex: index });
});

// API login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  let users = [];
  try {
    const data = fs.readFileSync("user.json");
    users = JSON.parse(data);
  } catch (err) {
    console.error("Lỗi đọc file user.json:", err);
  }
  const user = users.find((u) => u.username === username && u.password === password);

  if (user) {
    res.status(200).json({ message: "Đăng nhập thành công!" });
  } else {
    res.status(401).json({ message: "Sai username hoặc password" });
  }
});

app.get("/api/contact-us", (req, res) => {
  const dataPath = "contact-us.json";
  if (!fs.existsSync(dataPath)) {
    return res.json(null);
  }
  try {
    const content = fs.readFileSync(dataPath, "utf8");
    const contactUs = JSON.parse(content);
    res.json(contactUs);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error get about us!" });
  }
});

app.put("/api/contact-us", (req, res) => {
  const { title, description, data } = req.body;

  const contactUsFile = "contact-us.json";
  if (!fs.existsSync(contactUsFile)) {
    return res.status(404).json({ error: "contact-us file not found" });
  }

  const rawData = fs.readFileSync(contactUsFile);
  let contacUs = JSON.parse(rawData);
  contacUs.title = title;
  contacUs.description = description;
  contacUs.data = data;
  contacUs.updatedAt = new Date().toISOString();
  // Ghi lại file JSON
  fs.writeFileSync(contactUsFile, JSON.stringify(contacUs, null, 2), "utf-8");

  res.status(200).json({ message: "contact-us updated successfully", contacUs: contacUs });
});

app.get("/api/footer", (req, res) => {
  const dataPath = "footer.json";
  if (!fs.existsSync(dataPath)) {
    return res.json(null);
  }
  try {
    const content = fs.readFileSync(dataPath, "utf8");
    const footer = JSON.parse(content);
    res.json(footer);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error get about us!" });
  }
});

app.put("/api/footer", (req, res) => {
  const footerFile = "footer.json";
  if (!fs.existsSync(footerFile)) {
    return res.status(404).json({ error: "product-list file not found" });
  }

  const rawData = fs.readFileSync(footerFile);
  let footer = JSON.parse(rawData);
  footer = {
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  // Ghi lại file JSON
  fs.writeFileSync(footerFile, JSON.stringify(footer, null, 2), "utf-8");

  res.status(200).json({ message: "footer updated successfully", footer: footer });
});

// API: GET /get?name=file.json
app.post('/get-data', (req, res) => {
  const fileName = req.body.name + ".json"

  if (!fileName) {
    return res.status(400).json({ error: 'Thiếu tên file (name).' });
  }

  // Đảm bảo chỉ đọc file trong thư mục "data" và không đi ra ngoài
  const filePath = path.join(__dirname, 'data', path.basename(fileName));

  fs.readFile(filePath, 'utf8', (err, fileContent) => {
    if (err) {
      return res.status(404).json({ error: 'Không tìm thấy hoặc không thể đọc file.' });
    }

    try {
      const jsonData = JSON.parse(fileContent);
      res.json(jsonData);
    } catch (parseError) {
      res.status(500).json({ error: 'File không phải là JSON hợp lệ.' });
    }
  });
});


app.post('/api/ve-chung-toi', upload.fields([
  { name: 'background', maxCount: 1 },
  { name: 'backgroundSub', maxCount: 1 }
]), (req, res) => {
  try {
    let newData = req.body;

    // Parse checklist nếu là string
    if (typeof newData.checkList === 'string') {
      newData.checkList = JSON.parse(newData.checkList);
    }

    const filePath = './data/ve-chung-toi.json';
    let oldData = {};
    if (fs.existsSync(filePath)) {
      oldData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    // Nếu không có req.files, gán là {}
    const files = req.files || {};

    // background
    if (files.background && files.background.length > 0) {
      newData.background = files.background[0].path;
    } else {
      newData.background = oldData.background || '';
    }

    // backgroundSub
    if (files.backgroundSub && files.backgroundSub.length > 0) {
      newData.backgroundSub = files.backgroundSub[0].path;
    } else {
      newData.backgroundSub = oldData.backgroundSub || '';
    }

    fs.writeFileSync(filePath, JSON.stringify(newData, null, 2), 'utf-8');

    res.json({ message: 'Lưu thành công', data: newData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi lưu dữ liệu', error: err.message });
  }
});

const buildPath = path.join(__dirname, "client", "build");
app.use(express.static(buildPath));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// Server chạy
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
