const emotions = [
    { id: 'joy', name: '벅차오르는 설렘', icon: 'fa-face-laugh-beam' },
    { id: 'calm', name: '잔잔한 평온함', icon: 'fa-mug-hot' },
    { id: 'comfort', name: '따뜻한 위로', icon: 'fa-hand-holding-heart' },
    { id: 'romantic', name: '아련한 그리움', icon: 'fa-heart' },
    { id: 'dawn', name: '몽환적인 새벽', icon: 'fa-moon' },
    { id: 'refreshing', name: '시원한 청량감', icon: 'fa-wind' },
    { id: 'fluttering', name: '로맨틱한 떨림', icon: 'fa-wand-magic-sparkles' },
    { id: 'lonely', name: '쓸쓸한 고독', icon: 'fa-leaf' },
    { id: 'freedom', name: '신나는 해방감', icon: 'fa-dove' }
];

const lines = [
    { id: 'l1', text: '점순이가 닭싸움을 붙이던 그 봄날처럼, 내 마음에도 붉은 동백꽃이 피어납니다.' },
    { id: 'l2', text: '해 저무는 소양강에 비 내리던 날, 그리운 처녀의 애틋한 마음이 물결칩니다.' },
    { id: 'l3', text: '첫눈이 내리던 메타세쿼이아 숲길에서, 우리의 겨울은 영원한 이야기로 남습니다.' },
    { id: 'l4', text: '잔잔한 호숫가에 별빛이 쏟아지면, 작은 나룻배에 내 위로를 띄워 보냅니다.' },
    { id: 'l5', text: '물안개 피어오르는 고요한 의암호, 잊고 있던 작은 꿈들이 다시 숨 쉬기 시작합니다.' },
    { id: 'l6', text: '푸른 바람이 스쳐가는 청평사 숲길, 흔들리는 풍경 소리에 내 번뇌를 내려놓습니다.' },
    { id: 'l7', text: '자전거 바퀴가 구르는 북한강길, 시원한 바람이 지나간 청춘을 싣고 달립니다.' },
    { id: 'l8', text: '달빛이 내려앉은 육림고개 골목길, 오래된 가로등 밑에서 조용히 너를 기다립니다.' },
    { id: 'l9', text: '발아래 펼쳐진 구봉산의 맑은 밤하늘, 지나간 추억의 한 페이지를 넘겨봅니다.' }
];

const places = [
    { id: 'kimyoujeong', name: '김유정문학촌', image: 'assets/kimyoujeong_village_1785911963974.jpg' },
    { id: 'soyanggang', name: '소양강 스카이워크', image: 'assets/soyanggang_river_1785911954588.jpg' },
    { id: 'nami', name: '남이섬', image: 'assets/nami_island_1785911972656.jpg' },
    { id: 'gongjicheon', name: '공지천', image: 'assets/gongjicheon_1785911982114.jpg' },
    { id: 'uiamho', name: '의암호 호수길', image: 'assets/uiamho_lake_1785994431415.jpg' },
    { id: 'cheongpyeongsa', name: '청평사', image: 'https://images.unsplash.com/photo-1517427840134-84615a1c179c?q=80&w=600&auto=format&fit=crop' },
    { id: 'gubongsan', name: '구봉산 카페거리', image: 'https://images.unsplash.com/photo-1510525009512-ad7fc13eefab?q=80&w=600&auto=format&fit=crop' },
    { id: 'samaksan', name: '삼악산 케이블카', image: 'https://images.unsplash.com/photo-1549420807-6f78816c49bc?q=80&w=600&auto=format&fit=crop' },
    { id: 'yukrimgogae', name: '육림고개', image: 'https://images.unsplash.com/photo-1515091943-9d5c0ad475af?q=80&w=600&auto=format&fit=crop' }
];

// State
let selectedEmotion = null;
let selectedLine = null;
let selectedPlace = null;
let currentSongId = null;

let audioPlayer = null;
let isPlaying = false;

// Init
document.addEventListener('DOMContentLoaded', async () => {
    renderEmotions();
    renderLines();
    renderPlaces();

    // 공유 링크로 접속했는지 확인 (?songId=...)
    const urlParams = new URLSearchParams(window.location.search);
    const songId = urlParams.get('songId');

    if (songId) {
        await loadSharedSong(songId);
    }
});

