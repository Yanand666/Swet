const openBtn = document.getElementById('openUploader');
const closeBtn = document.getElementById('closeUploader');
const uploader = document.getElementById('uploader');
const uploadForm = document.getElementById('uploadForm');
const trackFile = document.getElementById('trackFile');
const recentWrap = document.getElementById('recentTracks');

if (openBtn && uploader) {
  openBtn.addEventListener('click', () => uploader.hidden = false);
}
if (closeBtn && uploader) {
  closeBtn.addEventListener('click', () => uploader.hidden = true);
}

async function loadRecent() {
  if (!recentWrap) return;
  const res = await fetch('/tracks');
  const files = await res.json();
  recentWrap.innerHTML = '';
  if (!files || !files.length) {
    recentWrap.innerHTML = '<p class="muted">Поки що немає треків</p>';
    return;
  }
  files.slice(0, 6).forEach(name => {
    const card = document.createElement('div');
    card.className = 'track-card';
    card.innerHTML = `
      <div class="track-name" title="${name}">${name}</div>
      <audio controls src="uploads/${name}"></audio>
    `;
    recentWrap.appendChild(card);
  });
}

if (uploadForm) {
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!trackFile.files.length) return;
    const fd = new FormData();
    fd.append('track', trackFile.files[0]);
    const res = await fetch('/upload', { method: 'POST', body: fd });
    if (res.ok) {
      trackFile.value = '';
      // миттєве оновлення списку без перезавантаження
      await loadRecent();
      // красиве мікро-підтвердження
      openBtn?.classList.add('current');
      setTimeout(()=>openBtn?.classList.remove('current'), 800);
    } else {
      alert('Помилка завантаження');
    }
  });
}

// стартове завантаження блоку "Останні треки"
loadRecent();
// автооновлення кожні 30с
setInterval(loadRecent, 30000);