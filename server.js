// Norskly v6 server: TTS + Preload
import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import url from "url";
import crypto from "crypto";
import OpenAI from "openai";

dotenv.config();
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const app = express();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

const audioDir = path.join(__dirname, "public", "audio");
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

function idFor(text, voice="alloy", lang="nb-NO"){
  return crypto.createHash("sha1").update(`${lang}|${voice}|${text}`).digest("hex");
}
function mp3Path(id){ return path.join(audioDir, `${id}.mp3`); }
function mp3Url(id){ return `/audio/${id}.mp3`; }

app.get("/api/tts", async (req, res) => {
  try {
    const text = String(req.query.text || "").trim();
    if (!text) return res.status(400).json({ ok:false, error:"Missing text" });
    const voice = String(req.query.voice || "alloy").trim();
    const lang = String(req.query.lang || "nb-NO").trim();
    const id = idFor(text, voice, lang);
    const out = mp3Path(id);
    if (fs.existsSync(out)) return res.json({ ok:true, url: mp3Url(id), cached:true });

    const r = await client.audio.speech.create({ model: "gpt-4o-mini-tts", voice, input: text, format: "mp3" });
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(out, buf);
    res.json({ ok:true, url: mp3Url(id), cached:false });
  } catch (e) {
    console.error("TTS error", e);
    res.status(500).json({ ok:false, error:"TTS failed" });
  }
});

app.post("/api/preload", async (req, res) => {
  try {
    const { unit, voice="alloy", lang="nb-NO" } = req.body || {};
    if (!unit) return res.status(400).json({ ok:false, error:"Missing unit slug" });
    const lessonsPath = path.join(__dirname, "public", "lessons.json");
    const lessons = JSON.parse(fs.readFileSync(lessonsPath, "utf-8"));
    const u = lessons.units.find(x => x.slug === unit);
    if (!u) return res.status(404).json({ ok:false, error:"Unit not found" });
    const texts = new Set();
    (u.cards || []).forEach(c => c.nb && texts.add(c.nb));
    (u.dialogue || []).forEach(d => d.nb && texts.add(d.nb));
    (u.readings || []).forEach(r => r.nb && texts.add(r.nb));
    (u.grammar?.examples || []).forEach(g => g.nb && texts.add(g.nb));
    const toDo = Array.from(texts);
    const results = [];
    for (const t of toDo) {
      const id = idFor(t, voice, lang);
      const out = mp3Path(id);
      if (fs.existsSync(out)) { results.push({ text:t, url: mp3Url(id), cached:true }); continue; }
      try {
        const r = await client.audio.speech.create({ model: "gpt-4o-mini-tts", voice, input: t, format: "mp3" });
        const buf = Buffer.from(await r.arrayBuffer());
        fs.writeFileSync(out, buf);
        results.push({ text:t, url: mp3Url(id), cached:false });
      } catch (err) {
        console.error("Preload TTS failed for:", t, err);
        results.push({ text:t, error:true });
      }
      await new Promise(r => setTimeout(r, 120));
    }
    res.json({ ok:true, count: results.length, results });
  } catch (e) {
    console.error("Preload error", e);
    res.status(500).json({ ok:false, error:"Preload failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Norskly v6 running on http://localhost:${PORT}`));
