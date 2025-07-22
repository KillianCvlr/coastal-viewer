const infoContent = document.getElementById('photo-info-content');

let infoVisible = false;
const toggleBtn = document.getElementById('toggle-info-btn');
const infoBar = document.getElementById('photo-info-bar');

toggleBtn.addEventListener('click', () => {
  const isNowHidden = infoBar.classList.toggle('hidden');
  toggleBtn.innerText = isNowHidden ? '◀' : '▶';
});
export function updatePhotoInfoBar(photo) {
    if (!photo) {
        infoContent.textContent  = ' Error Loading Photo';
        return;
    }

    const lines = [];
    lines.push(` Photo name : ${photo.filename}`)
    if (photo.datetime) lines.push(`🕒 ${photo.datetime}`);
    if (photo.coords) lines.push(`📍 ${photo.coords[0].toFixed(5)}, ${photo.coords[1].toFixed(5)}`);
    if ('is_underwater' in photo) lines.push(photo.is_underwater ? '🌊 Underwater' : '🌅 Above Water');

    infoVisible = true
    infoContent.classList.toggle('visible', infoVisible);
    infoContent.textContent = lines.join('\n');
}

// function toggleInfoBar() {
//   infoVisible = !infoVisible;
//   infoContent.classList.toggle('visible', infoVisible);
//   toggleBtn.textContent = infoVisible ? '⮞' : '⮜';
// }

// toggleBtn.addEventListener('click', toggleInfoBar);
