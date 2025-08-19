import { addTagsToPhotoList, setTagsToPhotoList, deleteTag, postNewTag, postOffset, popTagsToPhotoList } from '../../shared/api.js';
import {  refreshMap } from './map.js'
import {addToDisplayIndex, exportNavToCsv, getAboveNavListLength, getBegSelectIndexInNav, getCurrentSurveyID, getEndSelectIndexInNav, getSelectedPhotoIds, nextphotoDisplayIndexInNav, previousphotoDisplayIndexInNav, selectAllNav, setBegSelectToCurrDisplay, setCurrentSurvey, setEndSelectToCurrDisplay, subToDisplayIndex, updateAboveNavList, updateListWithNewPhotoList, updatePanelPhoto} from './navigationLogic.js'
import { applyFiltering, getSelectedTagsID, updateSelectModaltagList, updateTagsList } from './tagLogic.js';

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
const fastTravelAmountDiv = document.getElementById("fast-travel-amount")
const navPrevDiv = document.getElementById('nav-prev')
const navNextDiv = document.getElementById('nav-next')
const fastPrevDiv = document.getElementById("fast-prev")
const fastNextDiv = document.getElementById("fast-next")
const applyFilteringBtn = document.getElementById("apply-filtering-btn")

const begSelectBtn = document.getElementById("beg-select-btn")
const endSelectBtn = document.getElementById("end-select-btn")
const selectAllBtn = document.getElementById("select-all-btn")

// Preventing map scroll when in nav div 
document.getElementById('nav').addEventListener('wheel', function(e) {
  if (!this.classList.contains('hidden')) {
    e.stopPropagation();
  }
}, { passive: false });


navPrevDiv.addEventListener('click', () => {
  previousphotoDisplayIndexInNav()
})

navNextDiv.addEventListener('click', () => {
  nextphotoDisplayIndexInNav()
})


fastPrevDiv.addEventListener("click", () => {
  const amount = parseInt(fastTravelAmountDiv.value) || 1;
  console.log(`Going back ${amount} steps`);
  subToDisplayIndex(amount)
  // your logic to go back
});

fastNextDiv.addEventListener("click", () => {
  const amount = parseInt(fastTravelAmountDiv.value) || 1;
  console.log(`Going forward ${amount} steps`);
  addToDisplayIndex(amount)
  // your logic to go forward
});

applyFilteringBtn.addEventListener("click", () => {
  applyFiltering()
  updateAboveNavList()
});

begSelectBtn.addEventListener("click", () => {
  setBegSelectToCurrDisplay()
  begSelectBtn.innerHTML = `${getBegSelectIndexInNav()}`
  endSelectBtn.innerHTML = `${getEndSelectIndexInNav()}`
});

endSelectBtn.addEventListener("click", () => {
  setEndSelectToCurrDisplay()
  begSelectBtn.innerHTML = `${getBegSelectIndexInNav()}`
  endSelectBtn.innerHTML = `${getEndSelectIndexInNav()}`
});

selectAllBtn.addEventListener("click", () => {
  if (getAboveNavListLength() > 0 ){
    selectAllNav()
    begSelectBtn.innerHTML = `${getBegSelectIndexInNav()}`
    endSelectBtn.innerHTML = `${getEndSelectIndexInNav()}`
  }
});

export function resetSelectBtnUi(){
  begSelectBtn.innerHTML = "+"
  endSelectBtn.innerHTML = "+"
}

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
  keybordActivated = false
});

