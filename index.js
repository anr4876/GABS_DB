const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage: storage });

const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:19006", // 여기에 허용할 도메인 이름을 적으세요.
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post("/upload", upload.single("image"), (req, res) => {
  const newItem = {
    name: req.body.name,
    content: req.body.content,
    imagePath: `/uploads/${req.file.filename}`,
  };

  /* 이 부분에 데이터베이스 로직 추가 (예: 데이터 저장) */

  res.status(200).json({ success: true, item: newItem });
});

app.get("/items", (req, res) => {
  const region = req.query.region; // 쿼리 파라미터를 이용해 지역을 가져옵니다.
  const items = require("./items.js");

  if (region) {
    const filteredItems = items[region]; // 지역으로 필터링된 데이터를 가져옵니다.
    if (filteredItems) {
      res.json({ success: true, items: filteredItems });
    } else {
      res.status(400).json({ success: false, message: "잘못된 지역명입니다" });
    }
  } else {
    res.json({ success: true, items });
  }
});

app.use((req, res, next) => {
  res.status(404).send("Not Found");
});

app.use((error, req, res, next) => {
  console.error("Error fetching items:", error);
  res.status(500).send("Internal Server Error");
});

const hostname = "0.0.0.0";

app.listen(port, hostname, () => {
  console.log(`Server started on http://${hostname}:${port}`);
});
