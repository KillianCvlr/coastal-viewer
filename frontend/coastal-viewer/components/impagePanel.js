import { isMagnyfingEnabled, isFullResEnabled } from './ui.js'
import { fetchDownscaledPhoto, fetchFullResPhoto } from '../../shared/api.js'
import { goToSurveyView } from './map.js'

const loupe = document.getElementById('loupe')
const imagePanel = document.getElementById('image-panel')
const aboveWaterImage = document.getElementById('main-image')
const underWaterImage = document.getElementById('second-image')
const loupeImage = document.getElementById('loupe-image')

let zoomLevel = 3 
const maxZoom = 10
const minZoom = 1

// Loupe logic

function enableCursorTracking(imageElement) {
  // Loupe Logic
  imageElement.addEventListener('mouseenter', () => {
    if (isMagnyfingEnabled()) {
      loupe.style.display = 'block'
      loupeImage.src = imageElement.src
    }
  })

  imageElement.addEventListener('mousemove', (e) => {
    const imageRect = imageElement.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    const mouseX = x - imageRect.left
    const mouseY = y - imageRect.top

    // Offset loupe to center it around the cursor
    loupe.style.left = `${x - loupe.offsetWidth / 2}px`
    loupe.style.top = `${y - loupe.offsetHeight / 2}px`

    // Set loupe image scale and position
    loupeImage.style.width = `${imageElement.width * zoomLevel}px`
    loupeImage.style.height = `${imageElement.height * zoomLevel}px`

    // Move loupe image so that cursor position is centered in the loupe
    loupeImage.style.left = `${-mouseX * zoomLevel + loupe.offsetWidth / 2}px`
    loupeImage.style.top = `${-mouseY * zoomLevel + loupe.offsetHeight / 2}px`
  })

  imageElement.addEventListener('mouseleave', () => {
    loupe.style.display = 'none'
  })

  // Increase/Decrease Zoom 
  imageElement.addEventListener('wheel', (e) => {
    e.preventDefault(); // prevent scroll
    const delta = Math.sign(e.deltaY);
    zoomLevel -= delta * 0.2;
    zoomLevel = Math.min(maxZoom, Math.max(minZoom, zoomLevel));

    const imageRect = imageElement.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    const mouseX = x - imageRect.left
    const mouseY = y - imageRect.top

    // Set loupe image scale and position
    loupeImage.style.width = `${imageElement.width * zoomLevel}px`
    loupeImage.style.height = `${imageElement.height * zoomLevel}px`

    // Move loupe image so that cursor position is centered in the loupe
    loupeImage.style.left = `${-mouseX * zoomLevel + loupe.offsetWidth / 2}px`
    loupeImage.style.top = `${-mouseY * zoomLevel + loupe.offsetHeight / 2}px`

  });
}

export function initLoupe() {
  // Enable for both images
  enableCursorTracking(aboveWaterImage)
  enableCursorTracking(underWaterImage)
}

export async function fetchPhoto(photoPath){
    const fetchFunction = isFullResEnabled() ? fetchFullResPhoto : fetchDownscaledPhoto
    const blob = await fetchFunction(photoPath)
    return blob
}


export async function loadPhotoInPanelMain(photoPath) {
    fetchPhoto(photoPath)
    .then(blob => {
        const newObjectUrl = URL.createObjectURL(blob)

        // Revoke only if the previous URL was a blob
        const oldSrc = aboveWaterImage.src
        aboveWaterImage.src = newObjectUrl

        if (oldSrc.startsWith("blob:")) {
            URL.revokeObjectURL(oldSrc)
        }
    })
    .catch(err => {
        console.error("Failed to load image:", err)
        document.getElementById('main-image').src = ""
    })
}

export async function loadPhotoInPanelSecond(photoPath) {
    fetchPhoto(photoPath)
    .then(blob => {
        const newObjectUrl = URL.createObjectURL(blob)

        // Revoke only if the previous URL was a blob
        const oldSrc = underWaterImage.src
        underWaterImage.src = newObjectUrl

        if (oldSrc.startsWith("blob:")) {
            URL.revokeObjectURL(oldSrc)
        }
    })
    .catch(err => {
        console.error("Failed to load image:", err)
        document.getElementById('second-image').src = ""
    })
}

///////////////// Rendering survey List when not in photo mode/////////////////

const surveyListImagePanelDiv = document.getElementById("survey-list-image-panel")
export function renderSurveysListImagePanel(surveyData) {

  surveyData.forEach(survey => {
    const item = document.createElement("div");
    item.className = "survey-item";

    const info = document.createElement("div");
    info.className = "survey-info";
    info.innerHTML = `
      <strong>📄 ${survey.survey_name}</strong>
      <span>🕒 ${survey.datetime}</span>
      <span>📍 ${survey.coords ? `${survey.coords[0].toFixed(4)}, ${survey.coords[1].toFixed(4)}` : "No Survey coords"}
      </span>
      ${survey.comment ? `<em>${survey.comment}</em>` : ""}
    `;

    const info2 = document.createElement("div");
    info2.className = "survey-info";
    info2.innerHTML = `
      <span> 🌅 Abovewater : ${survey.abovewater_folder ? `${survey.abovewater_folder}` : "No Folder found"} </span>
      <span> 🌊 Underwater : ${survey.underwater_folder ? `${survey.underwater_folder}` : "No Folder found"} </span>
    `;

    const actions = document.createElement("div");
    actions.className = "survey-actions";

    if (survey.coords){
      const goToBtn = document.createElement("button");
      goToBtn.className = "btn";
      goToBtn.innerText = "Go To";
      goToBtn.onclick = ('click', () => {
        goToSurveyView(survey)
        setTimeout(() => {
          window.location.hash = `#/survey/${survey.id}`
          }, 2000) // match duration above
        })
      actions.appendChild(goToBtn);
    }
    
    item.appendChild(info);
    item.appendChild(info2);
    item.appendChild(actions);
    surveyListImagePanelDiv.appendChild(item);
  });
}

export function clearSurveyListImagePanel(){
  surveyListImagePanelDiv.innerHTML = ""
}

export function clearPhotosImagePanel(){
  aboveWaterImage.src = ""
  underWaterImage.src = ""
}