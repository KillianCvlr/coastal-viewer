import { fetchSurveyPhotosAboveWater, fetchSurveyPhotosUnderWater, fetchTags } from '../../shared/api.js'
import { addPhotoMarkers, clearPhotoMarkers, addBackButtonControl } from '../components/map.js'
import { updateNavListUnder, updateNavListAbove, cleanAllNav } from '../components/navigationLogic.js';
import { updateTagsList } from '../components/tagLogic.js';

export async function renderSurveyDetail(surveyId) {
    clearPhotoMarkers();
    cleanAllNav();
    addBackButtonControl();

    fetchSurveyPhotosAboveWater(surveyId)
        .then(photos =>{
            updateNavListAbove(photos)
            addPhotoMarkers(photos)})
        .catch(err => {
            console.error("Error loading photos above water:", err)
        });
    fetchSurveyPhotosUnderWater(surveyId)
        .then(photos =>{
            updateNavListUnder(photos)})
        .catch(err => {
            console.error("Error loading photos under water:", err)
        });
    updateTagsList()
    
}
