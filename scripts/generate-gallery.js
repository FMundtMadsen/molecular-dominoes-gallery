import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const galleryDir = path.join(__dirname, "../public/gallery");

function isPng(fileName) {
  return fileName.toLowerCase().endsWith(".png");
}

function makeTitle(fileName) {
  return fileName.replace(/\.png$/i, "").replaceAll("_", " ");
}

const data = fs.readdirSync(galleryDir, { withFileTypes: true })
  .map((item) => {
    if (item.isDirectory()) {
      const folderPath = path.join(galleryDir, item.name);
      const images = fs.readdirSync(folderPath).filter(isPng).sort();

      return {
        name: item.name,
        title: makeTitle(item.name),
        type: "folder",
        cover: images.length ? `/gallery/${item.name}/${images[0]}` : null,
        images: images.map((image) => ({
          name: image,
          title: makeTitle(image),
          path: `/gallery/${item.name}/${image}`
        }))
      };
    }

    if (isPng(item.name)) {
      return {
        name: item.name,
        title: makeTitle(item.name),
        type: "file",
        path: `/gallery/${item.name}`
      };
    }

    return null;
  })
  .filter(Boolean)
  .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

fs.writeFileSync(
  path.join(__dirname, "../src/gallery-data.json"),
  JSON.stringify(data, null, 2)
);

console.log("Gallery data generated.");