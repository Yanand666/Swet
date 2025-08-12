async function uploadTrack(event) {
    event.preventDefault();
    const formData = new FormData(document.getElementById('uploadForm'));
    const res = await fetch('/upload', { method: 'POST', body: formData });
    if(res.ok) {
        alert('Трек завантажено!');
        window.location.href = 'catalog.html';
    } else {
        alert('Помилка завантаження');
    }
}