

// Not Used finally

// const logDiv = document.getElementById("custom-logs-div");
// const logs = [];
// const MAX_LOGS = 5;

// export function addEphemereLog(message) {
//   const id = Date.now() + Math.random(); // id unique
//   const entry = { id, message };
//   logs.push(entry);

//   if (logs.length > MAX_LOGS) {
//     logs.shift(); // FIFO : retire le plus ancien
//   }

//   renderLogs();

//   // après 5s -> fade-out puis suppression
//   setTimeout(() => {
//     const el = document.getElementById(`log-${id}`);
//     if (el) {
//       el.classList.add("fade");
//       setTimeout(() => {
//         // supprime vraiment après l’anim
//         const idx = logs.findIndex(l => l.id === id);
//         if (idx !== -1) {
//           logs.splice(idx, 1);
//           renderLogs();
//         }
//       }, 1000); // durée du fade
//     }
//   }, 5000);
//   return id
// }


// export function addLog(message) {
//   const id = Date.now() + Math.random(); // id unique
//   const entry = { id, message };
//   logs.push(entry);

//   if (logs.length > MAX_LOGS) {
//     logs.shift();
//     logs = logs.filter(Boolean)
//   }

//   renderLogs();

//   return id
// }

// export function replaceLog(message, id){
//     const idx = logs.findIndex(l => l.id === id);
//     if (idx !== -1) {
//         logs[idx] = message
//         logs = logs.filter(Boolean)
//         renderLogs()
//     }
// }

// export function disapearLog(id){
//     setTimeout(() => {
//     const el = document.getElementById(`log-${id}`);
//     if (el) {
//       el.classList.add("fade");
//       setTimeout(() => {
//         // supprime vraiment après l’anim
//         const idx = logs.findIndex(l => l.id === id);
//         if (idx !== -1) {
//           logs.splice(idx, 1);
//           logs = logs.filter(Boolean)
//           renderLogs();
//         }
//       }, 1000); // durée du fade
//     }
//   }, 5000);
// }

// function renderLogs() {
//   logDiv.innerHTML = logs
//     .filter(l => l !== undefined)  // retire les undefined
//     .map(l => `<div id="log-${l.id}" class="log-entry">${l.message}</div>`)
//     .join("");
// }