import { fetchTags } from "../api"

let tagsList = []
const modalTagList = document.getElementById('modal-tag-list')

/**
 * Creates and appends colored tag badges to a target container.
 *
 * @param {Array} tagList - Array of tags, each with a `name` and `color` field.
 * @param {HTMLElement} container - DOM element where badges will be appended.
 */
export function showTagBadges(tagList, container) {
    // Clear container first
    container.innerHTML = ''

    tagList.forEach(tag => {
        const badge = document.createElement('span')
        badge.textContent = tag.name
        badge.style.backgroundColor = tag.color || '#999'
        badge.classList.add('tag-badge')
        container.appendChild(badge)
    })
}


export async function getTagsList(){
    return tagsList
}

export async function updateTagsList(){
    fetchTags()
        .then(fetchedTags =>{tagsList = fetchedTags})
        .catch(err => {
            console.error("Error loading tags", err)
        });
    showTagBadges(tagsList, modalTagList)
}

/**
 * Returns full tag objects matching the given list of tag IDs.
 * 
 * @param {Array<number>} tagIds - Array of tag IDs from photoOut
 * @returns {Array<Object>} - Array of full tag objects
 */
export function getTagsByIds(tagIds) {
  return tagIds
    .map(id => tagsList.find(tag => tag.id === id))
    .filter(tag => tag !== undefined);  // remove missing
}