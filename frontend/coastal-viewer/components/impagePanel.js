import {fetchPhoto } from '../api.js'
import { isMagnyfingEnabled } from './ui.js'

const loupe = document.getElementById('loupe')
const mainImage = document.getElementById('main-image')
const secondImage = document.getElementById('second-image')
const imagePanel = document.getElementById('image-panel')
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
  enableCursorTracking(mainImage)
  enableCursorTracking(secondImage)
}

export async function loadPhotoInPanelMain(photoPath) {
    fetchPhoto(photoPath)
    .then(blob => {
        const imageObjectUrl = URL.createObjectURL(blob)
        const aboveWaterImage = document.getElementById('main-image')

        aboveWaterImage.src = imageObjectUrl
    })
    .catch(err => {
        console.error("Failed to load image:", err)
        document.getElementById('main-image').src = ""
    })
}
export async function loadPhotoInPanelSecond(photoPath) {
    fetchPhoto(photoPath)
    .then(blob => {
        const imageObjectUrl = URL.createObjectURL(blob)
        const UnderWaterImage = document.getElementById('second-image')

        UnderWaterImage.src = imageObjectUrl
    })
    .catch(err => {
        console.error("Failed to load image:", err)
        document.getElementById('second-image').src = ""
    })
}