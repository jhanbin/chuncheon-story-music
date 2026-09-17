require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'songs.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// DB Helper Functions
function getSongs() {
    if (!fs.existsSync(DB_FILE)) {
        return {};
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
}

function saveSong(song) {
    const songs = getSongs();
    songs[song.id] = song;
    fs.writeFileSync(DB_FILE, JSON.stringify(songs, null, 2));
}

// 1. 노래 생성 엔드포인트
app.post('/api/generate-song', async (req, res) => {
    try {
        const { emotion, lyrics, place } = req.body;
        console.log(`[API Request] 감정: ${emotion}, 가사: ${lyrics}, 장소: ${place}`);

        const apiKey = process.env.SUNO_API_KEY;
        const mixingTime = parseInt(process.env.MIXING_TIME_SECONDS || 8) * 1000;
        
        console.log(`[API 연동중...] 요청된 API Key: ${apiKey}`);
        console.log(`음원 믹싱을 위해 ${mixingTime / 1000}초 대기합니다...`);
        
        await new Promise(resolve => setTimeout(resolve, mixingTime));
        
        let audioUrl = null;
        let duration = 60;

        const prompt = `A K-pop style acoustic song about ${place}, feeling ${emotion}. Lyrics: ${lyrics}`;
        
        try {
            console.log("APIFrame (Suno AI)에 노래 생성을 요청합니다...");
            const generateResponse = await axios.post('https://api.apiframe.ai/v2/music/generate', {
                prompt: prompt,
                model: 'suno'
            }, {
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json'
                }
            });

            const jobId = generateResponse.data.id || generateResponse.data.jobId;
            console.log(`작업이 생성되었습니다. Job ID: ${jobId}. 완료를 기다리는 중...`);

            if (!jobId) throw new Error("Job ID를 받지 못했습니다.");

            while (true) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                const pollResponse = await axios.get(`https://api.apiframe.ai/v2/jobs/${jobId}`, {
                    headers: { 'X-API-Key': apiKey }
                });

                const status = pollResponse.data.status;
                console.log(`현재 생성 상태: ${status}...`);

                if (status === 'COMPLETED') {
                    const result = pollResponse.data;
                    let items = result.result || result.data || result;
                    if (!Array.isArray(items)) items = [items];

                    for (const item of items) {
                        if (item) {
                            audioUrl = item.audio_url || item.audioUrl || item.url || item.audio_file;
                            duration = item.duration || 60;
                            if (audioUrl) break;
                        }
                    }
                    
                    if (!audioUrl) {
                        const jsonStr = JSON.stringify(result);
                        const match = jsonStr.match(/https?:\/\/[^"']+\.(mp3|wav|m4a)/i);
                        if (match) audioUrl = match[0];
                    }

                    if (audioUrl) break;
                    else throw new Error("결과는 성공했으나 오디오 URL을 찾을 수 없습니다.");
                } else if (status === 'FAILED') {
                    throw new Error("노래 생성 작업이 실패(FAILED) 처리되었습니다.");
                }
            }
            console.log("노래 생성이 완료되었습니다!", audioUrl);
        } catch (apiError) {
            console.error("실제 API 호출 실패. 모의 음원으로 대체합니다:", apiError.response ? JSON.stringify(apiError.response.data) : apiError.message);
            audioUrl = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3';
            duration = 60;
        }

        // DB에 저장
        const songId = crypto.randomBytes(4).toString('hex'); // ex) 'a1b2c3d4'
        const songData = {
            id: songId,
            emotion,
            lyrics,
            place,
            audioUrl,
            duration,
            createdAt: new Date().toISOString()
        };
        saveSong(songData);

        return res.json({
            success: true,
            songId: songId,
            audioUrl: audioUrl,
            duration: duration
        });

    } catch (error) {
        console.error('Error generating song:', error);
        res.status(500).json({ success: false, error: 'Failed to generate song' });
    }
});

// 2. 특정 노래 정보 가져오기 (공유 링크 접속용)
app.get('/api/song/:id', (req, res) => {
    const songs = getSongs();
    const song = songs[req.params.id];
    if (song) {
        res.json({ success: true, song });
    } else {
        res.status(404).json({ success: false, error: 'Song not found' });
    }
});

// 3. 음원 다운로드 라우트 (Proxy Download)
app.get('/api/download/:id', async (req, res) => {
    const songs = getSongs();
    const song = songs[req.params.id];
    
    if (!song || !song.audioUrl) {
        return res.status(404).send('Song not found');
    }

    try {
        console.log(`[다운로드 요청] ${song.id} - URL: ${song.audioUrl}`);
        // axios를 통해 MP3 파일 스트림을 가져옵니다.
        const response = await axios({
            method: 'GET',
            url: song.audioUrl,
            responseType: 'stream'
        });

        // 파일명 설정 (한글 깨짐 방지를 위해 URI 인코딩)
        const filename = encodeURIComponent(`${song.place}_${song.emotion}.mp3`);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);

        // 클라이언트로 스트림 전송
        response.data.pipe(res);
    } catch (error) {
        console.error('다운로드 프록시 에러:', error.message);
        res.status(500).send('Failed to download audio file');
    }
});

app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🎧 춘천 감성 팝업스토어 서버가 켜졌습니다!`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`========================================`);
});
