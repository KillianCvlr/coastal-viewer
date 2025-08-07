import { changePhotoDisplayToIndex, getBegSelectIndexInNav, getCurrentSurveyCoords, getEndSelectIndexInNav } from './navigationLogic.js'

let map
let markerGroup
let navMarkerGroup
let backControl = null 
let navMarker = null;
let selectMarkerBeg = null
let selectMarkerEnd = null


const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const violetIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const navWrapper = document.getElementById("nav")

export function initMap() {
  map = L.map('map', {keyboard: false}).setView([43.6, 3.9], 4)
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles © Esri'
  }).addTo(map)

  markerGroup = L.layerGroup().addTo(map)
  navMarkerGroup = L.layerGroup().addTo(map)
  L.DomEvent.disableClickPropagation(navWrapper);
}

export function setDefaultView(){
  map.flyTo([43.6, 3.9], 4,  {
    animate: true,
    duration: 2
  })
}

export function goToSurveyView(survey){
  map.flyTo([survey.coords[0], survey.coords[1]], 18, {
          animate: true,
          duration: 2
        })
}

export function addBackButtonControl() {
  const BackControl = L.Control.extend({
    options: { position: 'topleft' },
    onAdd: function () {
      const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control')
      const button = L.DomUtil.create('a', '', container)
      button.innerHTML = '←'
      button.title = 'Back to Survey List'
      button.href = '#/'
      button.style.padding = '4px 8px'
      button.style.cursor = 'Back'
      button.style.textDecoration = 'none'
      button.style.backgroundColor = 'white'
      button.style.color = '#333'
      L.DomEvent.disableClickPropagation(container)
      return container
    }
  })

  backControl = new BackControl()
  map.addControl(backControl)
}

export function removeBackButtonControl() {
  if (backControl) {
    map.removeControl(backControl)
    backControl = null
  }
}

export function addPhotoMarkers(photos) {
  photos.forEach((photo, index) => {
    if ((photo.coords)) {
      const marker = L.circleMarker([photo.coords[0], photo.coords[1]], {
        radius: 2,
        color: "#9f36f1",
        fillColor: "#9f36f1",
        fillOpacity: 1
      })
      marker.on('click', () => {
        changePhotoDisplayToIndex(index)
      })

      marker.addTo(markerGroup)
    }
  })
}

export function addSurveysMarkers(surveys) {
  surveys.forEach(survey => {
    if (survey.coords) {

      const marker = L.marker([survey.coords[0], survey.coords[1]], {
        icon :blueIcon
      })

      marker.bindPopup(`<b>${survey.survey_name}</b><br>${survey.datetime || ''}`)

      marker.on('mouseover', () => {
        marker.openPopup()
      })

      marker.on('mouseout', () => {
        marker.closePopup()
      })

      marker.on('click', () => {
        map.flyTo(marker.getLatLng(), 18, {
          animate: true,
          duration: 2
        })
        setTimeout(() => {
          window.location.hash = `#/survey/${survey.id}`
          }, 2000) // match duration above
      })

      marker.addTo(markerGroup)
    }
  })
}

export function updateNavMarker(coords){
  if (coords){
    const position = [coords[0], coords[1]]
    if (navMarker) {
      // Move existing marker
      navMarker.setLatLng(position);
      navMarker.setIcon(violetIcon)
    } else {
      // Create it the first time
      navMarker = L.marker(position, {
        icon: violetIcon
      })
      navMarker.addTo(navMarkerGroup);
    }
  } else {
    if(navMarker){
      navMarker.setIcon(redIcon)
    }
    else {
      const surveyCoords = getCurrentSurveyCoords()
      if (surveyCoords){
        navMarker = L.marker(surveyCoords, {
          icon: redIcon
        })
        navMarker.addTo(navMarkerGroup);
      }
    }
  }
  navMarker.on('click', () => {
    map.flyTo(navMarker.getLatLng(), 18, {
      animate: true,
      duration: 1
    })
  })
}

export function updateSelectMarkerBeg(){
  if(selectMarkerBeg){
    if (navMarker) {
      selectMarkerBeg.setLatLng(navMarker.getLatLng());
    } else {
      const surveyCoords = getCurrentSurveyCoords()
      if (surveyCoords){
        selectMarkerBeg.setLatLng(surveyCoords)
      }
    }
  } else {
    if (navMarker) {
      selectMarkerBeg = L.marker(navMarker.getLatLng(), {
          icon: greenIcon
      })
      selectMarkerBeg.addTo(navMarkerGroup);
    }
    else {
      const surveyCoords = getCurrentSurveyCoords()
      selectMarkerBeg = L.marker(surveyCoords, {
          icon: greenIcon
      })
      selectMarkerBeg.addTo(navMarkerGroup);
    }
  }
  selectMarkerBeg.on('click', () =>{
    changePhotoDisplayToIndex(getBegSelectIndexInNav())
  })
}

export function updateSelectMarkerEnd(){
  if(selectMarkerEnd){
    if (navMarker) {
      selectMarkerEnd.setLatLng(navMarker.getLatLng());
    } else {
      const surveyCoords = getCurrentSurveyCoords()
      if (surveyCoords){
        selectMarkerEnd.setLatLng(surveyCoords)
      }
    }
  } else {
    if (navMarker) {
      selectMarkerEnd = L.marker(navMarker.getLatLng(), {
          icon: greenIcon
      })
      selectMarkerEnd.addTo(navMarkerGroup);
    }
    else {
      const surveyCoords = getCurrentSurveyCoords()
      selectMarkerEnd = L.marker(surveyCoords, {
          icon: greenIcon
      })
      selectMarkerEnd.addTo(navMarkerGroup);
    }
  }
  selectMarkerBeg.on('click', () =>{
    changePhotoDisplayToIndex(getEndSelectIndexInNav())
  })
}


export function clearPhotoMarkers() {
  if (markerGroup) markerGroup.clearLayers();
  if (navMarkerGroup) {
    navMarkerGroup.clearLayers()  
    navMarker = null;
    selectMarkerBeg = null
    selectMarkerEnd = null
  }
}

export function refreshMap() {
  if (map) map.invalidateSize()
}
