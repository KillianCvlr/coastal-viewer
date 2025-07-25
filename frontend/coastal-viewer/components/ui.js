import { deleteTag, postNewTag } from '../api.js';
import { refreshMap } from './map.js'
import {nextPhotoDisplayIndex, previousPhotoDisplayIndex} from './navigationLogic.js'
import { getTagsByIds, updateTagsList } from './tagLogic.js';

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

  // Horizontal resizer between map and nav
  const resizerRaw = document.getElementById("resizer-raw");
  const mapDiv = document.getElementById("map");
  const navDiv = document.getElementById("nav");

  let isResizingRow = false;

  resizerRaw.addEventListener("mousedown", function(e) {
    isResizingRow = true;
    document.body.style.cursor = "row-resize";
  });

  window.addEventListener("mousemove", function(e) {
    if (!isResizingRow) return;
    const containerNavHeight = containerNav.offsetHeight;
    const topHeight = e.clientY - containerNav.getBoundingClientRect().top;
    const bottomHeight = containerNavHeight - topHeight - 5;
    mapDiv.style.height = `${topHeight}px`;
    navDiv.style.height = `${bottomHeight}px`;
  });

  window.addEventListener("mouseup", function() {
    isResizingRow = false;
    document.body.style.cursor = "default";
    refreshMap();
  });
}

//////////////////////////////Nav-Buttons//////////////////////////////////////

document.getElementById('nav-prev').addEventListener('click', () => {
  nextPhotoDisplayIndex()
})

document.getElementById('nav-next').addEventListener('click', () => {
  previousPhotoDisplayIndex()
})

/////////////////////////////Tag Logic/////////////////////////////////////////

const modal = document.getElementById('tagModal');
const openBtn = document.getElementById('openTagModalBtn');
const closeBtn = document.getElementById('closeTagModalBtn');
const createBtn = document.getElementById('createTagBtn');
const deleteBtn = document.getElementById('deleteTagBtn');
const tagError = document.getElementById('tagError');

openBtn.addEventListener('click', () => {
  updateTagsList()
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
});

closeBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
  modal.style.display = 'none';
  tagError.textContent = '';
});

createBtn.addEventListener('click', async () => {
  const tagName = document.getElementById('newTagName').value.trim();
  const color = document.getElementById('tag-color-hex').value
  if (!tagName) {
    tagError.textContent = 'Please enter a tag name.';
    return;
  }

  
  try {
    const newTag = await postNewTag(tagName, color);
    console.log('Created tag:', newTag);

    // Reset modal
    modal.classList.add('hidden');
    modal.style.display = 'none';
    tagError.textContent = '';
    document.getElementById('newTagName').value = '';
    alert("New Tag Created!");
    updateTagsList()
  } catch (err) {
    // ⛔ Error: show in UI
    tagError.textContent = err.message || 'Error creating tag.';
    console.error("UI display error:", err.message);
  }
});

deleteBtn.addEventListener('click', async () =>{
  const tagName = document.getElementById('newTagName').value.trim();
  // TO DO 
  if (!tagName) {
    tagError.textContent = 'Please enter a tag name.';
    return;
  }

  try {
    const newTag = await deleteTag(tagName);
    console.log('deleted tag:', newTag);

    // Reset modal
    updateTagsList()
    tagError.textContent = '';
    alert('Deleted tag :', tagName);
  } catch (err) {
    // ⛔ Error: show in UI
    tagError.textContent = err.message || 'Error creating tag.';
    console.error("UI display error:", err.message);
  }
})

const colorButtons = document.querySelectorAll('.color-choice')
const colorPicker = document.getElementById('tag-color-picker')
const colorHexInput = document.getElementById('tag-color-hex')

colorButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const color = btn.getAttribute('data-color')
    colorPicker.value = color
    colorHexInput.value = color
  })
})

colorPicker.addEventListener('input', () => {
  colorHexInput.value = colorPicker.value
})

colorHexInput.addEventListener('input', () => {
  if (/^#[0-9A-Fa-f]{6}$/.test(colorHexInput.value)) {
    colorPicker.value = colorHexInput.value
  }
})

