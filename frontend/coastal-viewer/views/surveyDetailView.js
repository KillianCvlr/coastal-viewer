import { fetchSurvey, fetchSurveyPhotosAboveWater, fetchSurveyPhotosUnderWater, fetchTags } from '../../shared/api.js'
import { clearSurveyListImagePanel } from '../components/impagePanel.js';
import { addPhotoMarkers, clearPhotoMarkers, addBackButtonControl } from '../components/map.js'
import { updateUnderNavList, updateAboveNavList, cleanAllNav, setCurrentSurvey, setaboveAllList, setunderAllList, getAboveNavList } from '../components/navigationLogic.js';
import { updateTagsList } from '../components/tagLogic.js';

export async function renderSurveyDetail(surveyId) {
    cleanAllNav();
    clearPhotoMarkers();
    clearSurveyListImagePanel()
    addBackButtonControl();
    updateTagsList()

    fetchSurvey(surveyId)
        .then(survey => {
            setCurrentSurvey(survey)
        })
        .catch(err => {
            console.error("Error loading survey Data:", err)
        });

    fetchSurveyPhotosAboveWater(surveyId)
        .then(photos =>{
            setaboveAllList(photos)
            updateAboveNavList()
            addPhotoMarkers(getAboveNavList())})
        .catch(err => {
            console.error("Error loading photos above water:", err)
        });
    fetchSurveyPhotosUnderWater(surveyId)
        .then(photos =>{
            setunderAllList(photos)
            updateUnderNavList()})
        .catch(err => {
            console.error("Error loading photos under water:", err)
        });
    
}
