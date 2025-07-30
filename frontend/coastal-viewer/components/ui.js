import { deleteTag, postNewTag } from '../../shared/api.js';
import { refreshMap } from './map.js'
import {addToDisplayIndex, nextPhotoDisplayIndex, previousPhotoDisplayIndex, subToDisplayIndex} from './navigationLogic.js'
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
  previousPhotoDisplayIndex()
})

document.getElementById('nav-next').addEventListener('click', () => {
  nextPhotoDisplayIndex()
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
  const color = document.getElementById('tag-color-picker').value
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
    updateTagsList()
    alert("New Tag Created!");
  } catch (err) {
    // ⛔ Error: show in UI
    tagError.textContent = err.message || 'Error creating tag.';
    console.error("UI display error:", err.message);
  }
});

deleteBtn.addEventListener('click', async () =>{
  const tagName = document.getElementById('deleteTagName').value.trim();
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

colorButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const color = btn.getAttribute('data-color')
    colorPicker.value = color
  })
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