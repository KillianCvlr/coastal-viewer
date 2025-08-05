import { deleteSurvey, fetchSurveys, postSurvey } from "../shared/api";

updateSurveyListing()

function updateSurveyListing(){
  fetchSurveys().then( surveys => {renderSurveysList(surveys, document.getElementById("survey-list"))}).catch(err => {
    console.error("Error loading surveys markers: ", err)
    });
}

let targetSurvey = null;

function renderSurveysList(surveyData, container) {
  container.innerHTML = ""; // clear existing

  surveyData.forEach(survey => {
    const item = document.createElement("div");
    item.className = "survey-item";

    const info = document.createElement("div");
    info.className = "survey-info";
    info.innerHTML = `
      <strong>📄 ${survey.survey_name}</strong>
      <span>🕒 ${survey.datetime}</span>
      <span>📍 ${survey.coords ? `${survey.coords[0].toFixed(4)}, ${survey.coords[1].toFixed(4)}` : "No Survey coords"}
      </span>
      ${survey.comment ? `<em>${survey.comment}</em>` : ""}
    `;

    const info2 = document.createElement("div");
    info2.className = "survey-info";
    info2.innerHTML = `
      <span> 🌅 Abovewater : ${survey.abovewater_folder ? `${survey.abovewater_folder}` : "No Folder found"} </span>
      <span> 🌊 Underwater : ${survey.underwater_folder ? `${survey.underwater_folder}` : "No Folder found"} </span>
    `;

    const actions = document.createElement("div");
    actions.className = "survey-actions";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerText = "Delete";
    deleteBtn.onclick = () => {
      targetSurvey = survey
      getSurveyDoubleCheckDelete(survey)
    };

    actions.appendChild(deleteBtn);
    item.appendChild(info);
    item.appendChild(info2);
    item.appendChild(actions);
    container.appendChild(item);
  });
}
const closeModalBtn = document.getElementById('close-survey-modal-btn')
const returnModalBtn = document.getElementById('return-survey-button-modal')
const deleteSurveyModalBtn = document.getElementById('delete-survey-button-modal')
const modal = document.getElementById('survey-modal')
const modalContent = document.getElementById('survey-modal-text');

async function getSurveyDoubleCheckDelete(survey){
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
  modalContent.innerHTML = `<strong> Do you want to Delete "${survey.survey_name}" ?</strong> <br>`
}

deleteSurveyModalBtn.addEventListener('click', async (e) =>{
  cleanLogs()
  listenToLogs(targetSurvey.survey_name)
  try {
    modal.classList.add('hidden');
    modal.style.display = 'none';
    const response = await deleteSurvey(targetSurvey.id);
    alert("Survey deletion accepted!");
    updateSurveyListing();             // re-render UI
  } catch (err) {
    console.error("Deletion failed:", err);
    alert(err.message);
  }
});

closeModalBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
  modal.style.display = 'none';
});

returnModalBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
  modal.style.display = 'none';
});

document.getElementById('survey-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  cleanLogs()
  listenToLogs(form.survey_name.value); // Assuming this starts SSE

  const data = {
    survey_name: form.survey_name.value,
    comment: form.comment.value,
    abovewater_folder: form.abovewater_folder.value,
    underwater_folder: form.underwater_folder.value,
    linking_file: form.linking_file.value,
  };

  try {
    const response = await postSurvey(data);
    alert("Survey fully accepted!");
    form.reset();
    updateSurveyListing()
  } catch (err) {
    console.error("Post failed:", err);
    alert(err.message);
  }
});

//   Logs reader 

let currentLogSource = null;

function listenToLogs(surveyName) {
  const logOutput = document.getElementById('log-output');

  // Close previous connection if it exists
  if (currentLogSource) {
    currentLogSource.close();
  }

  logOutput.textContent += `[Listening to logs for: ${surveyName}]\n`;

  const source = new EventSource(`/logs/${surveyName}/`);
  currentLogSource = source;

  source.onmessage = function(event) {
    logOutput.textContent += event.data + '\n';
    logOutput.scrollTop = logOutput.scrollHeight;
  };

  source.onerror = function(err) {
    logOutput.textContent += "\n[Log stream disconnected]\n";
    source.close();
    currentLogSource = null;
  };
}

function cleanLogs() {
  const logOutput = document.getElementById('log-output');
  logOutput.textContent = '';

  // Optionally also stop logging connection
  if (currentLogSource) {
    currentLogSource.close();
    currentLogSource = null;
  }
}
