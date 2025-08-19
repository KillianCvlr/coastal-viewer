import { fetchSurvey, fetchSurveyPhotosAboveWater, fetchSurveyPhotosUnderWater, fetchTags } from '../../shared/api.js'
import { clearSurveyListImagePanel } from '../components/impagePanel.js';
import { activateInfobar } from '../components/infoBar.js';
import { addPhotoMarkers, clearPhotoMarkers, addBackButtonControl } from '../components/map.js'
import { updateUnderNavList, updateAboveNavList, cleanAllNav, setCurrentSurvey, setaboveAllList, setunderAllList, getAboveNavList } from '../components/navigationLogic.js';
import { updateTagsList } from '../components/tagLogic.js';
import { clearToasts, showToast } from '../components/ui.js';
import { getCurrentToken, setCurrentToken } from '../main.js';


export async function renderSurveyDetail(surveyId) {
    const token = Symbol('renderToken'); 
    setCurrentToken(token)

    cleanAllNav();
    clearPhotoMarkers();
    clearSurveyListImagePanel()
    
    addBackButtonControl();
    updateTagsList()

    showToast("Fetching Survey...");
    try {
        const survey = await fetchSurvey(surveyId);
        if (getCurrentToken() !== token) return; // aborted
        setCurrentSurvey(survey);
    } catch (err) {
        console.error("Error loading survey Data:", err);
        if (getCurrentToken() !== token) return;
    }

    showToast("Fetching Abovewater Photos...");
    try {
        const photosAbove = await fetchSurveyPhotosAboveWater(surveyId);
        if (getCurrentToken() !== token) return;
        setaboveAllList(photosAbove);
    } catch (err) {
        console.error("Error loading photos above water:", err);
        if (getCurrentToken() !== token) return;
    }
    
    showToast("Fetching Underwater Photos...");
    try {
        const photosUnder = await fetchSurveyPhotosUnderWater(surveyId);
        if (getCurrentToken() !== token) return;
        setunderAllList(photosUnder);
        updateUnderNavList();
        updateAboveNavList();
        activateInfobar()
        clearToasts();
    } catch (err) {
        console.error("Error loading photos under water:", err);
        if (getCurrentToken() !== token) return;
        clearToasts()
    }
}
