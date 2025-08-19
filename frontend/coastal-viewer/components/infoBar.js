import { getAboveAllListLength, getAboveNavListLength, getIndexInNav, getUnderAllListLength, getUnderNavListLength, getUnderwaterOffset } from "./navigationLogic";
import { getTagsByIds, showTagBadges } from "./tagLogic";

const aboveInfoContent = document.getElementById('photo-above-info-content');
const abovetagContent = document.getElementById('photo-above-tag-content');
const underInfoContent = document.getElementById('photo-under-info-content');
const undertagContent = document.getElementById('photo-under-tag-content');

let infoVisible = false;
const toggleInfoBarBtn = document.getElementById('toggle-info-btn');
const infoBar = document.getElementById('photo-info-bar');

toggleInfoBarBtn.addEventListener('click', () => {
  const isNowHidden = infoBar.classList.toggle('hidden');
  toggleInfoBarBtn.innerText = isNowHidden ? '◀' : '▶';
});

document.getElementById('photo-info-bar').addEventListener('wheel', function(e) {
  // Prevent scroll from reaching map when info bar is open
  if (!this.classList.contains('hidden')) {
    e.stopPropagation();
  }
}, { passive: false });


export function updatePhotoInfoBar(photoAbove, photoUnder) {
    const linesAbove = [];
    const linesUnder = [];
    let tagsAbove = [];
    let tagsUnder = [];
    const underwaterOffset = getUnderwaterOffset()

    // --- Handle photoAbove ---
    linesAbove.push(`Nav : ${getIndexInNav()}/ ${getAboveNavListLength()}`);
    linesAbove.push(`<h3>🌅 Above Water</h3>`);
    
    if (photoAbove) {    
        linesAbove.push(`Survey :${photoAbove.in_survey_index}/${getAboveAllListLength()}   |     Id : ${photoAbove.id}`);
        linesAbove.push(`<p><strong>📄 Photo name:</strong><br>${photoAbove.filename}</p>`);
        
        if (photoAbove.datetime) {
            linesAbove.push(`<p><strong>🕒 Datetime:</strong><br>${photoAbove.datetime}</p>`);
        }
        
        if (photoAbove.coords) {
            linesAbove.push(`<p><strong>📍 Coords:</strong><br>${photoAbove.coords[0].toFixed(5)}, ${photoAbove.coords[1].toFixed(5)}</p>`);
        }
        linesAbove.push(`<p><strong>🏷️ Tags:</strong><br></p>`);
        
        tagsAbove = getTagsByIds(photoAbove.tag_ids)
        showTagBadges(tagsAbove, abovetagContent)
    } else {
        linesAbove.push(`<p style="color:red;"><strong>Abovewater Photo not found </strong><br>Local : ????/${getAboveNavListLength()}</p>`);
    }
    // --- Handle photoUnder ---
    linesUnder.push(`<hr><h3>🌊 Underwater</h3>`);
    linesUnder.push(`<div id="change-offset-info-bar" class="offset-badge"> Offset : ${underwaterOffset} </div> <br>`);
    if (photoUnder) {
        linesUnder.push(`Survey :${photoUnder.in_survey_index}/${getUnderAllListLength()}   |     Id : ${photoUnder.id}`);
        linesUnder.push(`<p><strong>📄 Photo name:</strong><br>${photoUnder.filename}</p>`);

        if (photoUnder.datetime) {
            linesUnder.push(`<p><strong>🕒 Datetime:</strong><br>${photoUnder.datetime}</p>`);
        }

        if (photoUnder.coords) {
            linesUnder.push(`<p><strong>📍 Coords:</strong><br>${photoUnder.coords[0].toFixed(5)}, ${photoUnder.coords[1].toFixed(5)}</p>`);
        }
        
        linesUnder.push(`<p><strong>🏷️ Tags:</strong><br></p>`);
        
        tagsUnder = getTagsByIds(photoUnder.tag_ids)
        showTagBadges(tagsUnder, undertagContent)
    } else {
        linesUnder.push(`<p style="color:red;"><strong>Underwater Photo not found </strong><br>Local : ????/${getUnderNavListLength()}</p>`);
    }
    
    // --- Final display ---
    infoVisible = true;
    aboveInfoContent.classList.toggle('visible', infoVisible);
    underInfoContent.innerHTML = linesUnder.join('')
    aboveInfoContent.innerHTML = linesAbove.join('');

    document.getElementById("change-offset-info-bar").addEventListener('click', () => {
        const modal = document.getElementById("offset-modal")
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    })
}

export function clearInfoBar(){
    aboveInfoContent.innerHTML = ""
    underInfoContent.innerHTML = ""

    undertagContent.innerHTML = ""
    abovetagContent.innerHTML = ""
    
}

