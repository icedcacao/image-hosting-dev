import express from "express";
import sharp from "sharp";
import fs from "fs";
import morgan from "morgan";
import "dotenv/config";

import { checkApi } from "./middleware/auth.js";
import { validateBase64String, removeBase64Info } from "./middleware/image.js";
import { createFilename } from "./utils/createFilename.js";
import path from "path";

const app = express();

app.use(express.json({ limit: "100mb" }));
app.use(express.static("public"));
app.use(morgan("tiny"));

// Body schema
// {
//   image_url: "";
//   file_name: "";
//   resize_width: "";
//   resize_height: "";
// }

// Enforcing the size of the image

app.post(
  "/image",
  checkApi,
  removeBase64Info,
  validateBase64String,
  (req, res) => {
    try {
      let fileName = req.body.file_name || createFilename();
      fileName += ".png";
      let imageBuffer = Buffer.from(req.body.image_url, "base64");
      sharp(imageBuffer)
        .resize(req.body.resize_width, req.body.resize_height)
        .png()
        .toFile(`./public/${fileName}`)
        .then((info) => {
          return res.status(200).json({ image_url: fileName });
        })
        .catch((err) => {
          return res.status(500).json({ message: "Internal Server Error" });
        });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

app.delete("/image/:image_url", checkApi, async (req, res) => {
  try {
    fs.unlink(path.join(".", "public", req.params.image_url), (err) => {
      if (err && err.code == "ENOENT") {
        return res.status(404).json({ message: "Not Found" });
      } else {
        return res
          .status(200)
          .json({ message: `Sucessfully delete ${req.params.image_url}` });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(process.env.PORT, function (err) {
  if (err) console.log(err);
  console.log(`Server is running at ${process.env.PORT}`);
});
