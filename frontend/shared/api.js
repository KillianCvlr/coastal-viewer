
export async function fetchPhotos() {
  const res = await fetch('/photos/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
  if (!res.ok) throw new Error("Failed to fetch photos")
  return res.json()
}

export async function fetchSurveyPhotos(surveyId) {
  const res = await fetch(`/surveys/${surveyId}/photos/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error("Failed to fetch survey photos")
  return res.json()
}

export async function fetchSurveyPhotosUnderWater(surveyId) {
  const res = await fetch(`/surveys/${surveyId}/photos/underWater/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error("Failed to fetch survey photos underwater")
  return res.json()
}

export async function fetchSurveyPhotosAboveWater(surveyId) {
  const res = await fetch(`/surveys/${surveyId}/photos/aboveWater/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error("Failed to fetch survey photos above ater")
  return res.json()
}


export async function fetchSurveys() {
  const res = await fetch(`/surveys/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error("Failed to fetch surveys")
  return res.json()
}

export async function fetchFullResPhoto(photoPath) {
  const res = await fetch(`/photos/${encodeURIComponent(photoPath)}/fullRes/`, {
    method: 'GET',
  })
  if (!res.ok) throw new Error("Failed to fetch full res photo")
  return res.blob()
}

export async function fetchDownscaledPhoto(photoPath) {
  const res = await fetch(`/photos/${encodeURIComponent(photoPath)}/downscaled/`, {
    method: 'GET',
  })
  if (!res.ok) throw new Error("Failed to downscaled res photo")
  return res.blob()
}

export async function fetchTags() {
  const res = await fetch('/tags/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
  if (!res.ok) throw new Error("Failed to fetch tags")
  return res.json()
}


export async function postNewTag(tagName, color){
  const res = await fetch('/tags/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name:tagName, color })
  });

  const data = await res.json();
  if (!res.ok) {
    // Raise error object to be handled in UI
    let msg = "Unknown error";
    if (data?.detail) {
      if (Array.isArray(data.detail)) {
        msg = data.detail.map(err => `• ${err.loc.at(-1)}: ${err.msg}`).join('\n');
      } else if (typeof data.detail === "string") {
        msg = data.detail;
      }
    }
    throw new Error(msg);
  }

  return data; // new tag object
}

export async function deleteTag(tagName) {
  const res = await fetch(`/tags/${tagName}/`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Error deleting tag.");
  }
} 


export async function postSurvey(surveyData){
  const res = await fetch('/surveys/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyData),
      });   

  if (!res.ok){
    const error = await res.json();
    throw new Error(error.detail || "Error Posting Survey");
  }
  return res.json()
}


export async function deleteSurvey(surveyID){
  const res = await fetch(`/surveys/${surveyID}/`, {
        method: 'DELETE',
      });   

  if (!res.ok){
    const error = await res.json();
    throw new Error(error.detail || "Error deleting Survey");
  }
  return
}