// Step Nav
function nextStep(stepIndex) {
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    document.getElementById(`step-${stepIndex}`).classList.add('active');

    if (stepIndex === 3 && selectedPlace) {
        document.getElementById('bg-container').style.backgroundImage = `url('${selectedPlace.image}')`;
    }
}

// Render
function renderEmotions() {
    const grid = document.getElementById('emotion-grid');
    emotions.forEach(emo => {
        const card = document.createElement('div');
        card.className = 'emotion-card';
        card.onclick = () => selectEmotion(emo, card);
        card.innerHTML = `<i class="fa-solid ${emo.icon}"></i><h3>${emo.name}</h3>`;
        grid.appendChild(card);
    });
}

function renderLines() {
    const grid = document.getElementById('line-grid');
    lines.forEach(line => {
        const card = document.createElement('div');
        card.className = 'sentence-card';
        card.onclick = () => selectLine(line, card);
        card.textContent = line.text;
        grid.appendChild(card);
    });
}

function renderPlaces() {
    const grid = document.getElementById('place-grid');
    places.forEach(place => {
        const card = document.createElement('div');
        card.className = 'place-card';
        card.onclick = () => selectPlace(place, card);
        card.innerHTML = `<img src="${place.image}" alt="${place.name}"><h3>${place.name}</h3>`;
        grid.appendChild(card);
    });
}

// Selection
function selectEmotion(emo, element) {
    selectedEmotion = emo;
    document.querySelectorAll('#emotion-grid .emotion-card').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    document.getElementById('btn-step-1').disabled = false;
}

function selectLine(line, element) {
    selectedLine = line;
    document.querySelectorAll('#line-grid .sentence-card').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    document.getElementById('btn-step-2').disabled = false;
}

function selectPlace(place, element) {
    selectedPlace = place;
    document.querySelectorAll('#place-grid .place-card').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    document.getElementById('btn-step-3').disabled = false;
    document.getElementById('bg-container').style.backgroundImage = `url('${place.image}')`;
}

// Generation Logic (API Call to Backend)
async function startGeneration() {
    if (!selectedEmotion || !selectedLine || !selectedPlace) return;
    
    // Show Loading
    nextStep(4);

    try {
        const response = await fetch('/api/generate-song', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                emotion: selectedEmotion.name,
                lyrics: selectedLine.text,
                place: selectedPlace.name
            })
        });

        const data = await response.json();

        if (data.success) {
            currentSongId = data.songId; // DB에 저장된 고유 ID
            setupPlayer(data.audioUrl);
            nextStep(5);
            // auto play
            setTimeout(togglePlay, 500); 
        } else {
            alert('노래 생성에 실패했습니다.');
            nextStep(3);
        }
    } catch (error) {
        console.error('API 연동 오류:', error);
        alert('서버와 연결할 수 없습니다. 백엔드 서버가 켜져 있는지 확인해주세요.');
        nextStep(3);
    }
}

// 공유 링크 접속 시 데이터 로드 로직
async function loadSharedSong(songId) {
    try {
        const response = await fetch(`/api/song/${songId}`);
        const data = await response.json();
        
        if (data.success) {
            const song = data.song;
            currentSongId = song.id;
            
            // 데이터 매칭 (배경 등을 설정하기 위함)
            selectedPlace = places.find(p => p.name === song.place) || places[3];
            selectedEmotion = { name: song.emotion };
            selectedLine = { text: song.lyrics };
            
            document.getElementById('bg-container').style.backgroundImage = `url('${selectedPlace.image}')`;
            
            // UI에 홈 버튼 텍스트 변경
            document.getElementById('reset-btn').textContent = "새로 만들기";
            
            setupPlayer(song.audioUrl);
            nextStep(5); // 곧바로 플레이어 화면으로 이동
        } else {
            alert("존재하지 않거나 삭제된 노래입니다.");
            window.location.search = ""; // 파라미터 초기화
        }
    } catch (error) {
        console.error("공유된 노래 불러오기 실패:", error);
    }
}

function setupPlayer(audioUrl) {
    // Set UI
    const cover = document.getElementById('album-cover');
    cover.innerHTML = `<img src="${selectedPlace.image}" alt="cover">`;
    
    // Create Song Title
    const title = `${selectedEmotion.name.split(' ')[0]} ${selectedPlace.name}의 노래`;
    document.getElementById('song-title').textContent = title;

    // Set Lyrics
    const parts = selectedLine.text.split(', ');
    document.getElementById('lyric-line1').textContent = parts[0] + (parts.length > 1 ? ',' : '');
    document.getElementById('lyric-line2').textContent = parts[1] || '';
    
    // Setup Audio
    if (audioPlayer) {
        audioPlayer.pause();
    }
    audioPlayer = new Audio(audioUrl);
    
    // Listeners for progress
    audioPlayer.addEventListener('timeupdate', updateProgressUI);
    audioPlayer.addEventListener('ended', resetPlayerState);

    resetPlayerState();
}