tagModalCloseBtn.addEventListener('click', () => {
  tagModal.classList.add('hidden');
  tagModal.style.display = 'none';
  tagModalError.textContent = '';
  keybordActivated = true
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
    tagModalCloseBtn?.click()
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

/////////////////////////////Menu Modal Logic////////////////////////////////

const menuModal = document.getElementById('menu-modal');
const menuModalOpenBtn = document.getElementById('menu-modal-open-btn')
const menuModalCloseBtn = document.getElementById('menu-modal-close-btn');

menuModalOpenBtn.addEventListener('click', () => {
  menuModal.classList.remove('hidden');
  menuModal.style.display = 'flex';
});

menuModalCloseBtn.addEventListener('click', () => {
  menuModal.classList.add('hidden');
  menuModal.style.display = 'none';
});


/////////////////////////////Select Modal Logic////////////////////////////////

const selectModal = document.getElementById('select-modal');
const selectModalOpenBtn = document.getElementById('select-modal-open-btn')
const selectModalCloseBtn = document.getElementById('select-modal-close-btn');
const selectModalAddBtn = document.getElementById('select-modal-add');
const selectModalPopBtn = document.getElementById('select-modal-pop');
const selectModalSetBtn = document.getElementById('select-modal-set');
// selectModalTagList is  used only in tagLogic
const selectModalInfo = document.getElementById('select-modal-info')
const selectModalError = document.getElementById('select-modal-error')
const selectModalPhotoSelect = document.getElementById('select-modal-photo-select')

selectModalOpenBtn.addEventListener('click', () => {
  if ((getBegSelectIndexInNav() === -1) || (getEndSelectIndexInNav() === -1)){
    alert("Please set up selection markers before continuing")
    return
  }
  updateSelectModaltagList()
  updateSelectModalPhotoSelection()
  selectModal.classList.remove('hidden');
  selectModal.style.display = 'flex';
  selectModalInfo.innerHTML = ""
});

selectModalCloseBtn.addEventListener('click', () => {
  selectModal.classList.add('hidden');
  selectModal.style.display = 'none';
  selectModalError.textContent = '';
});

function updateSelectModalPhotoSelection(){
  const begIndex = getBegSelectIndexInNav()
  const endIndex = getEndSelectIndexInNav()
  selectModalPhotoSelect.innerHTML = `Selected photos from ${begIndex} to ${endIndex} for a total of ${endIndex - begIndex +1} photos \n`
}

let selectModalClickable = true;

selectModalAddBtn.addEventListener('click', async () => {
  const selectedTags = getSelectedTagsID()
  const selectedPhotos = getSelectedPhotoIds()

  if (!selectModalClickable) { return}

  try {
    selectModalClickable = false
    selectModalInfo.innerHTML = "Adding Tags to photos..."
    const newPhotos = await addTagsToPhotoList(selectedTags, selectedPhotos)
    updateListWithNewPhotoList(newPhotos)
    selectModalCloseBtn?.click()
    updatePanelPhoto()
    selectModalClickable = true
  } catch (err){
    selectModalError.textContent = err.message || 'Error adding new tags.';
    console.error("Error setting tags", err.message);
    selectModalClickable = true
    selectModalInfo.innerHTML = ""
  }
})

selectModalPopBtn.addEventListener('click', async () => {
  const selectedTags = getSelectedTagsID()
  const selectedPhotos = getSelectedPhotoIds()

  if (!selectModalClickable) { return}

  try {
    selectModalClickable = false
    selectModalInfo.innerHTML = "Poping Tags to photos..."
    const newPhotos = await popTagsToPhotoList(selectedTags, selectedPhotos)
    updateListWithNewPhotoList(newPhotos)
    selectModalCloseBtn?.click()
    updatePanelPhoto()
    selectModalClickable = true
  } catch (err){
    selectModalError.textContent = err.message || 'Error poping new tags.';
    console.error("Error setting tags", err.message);
    selectModalClickable = true
    selectModalInfo.innerHTML = ""
  }
})


selectModalSetBtn.addEventListener('click', async () => {
  const selectedTags = getSelectedTagsID()
  const selectedPhotos = getSelectedPhotoIds()

  if (!selectModalClickable) { return}

  try {
    selectModalClickable = false
    selectModalInfo.innerHTML = "Setting Tags to photos..."
    const newPhotos = await setTagsToPhotoList(selectedTags, selectedPhotos)
    updateListWithNewPhotoList(newPhotos)
    selectModalCloseBtn?.click()
    updatePanelPhoto() 
    selectModalClickable = true   
    selectModalInfo.innerHTML = ""
  } catch (err){
    selectModalError.textContent = err.message || 'Error setting new tags.';
    console.error("Error setting tags", err.message);
    selectModalClickable = true
    selectModalInfo.innerHTML = ""
  }
})


/////////////////////////////extract Modal Logic////////////////////////////////

const extractModal = document.getElementById('extraction-modal');
const extractModalOpenBtn = document.getElementById('extraction-modal-open-btn')
const extractModalCloseBtn = document.getElementById('extraction-modal-close-btn');

// extractModalTagList is  used only in tagLogic
const extractModalInfo = document.getElementById('extraction-modal-info')
const extractModalValidate = document.getElementById('extraction-modal-validate')
const extractModalError = document.getElementById('extraction-modal-error')
const extractModalPhotoExtract = document.getElementById('extraction-modal-photo-selection')

extractModalOpenBtn.addEventListener('click', () => {
  if ((getBegSelectIndexInNav() === -1) || (getEndSelectIndexInNav() === -1)){
    alert("Please set up extraction markers before continuing")
    return
  }
  
  updateExtractModalPhotoSelection()
  extractModal.classList.remove('hidden');
  extractModal.style.display = 'flex';
  extractModalInfo.innerHTML = ""
});

extractModalCloseBtn.addEventListener('click', () => {
  extractModal.classList.add('hidden');
  extractModal.style.display = 'none';
  extractModalError.textContent = '';
});

function updateExtractModalPhotoSelection(){
  const begIndex = getBegSelectIndexInNav()
  const endIndex = getEndSelectIndexInNav()
  extractModalPhotoExtract.innerHTML = `Selected photos from ${begIndex} to ${endIndex} for a total of ${endIndex - begIndex +1} photos \n`
}

let extractionClickable = true;

extractModalValidate.addEventListener('click', async () => {

  if (!extractionClickable) { return}

  try {
    extractionClickable = false
    let csvName = document.getElementById('extract-name-input').value.trim();
    if (!csvName) {
        extractModalInfo.innerHTML = "No CsvName, using Standard"
        csvName = "CoastalViewerExport"
    }

    extractModalInfo.innerHTML = "Extracting photos metadata..."
    // Extraction function
    let csvContent = exportNavToCsv(csvName)
    console.info(csvContent)


    extractModalCloseBtn?.click()
    extractionClickable = true   
    extractModalInfo.innerHTML = ""
  } catch (err){
    extractModalError.textContent = err.message || 'Error Extracting photos';
    console.error(err, err.details)
    extractionClickable = true
    extractModalInfo.innerHTML = ""
  }
})

///////////////////////////// Keyboard Logic //////////////////////////////////

let keybordActivated = true;

const setTagPhotoBtn = document.getElementById('tag-set-to-photo')
const addTagPhotoBtn = document.getElementById('tag-add-to-photo')
const filterByTagBtn = document.getElementById('tag-filter-by-btn')
const excludeTagBtn = document.getElementById('tag-exclude-btn')
const toggleInfoBarBtn = document.getElementById('toggle-info-btn');



document.addEventListener('keydown', function(event) {
  if (!keybordActivated){return}

  switch (event.key) {
    case 'a':
      addTagPhotoBtn?.click();
      break;
    case 's':
      setTagPhotoBtn?.click();
      break;
    case 'e':
      excludeTagBtn?.click();
      break;
    case 'f':
      filterByTagBtn?.click();
      break;
    case 'u':
      applyFilteringBtn?.click();
      break;
    case 'ArrowLeft':
      navPrevDiv?.click();
      break;
    case 'ArrowRight':
      navNextDiv?.click();
      break;
    case 'ArrowUp':
      fastNextDiv?.click();
      break;
    case 'ArrowDown':
      fastPrevDiv?.click();
      break;
    case 'i':
      toggleInfoBarBtn?.click();
      break;
    case 'Escape':
      if (menuModal) {
      // toggle only menu modal
      menuModal.style.display =  (menuModal.style.display === 'none') ? 'flex' : 'none';
    }
  }
});

document.querySelectorAll(".modal").forEach((modal) => {
  const content = modal.querySelector(".modal-content");

  // Close when clicking outside the modal content
  modal.addEventListener("click", (event) => {
    if (!content.contains(event.target)) {
      modal.classList.add("hidden");
      modal.style.display = 'none';
    }
  });
});

const toastContainer = document.getElementById('toast-container') 

export function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  toastContainer.appendChild(toast);
}

export function clearToasts(){
  toastContainer.innerHTML = ""
}

