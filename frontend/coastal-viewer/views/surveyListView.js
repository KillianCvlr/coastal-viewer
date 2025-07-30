import { fetchSurveys } from '../../shared/api.js'
import { addSurveysMarkers, clearPhotoMarkers, removeBackButtonControl, setDefaultView  } from '../components/map.js'
import { updateTagsList } from '../components/tagLogic.js';

export async function renderSurveyList() {
  updateTagsList()
  setDefaultView();
  clearPhotoMarkers();
  removeBackButtonControl()
  fetchSurveys().then(addSurveysMarkers).catch(err => {
  console.error("Error loading surveys markers: ", err)
  })
}