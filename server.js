import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.VITE_SUNO_API_KEY || process.env.SUNO_API_KEY || 'afk_4c1bbccf7b0eea1d6c495d2cf9924cbac73fffe4';

app.use(cors());
app.use(express.json());

// Serve static frontend files after build if dist exists
app.use(express.static(path.join(__dirname, 'dist')));

// API Proxy Route for Suno AI Generation
app.post('/api/generate-suno', async (req, res) => {
  try {
    const { emotion, place, lyrics } = req.body;
    const prompt = `A Korean emotional acoustic song about ${place}, feeling ${emotion}. Lyrics: ${lyrics}`;

    console.log(`[Suno AI Proxy] Generating song for ${place} (${emotion})...`);
    console.log(`[Prompt] ${prompt}`);

    const generateResponse = await fetch('https://api.apiframe.ai/v2/music/generate', {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        model: 'suno'
      })
    });

    const data = await generateResponse.json();
    console.log('[Suno AI Response]', data);

    if (data.id || data.jobId) {
      return res.json({ success: true, jobId: data.id || data.jobId });
    } else {
      return res.status(400).json({ success: false, error: data.message || 'Job ID missing', data });
    }
  } catch (error) {
    console.error('[Suno AI Proxy Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Proxy Route for Checking Job Status
app.get('/api/suno-status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const statusResponse = await fetch(`https://api.apiframe.ai/v2/jobs/${jobId}`, {
      headers: {
        'X-API-Key': API_KEY
      }
    });

    const data = await statusResponse.json();
    return res.json(data);
  } catch (error) {
    console.error('[Suno Status Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🎧 춘천 문학 팝업스토어 Suno AI 서버 가동 중!`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`========================================`);
});
