import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = req.body;

    if (!data || !data.state) {
      return res.status(400).json({ error: "Invalid project data" });
    }

    // Buat nama file unik
    const fileName = `geber-project-${Date.now()}.json`;
    const filePath = path.join("/tmp", fileName); // Vercel hanya boleh tulis ke /tmp

    // Simpan file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    // Kembalikan URL download (file di /tmp bisa diakses hanya sementara via redirect)
    // Solusi sederhana: kita kembalikan data sebagai blob base64 agar bisa di-download langsung di frontend
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const base64Data = Buffer.from(fileContent).toString("base64");

    // URL custom untuk download via data URI
    const downloadUrl = `data:application/json;base64,${base64Data}`;

    return res.status(200).json({ url: downloadUrl });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
