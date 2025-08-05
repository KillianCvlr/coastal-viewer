import { deleteTag, postNewTag, postOffset } from '../../shared/api.js';
import { refreshMap } from './map.js'
import {addToDisplayIndex, getCurrentSurveyID, nextPhotoDisplayIndex, previousPhotoDisplayIndex, setCurrentSurvey, subToDisplayIndex, updatePanelPhoto} from './navigationLogic.js'
import { updateTagsList } from './tagLogic.js';

///////////////////////////////RESIZERS//////////////////////////////////////// 

export function isFullResEnabled() {
  return document.getElementById('fullres-toggle').checked
}

export function isMagnyfingEnabled(){
  return document.getElementById('magnifying-toggle').checked
}

export function setupResizers() {
  // Vertical resizer between left and right
  const resizerCol = document.getElementById("resizer-col");
  const container = document.getElementById("container");
  const containerNav = document.getElementById("container-nav");
  const imagePanel = document.getElementById("image-panel");

  let isResizingCol = false;
  resizerCol.addEventListener("mousedown", () => {
    isResizingCol = true;
    document.body.style.cursor = "col-resize";
  })
  

  window.addEventListener("mousemove", e => {
    if (!isResizingCol) return;
    const containerWidth = container.offsetWidth;
    const leftWidth = e.clientX;
    const rightWidth = containerWidth - leftWidth - 5;
    containerNav.style.width = `${leftWidth}px`;
    imagePanel.style.width = `${rightWidth}px`;
  })

  window.addEventListener("mouseup", () => {
    isResizingCol = false;
    document.body.style.cursor = "default";
    refreshMap();
  })
}
//////////////////////////////Nav-Buttons//////////////////////////////////////

// Preventing map scroll when in nav div 
document.getElementById('nav').addEventListener('wheel', function(e) {
  if (!this.classList.contains('hidden')) {
    e.stopPropagation();
  }
}, { passive: false });


document.getElementById('nav-prev').addEventListener('click', () => {
  previousPhotoDisplayIndex()
})

document.getElementById('nav-next').addEventListener('click', () => {
  nextPhotoDisplayIndex()
})


document.getElementById("fast-prev").addEventListener("click", () => {
  const amount = parseInt(document.getElementById("fast-travel-amount").value) || 1;
  console.log(`Going back ${amount} steps`);
  subToDisplayIndex(amount)
  // your logic to go back
});

document.getElementById("fast-next").addEventListener("click", () => {
  const amount = parseInt(document.getElementById("fast-travel-amount").value) || 1;
  console.log(`Going forward ${amount} steps`);
  addToDisplayIndex(amount)
  // your logic to go forward
});

/////////////////////////////Tag Modal /////////////////////////////////////////

const tagModal = document.getElementById('tagModal');
const tagModalOpenBtn = document.getElementById('openTagModalBtn');
const tagModalCloseBtn = document.getElementById('closeTagModalBtn');
const tagModalCreateBtn = document.getElementById('createTagBtn');
const tagModalDeleteBtn = document.getElementById('deleteTagBtn');
const tagModalError = document.getElementById('tagError');

tagModalOpenBtn.addEventListener('click', () => {
  updateTagsList()
  tagModal.classList.remove('hidden');
  tagModal.style.display = 'flex';
});

tagModalCloseBtn.addEventListener('click', () => {
  tagModal.classList.add('hidden');
  tagModal.style.display = 'none';
  tagModalError.textContent = '';
});

tagModalCreateBtn.addEventListener('click', async () => {
  const tagName = document.getElementById('newTagName').value.trim();
  const color = document.getElementById('tag-color-picker').value
  if (!tagName) {
    tagModalError.textContent = 'Please enter a tag name.';
    return;
  }

  
  try {
    const newTag = await postNewTag(tagName, color);
    console.log('Created tag:', newTag);

    // Reset tagModal
    tagModal.classList.add('hidden');
    tagModal.style.display = 'none';
    tagModalError.textContent = '';
    document.getElementById('newTagName').value = '';
    updateTagsList()
    alert("New Tag Created!");
  } catch (err) {
    // ⛔ Error: show in UI
    tagModalError.textContent = err.message || 'Error creating tag.';
    console.error("UI display error:", err.message);
  }
});

tagModalDeleteBtn.addEventListener('click', async () =>{
  const tagName = document.getElementById('deleteTagName').value.trim();
  // TO DO 
  if (!tagName) {
    tagModalError.textContent = 'Please enter a tag name.';
    return;
  }

  try {
    const newTag = await deleteTag(tagName);
    console.log('deleted tag:', newTag);

    // Reset tagModal
    updateTagsList()
    tagModalError.textContent = '';
    alert(`Deleted tag : ${tagName}`);
  } catch (err) {
    // ⛔ Error: show in UI
    tagModalError.textContent = err.message || 'Error creating tag.';
    console.error("UI display error:", err.message);
  }
})

const tagModalColorButtons = document.querySelectorAll('.color-choice')
const tagModalColorPicker = document.getElementById('tag-color-picker')

tagModalColorButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const color = btn.getAttribute('data-color')
    tagModalColorPicker.value = color
  })
})

/////////////////////////////Offset Modal Logic////////////////////////////////

const offsetModal = document.getElementById('offset-modal');
// Offset modal open Btn is created in infoBar
const offsetModalCloseBtn = document.getElementById('offset-modal-close');
const offsetModalValidate = document.getElementById('offset-modal-validate');
const offsetModalAmount = document.getElementById('offset-modal-amount');
const offsetModalError = document.getElementById('offset-modal-error');

offsetModalCloseBtn.addEventListener('click', () => {
  offsetModal.classList.add('hidden');
  offsetModal.style.display = 'none';
  offsetModalError.textContent = '';
});

offsetModalValidate.addEventListener('click', async () => {
  const amount = parseInt(offsetModalAmount.value) || 0
  const currentSurveyID = getCurrentSurveyID()
  
  try {
    const newSurvey = await postOffset(currentSurveyID, amount);
    setCurrentSurvey(newSurvey)
    updatePanelPhoto()

    // Reset offsetModal
    offsetModal.classList.add('hidden');
    offsetModal.style.display = 'none';
    offsetModalError.textContent = '';
  } catch (err) {
    // ⛔ Error: show in UI
    offsetModalError.textContent = err.message || 'Error creating offset.';
    console.error("UI display error:", err.message);
  }
});
