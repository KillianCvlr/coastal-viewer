// Loading Photo logic
import {loadPhotoInPanelMain, loadPhotoInPanelSecond } from "./impagePanel"
import { updatePhotoInfoBar } from "./infoBar"
import { addPhotoMarkers, updateNavMarker, clearPhotoMarkers, updateSelectMarkerBeg, updateSelectMarkerEnd, swapSelectMarkers } from "./map"
import { getTagsByIds, getTagsExcluded, getTagsFiltered } from "./tagLogic"
import { resetSelectBtnUi } from "./ui"


// Lists that contains every photos from the response
// Served for display in PhotoPanel and infoBar
let aboveAllList =[]
let underAllList =[]

// Nav Lists are lists corresponding with filter/exclude preference, used to navigate
// Now contains all photo Information, better if only the Id so List[int]
let aboveNavList = []
let underNavList = []


let photoDisplayIndexInNav = 0
let navListLength = 0
let underwaterOffset = 0
let currentSurvey = null
let currentSurveyID
let begSelectIndexInNav = -1
let endSelectIndexInNav = -1


export function cleanAllNav(){
    aboveNavList = []
    underNavList = []   
    aboveAllList = []
    underAllList = []
    photoDisplayIndexInNav = 0
    navListLength = 0
    currentSurveyID = 0
    currentSurvey = null
    underwaterOffset = 0
    begSelectIndexInNav = -1
    endSelectIndexInNav = -1
    resetSelectBtnUi()
}

export function setCurrentSurvey(surveyData){
    if (!surveyData){ return }
    currentSurvey = surveyData
    underwaterOffset = surveyData.underwater_offset
    currentSurveyID = surveyData.id
}

export function setaboveAllList(list){
    aboveAllList = list.sort((a, b) => a.in_survey_index - b.in_survey_index)
}

export function setunderAllList(list){
    underAllList = list.sort((a, b) => a.in_survey_index - b.in_survey_index)
}
export function getCurrentSurveyID(){
    return currentSurveyID
}

export function getCurrentSurveyCoords(){
    return currentSurvey.coords
}

export function getUnderwaterOffset(){
    return underwaterOffset
}

export function getAboveAllListLength(){
    return aboveAllList.length
}
export function getUnderAllListLength(){
    return underAllList.length
}

export function getIndexInNav(){
    return photoDisplayIndexInNav
}


////////////////////////////////////// Nav Lists //////////////////////////////

function filterPhotosByTags(allPhotosList, filterByTagList, excludeTagList) {
  if (filterByTagList.length === 0 && excludeTagList.length === 0) {
    return allPhotosList;
  }

  return allPhotosList.filter(photo => {
    const photoTags = photo.tag_ids || [];

    // Exclude photos that contain any excluded tag
    if (excludeTagList.some(tag => photoTags.includes(tag.id))) {
      return false;
    }

    // Include only if ALL filterByTagList tags are in photo.tags
    return filterByTagList.every(tag => photoTags.includes(tag.id));
  });
}


export function getAboveNavList(){
    return aboveNavList
}

export function getUnderNavList(){
    return underNavList
}

export function getAboveNavListLength() {
    return aboveNavList.length   
}

export function getUnderNavListLength() {
    return underNavList.length    
}

export function updateAboveNavList(){
    //filtering directly from aboveAllList
    const filterByTagList = getTagsFiltered()
    const excludedTagList = getTagsExcluded()
    console.log(`filtering photos....`)
    const filteredPhotos = filterPhotosByTags(aboveAllList, filterByTagList, excludedTagList )
    if(filteredPhotos.length === 0) {
        console.log(`filtering executed, no photo found under filtering parameters !`)
        alert("filtering executed, no photo found under filtering parameters !  \n Continuing with all photos from survey")
        aboveNavList = aboveAllList
        navListLength = aboveNavList.length
        changePhotoDisplayToIndex(0)
        return
    }
    aboveNavList = filteredPhotos
    navListLength = aboveNavList.length
    console.log(`filtering executed, now ${navListLength} photos discoverable !`)
    clearPhotoMarkers()
    clearPhotoSelect()
    changePhotoDisplayToIndex(0)
    addPhotoMarkers(aboveNavList)
}


export function updateUnderNavList(){
    underNavList = underAllList
}

export function updateListWithNewPhoto(newPhoto){
    if (!newPhoto){ return}
    if (newPhoto.is_underwater) {
        underAllList[newPhoto.in_survey_index] = newPhoto
        
    } else {
        aboveAllList[newPhoto.in_survey_index] = newPhoto
    }
}

export function updateListWithNewPhotoList(newPhotoList){
    if (!Array.isArray(newPhotoList)) {
        console.error("Expected an array of photos but got:", newPhotoList);
        return;
    }

    newPhotoList.forEach(photo => {
        updateListWithNewPhoto(photo)
    });
}

export async function changePhotoDisplayToIndex(i){
    if (i >= 0 && i < navListLength){
        photoDisplayIndexInNav = i
        updatePanelPhoto()
    }
}

export async function addToDisplayIndex(i){
    if (photoDisplayIndexInNav + i >= navListLength-1){
        photoDisplayIndexInNav = navListLength-1
        updatePanelPhoto()
        return
    }
    photoDisplayIndexInNav += i
    updatePanelPhoto()
}

export async function subToDisplayIndex(i){
    if (photoDisplayIndexInNav - i <= 0){
        photoDisplayIndexInNav = 0
        updatePanelPhoto()
        return
    }
    photoDisplayIndexInNav -= i
    updatePanelPhoto()
}

