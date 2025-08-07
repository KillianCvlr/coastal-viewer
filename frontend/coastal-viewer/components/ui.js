import { deleteTag, postNewTag, postOffset } from '../../shared/api.js';
import {  refreshMap } from './map.js'
import {addToDisplayIndex, changePhotoDisplayToIndex, getAboveNavList, getBegSelectIndexInNav, getCurrentSurveyID, getEndSelectIndexInNav, nextphotoDisplayIndexInNav, previousphotoDisplayIndexInNav, setBegSelectToCurrDisplay, setCurrentSurvey, setEndSelectToCurrDisplay, subToDisplayIndex, updateAboveNavList, updatePanelPhoto} from './navigationLogic.js'
import { applyFiltering, updateSelectModaltagList, updateTagsList } from './tagLogic.js';

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
});

endSelectBtn.addEventListener("click", () => {
  setEndSelectToCurrDisplay()
  endSelectBtn.innerHTML = `${getEndSelectIndexInNav()}`
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
  menuModalError.textContent = '';
});


/////////////////////////////Select Modal Logic////////////////////////////////

const selectModal = document.getElementById('select-modal');
const selectModalOpenBtn = document.getElementById('select-modal-open-btn')
const selectModalCloseBtn = document.getElementById('select-modal-close-btn');
const selectModalAddBtn = document.getElementById('select-modal-set');
const selectModalSetBtn = document.getElementById('select-modal-add');
const selectModalTagList = document.getElementById('select-modal-tag-list')
const selectModalPhotoSelect = document.getElementById('select-modal-photo-select')

selectModalOpenBtn.addEventListener('click', () => {
  if ((getBegSelectIndexInNav() === -1) || (getEndSelectIndexInNav() === -1)){
    alert("Please set up selection markers before continuing")
    return
  }
  updateSelectModaltagList()
  selectModal.classList.remove('hidden');
  selectModal.style.display = 'flex';
});

selectModalCloseBtn.addEventListener('click', () => {
  selectModal.classList.add('hidden');
  selectModal.style.display = 'none';
  selectModalError.textContent = '';
});


///////////////////////////// Keyboard Logic //////////////////////////////////

const setTagPhotoBtn = document.getElementById('tag-set-to-photo')
const addTagPhotoBtn = document.getElementById('tag-add-to-photo')
const filterByTagBtn = document.getElementById('tag-filter-by-btn')
const excludeTagBtn = document.getElementById('tag-exclude-btn')
const toggleInfoBarBtn = document.getElementById('toggle-info-btn');



document.addEventListener('keydown', function(event) {
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
    case 'i':
      toggleInfoBarBtn?.click();
      break;
  }
});