import { fetchSurveys } from '../../shared/api.js'
import { clearPhotosImagePanel, renderSurveysListImagePanel } from '../components/impagePanel.js';
import { addSurveysMarkers, clearPhotoMarkers, removeBackButtonControl, setDefaultView  } from '../components/map.js'
import { cleanAllNav } from '../components/navigationLogic.js';
import { clearFilteringSystem, updateTagsList } from '../components/tagLogic.js';


export async function renderSurveyList() {
  clearFilteringSystem()
  cleanAllNav()
  updateTagsList()
  setDefaultView();
  clearPhotosImagePanel()
  clearPhotoMarkers();
  removeBackButtonControl()
  fetchSurveys()
    .then( surveys => {
      addSurveysMarkers(surveys)
      renderSurveysListImagePanel(surveys)})
    .catch(err => {
      console.error("Error loading surveys markers: ", err)
  })
}