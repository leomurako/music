// script.js (playlist対応版)

const music = document.getElementById('music');
window.music = music; // index.html の inline oninput 互換のためグローバルに配置

const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const seekbar = document.querySelector('.seekbar');
const currentTime = document.querySelector('.current-time');
const duration = document.querySelector('.duration');

const titleEl = document.getElementById('title');
const singerEl = document.getElementById('singer');
const coverImg = document.getElementById('coverImg');
const playlistEl = document.getElementById('playlist');

const volumeRange = document.querySelector('.volume-range');
const volumeDown = document.querySelector('.volume-down');
const volumeUp = document.querySelector('.volume-up');
const volIcon = document.querySelector('.volume');
const volBox = document.querySelector('.volume-box');
const favIcon = document.querySelector('.favorite');
const repIcon = document.querySelector('.repeat');

// プレイリスト（必要に応じてパスや項目を編集）
// color1 / color2 は背景グラデーションのフォールバック色として使えます（画像抽出に失敗した場合に利用）
const tracks = [
  { title: "Walking with you", singer: "Novelbright", src: "songs/Walking_with_you.mp3", cover: "images/walkingwithyou.jpg", color1: "#FFB4C6", color2: "#7C5CFF" },
  { title: "It's Me", singer: "ILLIT", src: "songs/It's_Me.mp3", cover: "images/it'sme.jpg", color1: "#8FE3D7", color2: "#2D9CDB" },
  { title: "ツキミソウ", singer: "Novelbright", src: "songs/tukimisou.mp3", cover: "images/tukimisou.jpg", color1: "#CFE8FF", color2: "#6AA0FF" },
  { title: "Almond Chocolate", singer: "ILLIT", src: "songs/almond_chocolate.mp3", cover: "images/almond_chocolate.jpg", color1: "#F7D6C1", color2: "#A86A4F" }
];

let currentIndex = 0;
let isPlaying = false;

function pad(n) { return n < 10 ? '0' + n : '' + n }

function renderPlaylist() {
  playlistEl.innerHTML = '';
  tracks.forEach((t, i) => {
    const li = document.createElement('li');
    li.textContent = `${t.title} — ${t.singer}`;
    li.dataset.index = i;
    li.classList.toggle('active', i === currentIndex);
    li.addEventListener('click', () => {
      loadTrack(i);
      playTrack();
    });
    playlistEl.appendChild(li);
  });
}

function updateUI() {
  titleEl.textContent = tracks[currentIndex].title;
  singerEl.textContent = tracks[currentIndex].singer;
  if (tracks[currentIndex].cover) coverImg.src = tracks[currentIndex].cover;
  playBtn.className = isPlaying ? 'pause' : 'play';
  playBtn.innerHTML = `<i class="material-icons">${isPlaying ? 'pause' : 'play_arrow'}</i>`;
  [...playlistEl.children].forEach(li => {
    li.classList.toggle('active', Number(li.dataset.index) === currentIndex);
  });
}

function loadTrack(index) {
  if (index < 0 || index >= tracks.length) return;
  currentIndex = index;
  music.src = tracks[currentIndex].src;
  music.load();
  updateUI();
}

function playTrack() {
  music.play().then(() => {
    isPlaying = true;
    updateUI();
  }).catch(err => {
    console.warn('再生に失敗しました:', err);
  });
}

function pauseTrack() {
  music.pause();
  isPlaying = false;
  updateUI();
}

function togglePlayPause() {
  if (music.paused) playTrack(); else pauseTrack();
}

function nextTrack() {
  const next = (currentIndex + 1) % tracks.length;
  loadTrack(next);
  playTrack();
}

function prevTrack() {
  const prev = (currentIndex - 1 + tracks.length) % tracks.length;
  loadTrack(prev);
  playTrack();
}

// イベント登録
playBtn.addEventListener('click', togglePlayPause);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);

music.addEventListener('ended', () => {
  // audio.loop が true のときは ended は呼ばれないためここでの next は問題無し
  nextTrack();
});

music.onloadeddata = function () {
  seekbar.max = Math.floor(music.duration || 0);
  const ds = Math.floor(music.duration % 60);
  const dm = Math.floor((music.duration / 60) % 60);
  duration.innerHTML = dm + ':' + pad(ds);
}

music.ontimeupdate = function () {
  seekbar.value = Math.floor(music.currentTime || 0);
  const cs = Math.floor(music.currentTime % 60);
  const cm = Math.floor((music.currentTime / 60) % 60);
  currentTime.innerHTML = cm + ':' + pad(cs);
}

function handleSeekBar() { music.currentTime = seekbar.value }
window.handleSeekBar = handleSeekBar; // index.html の inline 呼び出しと互換性を保つ

// like
function handleFavorite() { favIcon.classList.toggle('active'); }
window.handleFavorite = handleFavorite;

// repeat
function handleRepeat() {
  music.loop = !music.loop;
  repIcon.classList.toggle('active');
}
window.handleRepeat = handleRepeat;

// volume
function handleVolume() {
  volIcon.classList.toggle('active');
  volBox.classList.toggle('active');
}
window.handleVolume = handleVolume;

volumeDown.addEventListener('click', () => {
  volumeRange.value = Math.max(0, Number(volumeRange.value) - 20);
  music.volume = volumeRange.value / 100;
});
volumeUp.addEventListener('click', () => {
  volumeRange.value = Math.min(100, Number(volumeRange.value) + 20);
  music.volume = volumeRange.value / 100;
});

// 初期化
renderPlaylist();
loadTrack(0);
music.volume = (volumeRange && volumeRange.value) ? volumeRange.value / 100 : 0.8;
