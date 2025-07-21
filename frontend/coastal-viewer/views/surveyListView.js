import { fetchSurveys } from '../api.js'
import { addSurveysMarkers, clearPhotoMarkers, removeBackButtonControl, setDefaultView  } from '../components/map.js'

export async function renderSurveyList() {
  setDefaultView();
  clearPhotoMarkers();
  removeBackButtonControl()
  fetchSurveys().then(addSurveysMarkers).catch(err => {
  console.error("Error loading surveys markers: ", err)
  })
}