export async function nextphotoDisplayIndexInNav(){
    if (photoDisplayIndexInNav < navListLength-1){
        photoDisplayIndexInNav +=1
        updatePanelPhoto()
    }
}

export async function previousphotoDisplayIndexInNav(){
    if (photoDisplayIndexInNav > 0){
        photoDisplayIndexInNav -=1
        updatePanelPhoto()
    }
}

export function getCurrentAbovePhoto(){
    return aboveNavList[photoDisplayIndexInNav]
}

export function getCurrentUnderPhoto(){
    const underIndex = getUnderPhotoIndex()
    return underNavList[underIndex]
}

function getUnderPhotoIndex(){
    return (aboveNavList[photoDisplayIndexInNav].in_survey_index + underwaterOffset)
}

//////////////////////// Photo Selection //////////////////////////////////////

export function clearPhotoSelect(){
    begSelectIndexInNav = -1
    endSelectIndexInNav = -1
}

export function setBegSelectToCurrDisplay(){
    if (endSelectIndexInNav >= 0 && endSelectIndexInNav <= photoDisplayIndexInNav){
        // if end exist and is less than new beg, switch both and assing new end
        begSelectIndexInNav = endSelectIndexInNav
        endSelectIndexInNav = photoDisplayIndexInNav
        swapSelectMarkers()
        updateSelectMarkerEnd()
    } else {
        begSelectIndexInNav = photoDisplayIndexInNav
        updateSelectMarkerBeg()
    }
}

export function setEndSelectToCurrDisplay(){
    if (begSelectIndexInNav < 0){
        begSelectIndexInNav = photoDisplayIndexInNav
        updateSelectMarkerBeg()
    } else {
        if(begSelectIndexInNav >= photoDisplayIndexInNav){
            endSelectIndexInNav = begSelectIndexInNav
            begSelectIndexInNav = photoDisplayIndexInNav
            swapSelectMarkers()
            updateSelectMarkerBeg()
        } else {
            endSelectIndexInNav = photoDisplayIndexInNav
            updateSelectMarkerEnd()
        }
    }
}

export function getBegSelectIndexInNav(){
    return begSelectIndexInNav
}

export function getEndSelectIndexInNav(){
    return endSelectIndexInNav
}


export function getSelectedPhotoIds() {
    if (begSelectIndexInNav < 0 || endSelectIndexInNav < 0) {
        console.error("Selection markers are not set");
        return {
            abovePhotoIds: [],
            underPhotoIds: [],
            allPhotoIds: [],
        };
    }

    const beg = Math.min(begSelectIndexInNav, endSelectIndexInNav);
    const end = Math.max(begSelectIndexInNav, endSelectIndexInNav);

    const photoIds = [];

    for (let i = beg; i <= end; i++) {
        const abovePhoto = aboveNavList[i];
        if (abovePhoto && abovePhoto.id !== undefined) {
            photoIds.push(abovePhoto.id);
        }

        const underIndex = abovePhoto.in_survey_index + underwaterOffset;
        if (underIndex >= 0 && underIndex < underNavList.length) {
            const underPhoto = underNavList[underIndex];
            if (underPhoto && underPhoto.id !== undefined) {
                photoIds.push(underPhoto.id);
            }
        }
    }

    return photoIds
}

//////////////////////// Total Display ////////////////////////////////////////

export async function updatePanelPhoto(){
    const photoDisplayAbove = aboveAllList[aboveNavList[photoDisplayIndexInNav].in_survey_index]
    let photoDisplayUnder = null
    const underIndex = getUnderPhotoIndex()
    if((0 <= underIndex) && (underIndex< underNavList.length)) {
        photoDisplayUnder = underNavList[underIndex]
        loadPhotoInPanelSecond(photoDisplayUnder.filepath)
    } else {
        console.error("Under index out of bounds")
        document.getElementById('second-image').src = ""
    }
    updateNavMarker(photoDisplayAbove.coords)
    updatePhotoInfoBar(photoDisplayAbove, photoDisplayUnder)
    loadPhotoInPanelMain(photoDisplayAbove.filepath)
    }


////////////////////// Extraction Function //////////////////////////////////////////

export function exportNavToCsv(csvName) {
    console.info("Exporting Nav to CSV");
    let csvContent = "data:text/csv;charset=utf-8,";
    // header row first
    csvContent += "AboveWater Path,Underwater Path,Location,Timestamp,AboveWater Tags,Underwater Tags\r\n";


    for (let index = 0; index < aboveNavList.length; index++) {
        try {
            let row = "";
            const photoAbove = aboveNavList[index];
            row += (photoAbove.filepath || "") + ",";

            const underIndex = photoAbove.in_survey_index + underwaterOffset;
            const photoUnder = (0 <= underIndex && underIndex < underNavList.length) ? underNavList[underIndex] : null;
            row += (photoUnder?.filepath || "") + ",";

            row += (photoAbove.coords || ",") + ",";
            row += (photoAbove.datetime || "") + ",";

            const tagsAbove = getTagsByIds(photoAbove.tag_ids).map(t => t.name).join("_");
            const tagsUnder = photoUnder ? getTagsByIds(photoUnder.tag_ids).map(t => t.name).join("_") : "";

            row += tagsAbove + "," + tagsUnder;
            csvContent += row + "\r\n";
        } catch (err) {
            throw new Error(err.message || "Error extracting navigation metadata");
        }
    }

    console.info("Csv Exported");

    // Auto-download CSV
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", csvName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return csvContent;
}
