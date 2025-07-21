
import {isFullResEnabled} from './components/ui.js'

export async function fetchPhotos() {
  const res = await fetch('/photos/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
  if (!res.ok) throw new Error("Failed to fetch photos")
  return res.json()
}

export async function fetchSurveyPhotos(surveyId) {
  const res = await fetch(`/surveys/${surveyId}/photos/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error("Failed to fetch survey photos")
  return res.json()
}

export async function fetchSurveys() {
  const res = await fetch(`/surveys/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error("Failed to fetch surveys")
  return res.json()
}

export async function fetchPhoto(photoPath){
    const fetchFunction = isFullResEnabled() ? fetchFullResPhoto : fetchDownscaledPhoto
    const blob = await fetchFunction(photoPath)
    return blob
}

export async function fetchFullResPhoto(photoPath) {
  const res = await fetch(`/photos/${encodeURIComponent(photoPath)}/fullRes/`, {
    method: 'GET',
  })
  if (!res.ok) throw new Error("Failed to fetch full res photo")
  return res.blob()
}

export async function fetchDownscaledPhoto(photoPath) {
  const res = await fetch(`/photos/${encodeURIComponent(photoPath)}/downscaled/`, {
    method: 'GET',
  })
  if (!res.ok) throw new Error("Failed to downscaled res photo")
  return res.blob()
}
