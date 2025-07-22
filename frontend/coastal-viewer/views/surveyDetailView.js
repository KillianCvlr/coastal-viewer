import { fetchSurveyPhotosAboveWater, fetchSurveyPhotosUnderWater } from '../api.js'
import { addPhotoMarkers, clearPhotoMarkers, addBackButtonControl } from '../components/map.js'
import { updateNavListUnder, updateNavListAbove } from '../components/navigationLogic.js';

export async function renderSurveyDetail(surveyId) {
    clearPhotoMarkers();
    fetchSurveyPhotosAboveWater(surveyId)
        .then(photos =>{
            updateNavListAbove(photos)
            addPhotoMarkers(photos)})
        .catch(err => {
            console.error("Error loading photos above water:", err)
        });
    addBackButtonControl()
    fetchSurveyPhotosUnderWater(surveyId)
        .then(photos =>{
            updateNavListUnder(photos)})
        .catch(err => {
            console.error("Error loading photos under water:", err)
        });
    
}
