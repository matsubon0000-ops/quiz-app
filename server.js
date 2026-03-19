const multer = require("multer");
const csv = require("csv-parser");
const upload = multer({ dest: "uploads/" });

app.post("/upload-questions", upload.single("file"), (req, res) => {
  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => {
      results.push({
        question: data.question,
        choices: [
          data.choice1,
          data.choice2,
          data.choice3,
          data.choice4
        ],
        answer: data.answer
      });
    })
    .on("end", () => {
      fs.writeFileSync("questions.json", JSON.stringify(results, null, 2));
      res.json({ message: "アップロード成功" });
    });
});
const session = require("express-session");
const ADMIN_PASSWORD = "1234";
const fs = require("fs");
let scores = [];

if (fs.existsSync("scores.json")) {
  const data = fs.readFileSync("scores.json");
  scores = JSON.parse(data);
}
const express = require("express");
const app = express();

app.use(express.static("public"));
app.use(express.json());

app.use(session({
  secret: "my-secret-key",
  resave: false,
  saveUninitialized: false
}));

app.post("/admin-login", (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});
app.post("/save-score", (req, res) => {
  const { username, score } = req.body;

  const newScore = {
    username: username,
    score: score
  };

  scores.push(newScore);
fs.writeFileSync("scores.json", JSON.stringify(scores, null, 2));


  console.log("現在の保存データ:", scores);

  res.json({ message: "保存成功！" });
});

app.get("/scores", (req, res) => {

  if (!req.session.isAdmin) {
    return res.status(403).json({ message: "アクセス拒否" });
  }

  res.json(scores);
});
app.delete("/delete-all", (req, res) => {

  if (!req.session.isAdmin) {
    return res.status(403).json({ message: "アクセス拒否" });
  }

  scores = [];
  fs.writeFileSync("scores.json", JSON.stringify(scores));
  res.json({ message: "削除成功" });
});
app.listen(3000, () => {
  console.log("http://localhost:3000");
});