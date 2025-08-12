document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('uploadForm');
  const fileInput = document.getElementById('fileInput');
  const uploadStatus = document.getElementById('uploadStatus');
  const tracksList = document.getElementById('tracksList');

  function fetchTracks() {
    fetch('/tracks')
      .then(res => res.json())
      .then(files => {
        tracksList.innerHTML = '';
        if (files.length === 0) {
          tracksList.innerHTML = '<li>Треків поки немає.</li>';
          return;
        }
        files.forEach(file => {
          const li = document.createElement('li');
          li.textContent = file;
          tracksList.appendChild(li);
        });
      })
      .catch(() => {
        tracksList.innerHTML = '<li>Не вдалося завантажити список треків.</li>';
      });
  }

  uploadForm.addEventListener('submit', e => {
    e.preventDefault();
    if (fileInput.files.length === 0) return;
    const formData = new FormData();
    formData.append('track', fileInput.files[0]);

    uploadStatus.textContent = 'Завантаження...';

    fetch('/upload', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        uploadStatus.textContent = 'Помилка: ' + data.error;
      } else {
        uploadStatus.textContent = 'Файл успішно завантажено!';
        fetchTracks();
        uploadForm.reset();
      }
    })
    .catch(() => {
      uploadStatus.textContent = 'Помилка при завантаженні.';
    });
  });

  fetchTracks();
});