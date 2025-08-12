// app.js — Sweet prototype frontend logic
document.addEventListener('DOMContentLoaded', ()=>{

  const sampleTracks = [
    {id: 't1', title:'Midnight Drive', artist:'Neon Echo', url:'', cover:'', plays: 124},
    {id: 't2', title:'Blue Haze', artist:'Aura', url:'', cover:'', plays: 98},
    {id: 't3', title:'Glass City', artist:'Pulse', url:'', cover:'', plays: 76}
  ];

  const tracksEl = document.getElementById('tracks');
  const audio = document.getElementById('audio');
  const playBtn = document.getElementById('playBtn');
  const playerTitle = document.getElementById('playerTitle');
  const playerArtist = document.getElementById('playerArtist');
  const playerCover = document.getElementById('playerCover');
  const currentTimeEl = document.getElementById('currentTime');
  const durationEl = document.getElementById('duration');
  const uploadBtn = document.getElementById('uploadBtn');
  const uploadSection = document.getElementById('uploadSection');
  const uploadForm = document.getElementById('uploadForm');
  const cancelUpload = document.getElementById('cancelUpload');
  const yearEl = document.getElementById('year');

  yearEl.textContent = new Date().getFullYear();

  // Simple local storage for tracks
  const STORAGE_KEY = 'sweet_tracks_v1';
  let tracks = loadTracks();

  function loadTracks(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw) return JSON.parse(raw);
    }catch(e){}
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleTracks));
    return sampleTracks.slice();
  }
  function saveTracks(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks)); }

  function renderTracks(filter=''){
    tracksEl.innerHTML = '';
    const list = tracks.filter(t=> (t.title + t.artist).toLowerCase().includes(filter.toLowerCase()));
    list.forEach(t=>{
      const card = document.createElement('div'); card.className='card';
      const img = document.createElement('img'); img.className='cover'; img.alt = t.title;
      if(t.cover) img.src = t.cover; else img.src = '';
      const meta = document.createElement('div'); meta.className='meta';
      meta.innerHTML = `<div class="title">${escapeHtml(t.title)}</div><div class="artist">${escapeHtml(t.artist)}</div><div class="small muted">Прослуховувань: <span>${t.plays||0}</span></div>`;
      const actions = document.createElement('div'); actions.className='card-actions';
      const play = document.createElement('button'); play.className='btn'; play.textContent='▶'; play.onclick = ()=> playTrack(t.id);
      const del = document.createElement('button'); del.className='btn'; del.textContent='Видалити'; del.onclick = ()=> { if(confirm('Видалити трек?')) { tracks = tracks.filter(x=>x.id!==t.id); saveTracks(); renderTracks(); } };
      actions.appendChild(play); actions.appendChild(del);
      card.appendChild(img); card.appendChild(meta); card.appendChild(actions);
      tracksEl.appendChild(card);
    });
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" }[m])); }

  function playTrack(id){
    const t = tracks.find(x=>x.id===id);
    if(!t) return;
    if(t.url){
      audio.src = t.url;
      audio.play();
    }else{
      // Demo fallback: use a short silent audio for player functionality
      audio.src = 'data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAA...'; // placeholder short clip
      audio.play().catch(()=>{});
    }
    playerTitle.textContent = t.title;
    playerArtist.textContent = t.artist;
    if(t.cover) playerCover.src = t.cover; else playerCover.src = '';
    incrementPlays(t.id);
  }

  function incrementPlays(id){
    const t = tracks.find(x=>x.id===id);
    if(!t) return;
    t.plays = (t.plays||0) + 1;
    saveTracks();
    renderTracks(document.getElementById('search').value);
  }

  // Player controls
  playBtn.addEventListener('click', ()=>{
    if(audio.paused) audio.play(); else audio.pause();
  });
  audio.addEventListener('play', ()=> playBtn.textContent = '⏸️');
  audio.addEventListener('pause', ()=> playBtn.textContent = '▶️');
  audio.addEventListener('timeupdate', ()=>{
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration || 0);
  });

  function formatTime(s){ if(!s || isNaN(s)) return '0:00'; const m = Math.floor(s/60); const sec = Math.floor(s%60).toString().padStart(2,'0'); return m+':'+sec; }

  // Upload behavior (client-side demo)
  uploadBtn.addEventListener('click', ()=> {
    uploadSection.style.display = 'block'; uploadSection.removeAttribute('aria-hidden');
    window.scrollTo({top: uploadSection.offsetTop-30, behavior:'smooth'});
  });
  cancelUpload.addEventListener('click', ()=> { uploadSection.style.display='none'; uploadSection.setAttribute('aria-hidden','true'); });

  uploadForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(uploadForm);
    const file = fd.get('file');
    const title = fd.get('title');
    const artist = fd.get('artist');
    if(!file) return alert('Додаць файл');
    const id = 't_' + Date.now();
    const reader = new FileReader();
    reader.onload = function(ev){
      const url = ev.target.result; // data url
      const newTrack = { id, title, artist, url, cover:'', plays:0 };
      tracks.unshift(newTrack);
      saveTracks();
      renderTracks(document.getElementById('search').value);
      uploadForm.reset();
      uploadSection.style.display='none';
      alert('Трек додано (локально). Для збереження на сервері реалізуйте бекенд.');
    };
    reader.readAsDataURL(file);
  });

  // Search
  document.getElementById('search').addEventListener('input', (e)=> renderTracks(e.target.value));

  // Initial render
  renderTracks();

});
