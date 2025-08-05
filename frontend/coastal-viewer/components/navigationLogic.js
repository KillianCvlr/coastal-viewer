// Loading Photo logic
import {loadPhotoInPanelMain, loadPhotoInPanelSecond } from "./impagePanel"
import { updatePhotoInfoBar } from "./infoBar"
import { updateNavMarker } from "./map"


// Lists that contains every photos from the response
let aboveAllList =[]
let underAllList =[]

// Nav Lists are lists corresponding with filter/exclude preference, used to navigate
let aboveNavList = []
let underNavList = []


let photoDisplayIndex = 0
let navListLength = 0
let underwaterOffset = 0
let currentSurvey = null
let currentSurveyID

export function cleanAllNav(){
    aboveNavList = []
    underNavList = []
    photoDisplayIndex = 0
    navListLength = 0
    currentSurveyID = 0
    currentSurvey = null
    underwaterOffset = 0
}

export function setCurrentSurvey(surveyData){
    if (!surveyData){ return }
    //currentSurvey = surveyData
    underwaterOffset = surveyData.underwater_offset
    currentSurveyID = surveyData.id
}

export function setaboveAllList(list){
    aboveAllList = list
}

export function setunderAllList(list){
    underAllList = list
}
export function getCurrentSurveyID(){
    return currentSurveyID
}

export function getUnderwaterOffset(){
    return underwaterOffset
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

export function updateAboveNavList(photoList){
    aboveNavList = photoList.sort((a, b) => a.in_surey_index - b.in_surey_index)
    navListLength = aboveNavList.length
}
export function updateUnderNavList(photoList){
    underNavList = photoList.sort((a, b) => a.in_surey_index - b.in_surey_index)
}

export function updateListWithNewPhoto(newPhoto){
    if (!newPhoto){ return}
    if (newPhoto.is_underwater) {
        underNavList[newPhoto.in_surey_index] = newPhoto
    } else {
        aboveNavList[newPhoto.in_surey_index] = newPhoto
    }
}

export async function changePhotoDisplayToIndex(i){
    if (i > 0 && i < navListLength){
        photoDisplayIndex = i
        updatePanelPhoto()
    }
}

export async function addToDisplayIndex(i){
    if (photoDisplayIndex + i >= navListLength-1){
        photoDisplayIndex = navListLength-1
        updatePanelPhoto()
        return
    }
    photoDisplayIndex += i
    updatePanelPhoto()
}

export async function subToDisplayIndex(i){
    if (photoDisplayIndex - i <= 0){
        photoDisplayIndex = 0
        updatePanelPhoto()
        return
    }
    photoDisplayIndex -= i
    updatePanelPhoto()
}

export async function nextPhotoDisplayIndex(){
    if (photoDisplayIndex < navListLength-1){
        photoDisplayIndex +=1
        updatePanelPhoto()
    }
}

export async function previousPhotoDisplayIndex(){
    if (photoDisplayIndex > 0){
        photoDisplayIndex -=1
        updatePanelPhoto()
    }
}

export function getCurrentAbovePhoto(){
    return aboveNavList[photoDisplayIndex]
}

export function getCurrentUnderPhoto(){
    return underNavList[photoDisplayIndex]
}

export async function updatePanelPhoto(){
  const photoDisplayAbove = aboveNavList[photoDisplayIndex]
  let photoDisplayUnder = null
  if((0 <= photoDisplayIndex + underwaterOffset) && (photoDisplayIndex + underwaterOffset< underNavList.length)) {
    photoDisplayUnder = underNavList[photoDisplayIndex + underwaterOffset]
    loadPhotoInPanelSecond(photoDisplayUnder.filepath)
  }
  if(photoDisplayAbove.coords) {updateNavMarker(photoDisplayAbove.coords[0], photoDisplayAbove.coords[1])}
  updatePhotoInfoBar(photoDisplayAbove, photoDisplayUnder)
  loadPhotoInPanelMain(photoDisplayAbove.filepath)
}