import { initMap } from './components/map.js'
import { setupResizers } from './components/ui.js'

import { renderSurveyList } from './views/surveyListView.js'
import { renderSurveyDetail } from './views/surveyDetailView.js'

import { initLoupe } from './components/impagePanel.js'

initMap()
setupResizers()
initLoupe()

function router() {
  const hash = window.location.hash

  if (!hash || hash === '#/') {
    renderSurveyList()
  } else if (hash.startsWith('#/survey/')) {
    const id = hash.split('/')[2]
    renderSurveyDetail(id)
  }
}

window.addEventListener('hashchange', router)
window.addEventListener('load', router)