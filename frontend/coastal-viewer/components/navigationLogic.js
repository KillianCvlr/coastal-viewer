// Loading Photo logic
import {loadPhotoInPanelMain, loadPhotoInPanelSecond } from "./impagePanel"
import { updatePhotoInfoBar } from "./infoBar"
import { updateNavMarker } from "./map"

let aboveNavList = []
let underNavList = []
let photoDisplayIndex = 0
let navListLength = 0

export async function updateNavListAbove(photoList){
    aboveNavList = photoList.sort((a, b) => a.local_index - b.local_index)
    navListLength = aboveNavList.length
}
export async function updateNavListUnder(photoList){
    underNavList = photoList.sort((a, b) => a.local_index - b.local_index)
}

export async function changePhotoDisplayToIndex(i){
    if (i > 0 && i < navListLength){
        photoDisplayIndex = i
        updatePanelPhoto()
    }
}

export async function nextPhotoDisplayIndex(){
    if (photoDisplayIndex < navListLength){
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
  const photoDisplayUnder = underNavList[photoDisplayIndex]
  if(photoDisplayAbove.coords) {updateNavMarker(photoDisplayAbove.coords[0], photoDisplayAbove.coords[1])}
  updatePhotoInfoBar(photoDisplayAbove, photoDisplayUnder)
  loadPhotoInPanelMain(photoDisplayAbove.filepath)
  loadPhotoInPanelSecond(photoDisplayUnder.filepath)
}