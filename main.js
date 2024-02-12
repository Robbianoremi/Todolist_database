const taskToDoEl = document.querySelector("#tasks");

function loadTask() {
  fetch("https://localhost:3000/tasks")
    .then((response) => response.json())
    .then((response) => viewTasks(response))
    .catch((error) => alert("Erreur : " + error));
}

function viewTasks(response) {
  response.forEach((element) => {
    const cardTask = document.createElement("div");
    const titletaskEl = document.createElement("h3");
    const contentTaskEl = document.createElement("p");
    titletaskEl.textContent = element.tasktitle;
    contentTaskEl.textContent = element.taskcontent;
    cardTask.append(titletaskEl, contentTaskEl);
   taskToDoEl.appendChild(cardTask);
  });
}

loadTask();
