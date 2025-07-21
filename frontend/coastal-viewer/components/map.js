import { loadPhotoInPanel } from './impagePanel.js'

let map
let markerGroup
let backControl = null 

export function initMap() {
  map = L.map('map').setView([43.6, 3.9], 4)
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles © Esri'
  }).addTo(map)

  markerGroup = L.layerGroup().addTo(map)
}

export function setDefaultView(){
  map.flyTo([43.6, 3.9], 4,  {
    animate: true,
    duration: 2
  })
}

export function addBackButtonControl() {
  const BackControl = L.Control.extend({
    options: { position: 'bottomleft' },
    onAdd: function () {
      const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control')
      const button = L.DomUtil.create('a', '', container)
      button.innerHTML = '← SUrvey List'
      button.title = 'Back to Survey List'
      button.href = '#/'
      button.style.padding = '4px 8px'
      button.style.cursor = 'pointer'
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
  photos.forEach(photo => {
    if (photo.coords) {
      const marker = L.circleMarker([photo.coords[0], photo.coords[1]], {
        radius: 4,
        color: "#9f36f1",
        fillColor: "#9f36f1",
        fillOpacity: 1
      })

      marker.bindPopup(`<b>${photo.filename}</b><br>${photo.datetime || ''}`)

      marker.on('click', () => {
        loadPhotoInPanel(photo.filepath)
      })

      marker.addTo(markerGroup)
    }
  })
}

export function addSurveysMarkers(surveys) {
  surveys.forEach(survey => {
    if (survey.coords) {
      const marker = L.marker([survey.coords[0], survey.coords[1]], {
        color: "#9f36f1",
        fillColor: "#9f36f1",
        fillOpacity: 1
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

export function clearPhotoMarkers() {
  if (markerGroup) markerGroup.clearLayers()
}


export function refreshMap() {
  if (map) map.invalidateSize()
}