function resetPlayerState() {
    isPlaying = false;
    document.getElementById('play-btn').innerHTML = `<i class="fa-solid fa-play"></i>`;
    document.getElementById('album-cover').classList.remove('playing');
    if(audioPlayer) {
        audioPlayer.currentTime = 0;
    }
    updateProgressUI();
}

// Player Controls
function togglePlay() {
    if (!audioPlayer) return;

    const playBtn = document.getElementById('play-btn');
    const cover = document.getElementById('album-cover');

    if (audioPlayer.paused) {
        audioPlayer.play();
        isPlaying = true;
        playBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
        cover.classList.add('playing');
    } else {
        audioPlayer.pause();
        isPlaying = false;
        playBtn.innerHTML = `<i class="fa-solid fa-play"></i>`;
        cover.classList.remove('playing');
    }
}

function updateProgressUI() {
    if (!audioPlayer) return;

    const currentSeconds = Math.floor(audioPlayer.currentTime) || 0;
    const totalSeconds = Math.floor(audioPlayer.duration) || 60;

    const min = Math.floor(currentSeconds / 60);
    const sec = currentSeconds % 60;
    document.getElementById('current-time').textContent = `${min}:${sec.toString().padStart(2, '0')}`;
    
    const totalMin = Math.floor(totalSeconds / 60);
    const totalSec = totalSeconds % 60;
    document.getElementById('total-time').textContent = `${totalMin}:${totalSec.toString().padStart(2, '0')}`;

    const percent = (audioPlayer.currentTime / totalSeconds) * 100;
    document.getElementById('progress-bar').style.width = `${percent || 0}%`;

    // Highlight lyrics dynamically based on progress percent
    if (percent > 10 && percent < 40) {
        document.getElementById('lyric-line1').classList.add('active');
        document.getElementById('lyric-line2').classList.remove('active');
    } else if (percent >= 40 && percent < 90) {
        document.getElementById('lyric-line1').classList.remove('active');
        document.getElementById('lyric-line2').classList.add('active');
    } else {
        document.getElementById('lyric-line1').classList.remove('active');
        document.getElementById('lyric-line2').classList.remove('active');
    }
}

function seek(e) {
    if (!audioPlayer) return;
    const rect = e.target.closest('.progress-bar-bg').getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioPlayer.currentTime = percent * audioPlayer.duration;
    updateProgressUI();
}

function resetApp() {
    if(audioPlayer) {
        audioPlayer.pause();
        audioPlayer = null;
    }
    resetPlayerState();
    selectedEmotion = null;
    selectedLine = null;
    selectedPlace = null;
    currentSongId = null;
    
    // URL 파라미터 지우기 (새로 만들기를 위함)
    window.history.pushState({}, '', '/');
    
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    document.getElementById('btn-step-1').disabled = true;
    document.getElementById('btn-step-2').disabled = true;
    document.getElementById('btn-step-3').disabled = true;
    
    document.getElementById('bg-container').style.backgroundImage = `url('assets/gongjicheon_1785911982114.jpg')`;
    
    nextStep(0); 
}

function downloadSong() {
    if (!currentSongId) return alert("다운로드할 음원이 없습니다.");
    // 백엔드의 다운로드 프록시 라우트로 이동 (자동 다운로드 됨)
    window.location.href = `/api/download/${currentSongId}`;
}

async function shareSong() {
    if (!currentSongId) return alert("공유할 음원이 없습니다.");
    
    const shareUrl = `${window.location.origin}/?songId=${currentSongId}`;
    
    try {
        await navigator.clipboard.writeText(shareUrl);
        alert(`🎵 진짜 링크가 복사되었습니다!\n친구에게 이 링크를 보내면 똑같은 음악을 들려줄 수 있습니다.\n\n${shareUrl}`);
    } catch (err) {
        // 복사 실패 폴백
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("Copy");
        textArea.remove();
        alert(`🎵 링크가 복사되었습니다!\n친구에게 붙여넣기 해보세요.\n${shareUrl}`);
    }
}
