import { fetchTags, setTagsToPhoto, addTagsToPhoto} from "../../shared/api"
import { updatePhotoInfoBar } from "./infoBar"
import { getCurrentAbovePhoto, getCurrentUnderPhoto, updateListWithNewPhoto } from "./navigationLogic"

let tagsList = []
let tagsSelected = []
let tagsFiltered = []
let tagsExcluded = []

const modalTagList = document.getElementById('modal-tag-list')
const unselectedTagListDiv = document.getElementById('tag-unselected-list')
const selectedTagListDiv = document.getElementById('tag-selected-list')
const filteredByTagListDiv = document.getElementById('nav-filter-tag-list')
const excludedTagListDiv = document.getElementById('nav-exclude-tag-list')

function selectTag(tagId) {
  const tag = tagsList.find(t => t.id === tagId)
  if (!tagsSelected.find(t => t.id === tagId)) {
    tagsSelected.push(tag)
  }
  updateSelectedTags()
  updateUnselectedTags()
}

function unselectTag(tagId) {
  tagsSelected = tagsSelected.filter(t => t.id !== tagId)
  updateSelectedTags()
  updateUnselectedTags()
}


export function updateSelectedTags() {
  selectedTagListDiv.innerHTML = ''

  tagsSelected.forEach(tag => {
    const badge = document.createElement('span')
    badge.textContent = tag.name
    badge.style.backgroundColor = tag.color || '#999'
    badge.classList.add('tag-badge')
    badge.addEventListener('click', () => {
      unselectTag(tag.id)
    })
    selectedTagListDiv.appendChild(badge)
  })
}

export function updateUnselectedTags() {
  unselectedTagListDiv.innerHTML = ''

  const unselected = tagsList.filter(tag => !tagsSelected.find(t => t.id === tag.id))
  
  unselected.forEach(tag => {
    const badge = document.createElement('span')
    badge.textContent = tag.name
    badge.style.backgroundColor = '#999'
    badge.classList.add('tag-badge')
    badge.addEventListener('click', () => {
      selectTag(tag.id)
    })
    unselectedTagListDiv.appendChild(badge)
  })
}

function getSelectedTagsCopy(){
    return [...tagsSelected]
}

export function updateTagsFiltered(){
  tagsFiltered = getSelectedTagsCopy()
  showTagBadges(tagsFiltered,filteredByTagListDiv)
}

export function updateTagsExcluded(){
  tagsExcluded = getSelectedTagsCopy()
  showTagBadges(tagsExcluded, excludedTagListDiv)
}

export function getTagsFiltered(){
  return tagsFiltered
}

export function getTagsExcluded(){
  return tagsExcluded
}



/**
 * Creates and appends colored tag badges to a target container.
 *
 * @param {Array} tagList - Array of tags, each with a `name` and `color` field.
 * @param {HTMLElement} container - DOM element where badges will be appended.
 */
export function showTagBadges(tagList, container) {
    container.innerHTML = ''

    tagList.forEach(tag => {
        const badge = document.createElement('span')
        badge.textContent = tag.name
        badge.style.backgroundColor = tag.color || '#999'
        badge.classList.add('tag-badge')
        container.appendChild(badge)
    })
}

export function getSelectedTagsID() {
    return tagsSelected.map(tag => tag.id)
}

export function getTagsList(){
    return tagsList
}

export async function updateTagsList(){
    
    try {

        const fetchedTags = await fetchTags();
        tagsList = fetchedTags             // re-render UI
    } catch (err) {
        console.error("Error loading tags", err);
        alert(err.message);
     }
    
    updateSelectedTags()
    updateUnselectedTags()
    showTagBadges(tagsList, modalTagList)
}

/**
 * Returns full tag objects matching the given list of tag IDs.
 * 
 * @param {Array<number>} tagIds - Array of tag IDs from photoOut
 * @returns {Array<Object>} - Array of full tag objects
 */
export function getTagsByIds(tagIds) {
    if (!tagIds) {return []}
    return tagIds
    .map(id => tagsList.find(tag => tag.id === id))
    .filter(tag => tag !== undefined);  // remove missing
}

const setTagPhotoBtn = document.getElementById('tag-set-to-photo')
const addTagPhotoBtn = document.getElementById('tag-add-to-photo')
const filterByTagBtn = document.getElementById('tag-filter-by-btn')
const excludeTagBtn = document.getElementById('tag-exclude-btn')

setTagPhotoBtn.addEventListener('click', async () => {
    const currentPhotoAbove = getCurrentAbovePhoto()
    const currentPhotoUnder = getCurrentUnderPhoto()
    const selectedTagIds = getSelectedTagsID()

    try {
        let newPhotoAbove
        let newPhotoUnder
        if (currentPhotoAbove) {
            newPhotoAbove = await setTagsToPhoto(selectedTagIds, currentPhotoAbove.id)
            updateListWithNewPhoto(newPhotoAbove)
        }

        if (currentPhotoUnder) {
            newPhotoUnder = await setTagsToPhoto(selectedTagIds, currentPhotoUnder.id)
            updateListWithNewPhoto(newPhotoUnder)
        }
    
        updatePhotoInfoBar(newPhotoAbove,newPhotoUnder)

    } catch (err) {
        console.error("Updating tags failed:", err);
        alert(err.message);
    }
})

addTagPhotoBtn.addEventListener('click', async () => {
    let currentPhotoAbove = getCurrentAbovePhoto()
    let currentPhotoUnder = getCurrentUnderPhoto()
    const selectedTagIds = getSelectedTagsID()
    try {
        let newPhotoAbove
        let newPhotoUnder
        if (currentPhotoAbove) {
            newPhotoAbove = await addTagsToPhoto(selectedTagIds, currentPhotoAbove.id)
            updateListWithNewPhoto(newPhotoAbove)
        }

        if (currentPhotoUnder) {
            newPhotoUnder = await addTagsToPhoto(selectedTagIds, currentPhotoUnder.id)
            updateListWithNewPhoto(newPhotoUnder)
        }
    
        updatePhotoInfoBar(newPhotoAbove,newPhotoUnder)

    } catch (err) {
        console.error("Updating tags failed:", err);
        alert(err.message);
    }
})

filterByTagBtn.addEventListener('click', async () => {
  updateTagsFiltered()
})

excludeTagBtn.addEventListener('click', async () => {
  updateTagsExcluded()
})