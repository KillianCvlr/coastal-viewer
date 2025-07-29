// Loading Photo logic
import {loadPhotoInPanelMain, loadPhotoInPanelSecond } from "./impagePanel"
import { updatePhotoInfoBar } from "./infoBar"
import { updateNavMarker } from "./map"

let aboveNavList = []
let underNavList = []
let photoDisplayIndex = 0
let navListLength = 0

export function cleanAllNav(){
    aboveNavList = []
    underNavList = []
    photoDisplayIndex = 0
    navListLength = 0
}

export function getAboveNavListLength() {
    return aboveNavList.length   
}

export function getUnderNavListLength() {
    return underNavList.length    
}

export function updateNavListAbove(photoList){
    aboveNavList = photoList.sort((a, b) => a.local_index - b.local_index)
    navListLength = aboveNavList.length
}
export function updateNavListUnder(photoList){
    underNavList = photoList.sort((a, b) => a.local_index - b.local_index)
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

export async function updatePanelPhoto(){
  const photoDisplayAbove = aboveNavList[photoDisplayIndex]
  let photoDisplayUnder = null
  if(photoDisplayIndex < underNavList.length) {
    photoDisplayUnder = underNavList[photoDisplayIndex]
    loadPhotoInPanelSecond(photoDisplayUnder.filepath)
  }
  if(photoDisplayAbove.coords) {updateNavMarker(photoDisplayAbove.coords[0], photoDisplayAbove.coords[1])}
  updatePhotoInfoBar(photoDisplayAbove, photoDisplayUnder)
  loadPhotoInPanelMain(photoDisplayAbove.filepath)
}