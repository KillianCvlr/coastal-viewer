import { fetchSurveys } from '../../shared/api.js'
import { clearPhotosImagePanel, renderSurveysListImagePanel } from '../components/impagePanel.js';
import { clearInfoBar } from '../components/infoBar.js';
import { addSurveysMarkers, clearPhotoMarkers, removeBackButtonControl, setDefaultView  } from '../components/map.js'
import { cleanAllNav } from '../components/navigationLogic.js';
import { clearFilteringSystem, updateTagsList } from '../components/tagLogic.js';
import { clearToasts, showToast } from '../components/ui.js';
import { setCurrentToken, getCurrentToken } from '../main.js';


export async function renderSurveyList() {
  // Creation of unic token for this function
  const token = Symbol('listRender');
  setCurrentToken(token)

  clearToasts()
  setDefaultView();
  updateTagsList();
  clearFilteringSystem();
  cleanAllNav();
  clearPhotosImagePanel();
  clearPhotoMarkers();
  clearInfoBar();
  removeBackButtonControl();

  showToast("Fetching Survey List...")
  try {
    const surveys = await fetchSurveys();
    if (getCurrentToken() !== token) return; 

    addSurveysMarkers(surveys);
    renderSurveysListImagePanel(surveys);
    clearToasts()
  } catch (err) {
    console.error("Error loading surveys markers: ", err);
    if (getCurrentToken() !== token) return; 
    clearToasts()
  }
}
