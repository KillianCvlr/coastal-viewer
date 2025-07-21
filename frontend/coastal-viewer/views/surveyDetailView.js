import { fetchSurveyPhotos } from '../api.js'
import { addPhotoMarkers, clearPhotoMarkers, addBackButtonControl } from '../components/map.js'

export async function renderSurveyDetail(surveyId) {
    clearPhotoMarkers();
    fetchSurveyPhotos(surveyId).then(addPhotoMarkers).catch(err => {
    console.error("Error loading photos:", err)
    });
    addBackButtonControl()
}
