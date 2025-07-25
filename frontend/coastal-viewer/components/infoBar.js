import { getTagsByIds, showTagBadges } from "./tagLogic";

const infoContent = document.getElementById('photo-info-content');

let infoVisible = false;
const toggleBtn = document.getElementById('toggle-info-btn');
const infoBar = document.getElementById('photo-info-bar');

toggleBtn.addEventListener('click', () => {
  const isNowHidden = infoBar.classList.toggle('hidden');
  toggleBtn.innerText = isNowHidden ? '◀' : '▶';
});


export function updatePhotoInfoBar(photoAbove, photoUnder) {
    const lines = [];

    // --- Handle photoAbove ---
    if (!photoAbove) {
        infoContent.innerHTML = '<p style="color:red;">Error loading above-water photo</p>';
        return;
    }

    lines.push(`<h3>🌅 Above Water</h3>`);

    lines.push(`<p><strong>📄 Photo name:</strong><br>${photoAbove.filename}</p>`);

    if (photoAbove.datetime) {
        lines.push(`<p><strong>🕒 Datetime:</strong><br>${photoAbove.datetime}</p>`);
    }

    if (photoAbove.coords) {
        lines.push(`<p><strong>📍 Coords:</strong><br>${photoAbove.coords[0].toFixed(5)}, ${photoAbove.coords[1].toFixed(5)}</p>`);
    }
    //tagsAbove = getTagsByIds(photoAbove.tags)
    //showTagBadges(tagsAbove)
    // --- Handle photoUnder if it exists ---
    if (photoUnder) {
        lines.push(`<hr><h3>🌊 Underwater</h3>`);
        lines.push(`<p><strong>📄 Photo name:</strong><br>${photoUnder.filename}</p>`);

        if (photoUnder.datetime) {
            lines.push(`<p><strong>🕒 Datetime:</strong><br>${photoUnder.datetime}</p>`);
        }

        if (photoUnder.coords) {
            lines.push(`<p><strong>📍 Coords:</strong><br>${photoUnder.coords[0].toFixed(5)}, ${photoUnder.coords[1].toFixed(5)}</p>`);
        }
    }

    // --- Final display ---
    infoVisible = true;
    infoContent.classList.toggle('visible', infoVisible);
    infoContent.innerHTML = lines.join('');
}

// function toggleInfoBar() {
//   infoVisible = !infoVisible;
//   infoContent.classList.toggle('visible', infoVisible);
//   toggleBtn.textContent = infoVisible ? '⮞' : '⮜';
// }

// toggleBtn.addEventListener('click', toggleInfoBar);
