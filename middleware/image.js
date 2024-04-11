import { createRequire } from "module";
const require = createRequire(import.meta.url);
const data = require("../misc.json");
const isBase64 = require("is-base64");

function checkSignature(b64) {
  for (const sign in data.base64signatures) {
    if (b64.startsWith(sign)) {
      return data.base64signatures[sign];
    }
  }
  return "";
}

export async function removeBase64Info(req, res, next) {
  try {
    let info = req.body.image_url;
    let result = await info.split(",").pop();
    req.body.image_url = result;
    next();
  } catch (error) {
    return res.status(400).json({ message: "Bad Request" });
  }
}

export function validateBase64String(req, res, next) {
  let image = req.body.image_url;
  if (checkSignature(image) === "" || !isBase64(image)) {
    return res.status(400).json({ message: "Bad Request" });
  }
  next();
}
