// API: https://randomuser.me/api
// Tips:
// Struktur för en spelare finns som kommentar i index.html.
// Lägg till klassen "full" på .team när laget har fem spelare.

// E-sportsturneringen – exempellösning
const MAX_PLAYERS = 5;
const API_URL = "https://randomuser.me/api";

// ===== 1. Hämta element från DOM:en =====
const teamNameInput = document.querySelector("#team-name-input");
const changeNameBtn = document.querySelector("#change-name-btn");
const addPlayerBtn = document.querySelector("#add-player-btn");
const message = document.querySelector("#message");

// ===== Hjälpfunktioner =====

// Returnerar "A" eller "B" beroende på vilken radioknapp som är vald
function getSelectedTeam() {
  return document.querySelector('input[name="team"]:checked').value;
}

// Hämtar listan (ul) för ett lag
function getList(team) {
  return document.querySelector(`#team-${team}`);
}

function getOtherTeam(team) {
  return team === "A" ? "B" : "A";
}

function isFull(team) {
  return getList(team).children.length >= MAX_PLAYERS;
}

function showMessage(text) {
  message.textContent = text;
}

// Uppdaterar räknaren och klassen "full" för ett lag
function updateTeam(team) {
  const amount = getList(team).children.length;
  document.querySelector(`#count-${team}`).textContent = amount;

  const teamCard = getList(team).closest(".team");
  if (amount >= MAX_PLAYERS) {
    teamCard.classList.add("full");
  } else {
    teamCard.classList.remove("full");
  }
}

// Skapar ett li-element för en spelare, med knappar
function createPlayer(username) {
  const li = document.createElement("li");
  li.classList.add("player");

  const name = document.createElement("span");
  name.classList.add("player-name");
  name.textContent = username;

  const actions = document.createElement("div");
  actions.classList.add("player-actions");

  const changeBtn = document.createElement("button");
  changeBtn.classList.add("btn-small", "change-btn");
  changeBtn.textContent = "Change Team";

  const leaveBtn = document.createElement("button");
  leaveBtn.classList.add("btn-small", "leave-btn");
  leaveBtn.textContent = "Leave Team";

  // ===== 6. Leave Team =====
  leaveBtn.addEventListener("click", () => {
    const team = li.parentElement.id.replace("team-", ""); // "A" eller "B"
    li.remove();
    updateTeam(team);
    showMessage("");
  });

  // ===== 7. (Svår) Change Team =====
  changeBtn.addEventListener("click", () => {
    const fromTeam = li.parentElement.id.replace("team-", "");
    const toTeam = getOtherTeam(fromTeam);

    if (isFull(toTeam)) {
      showMessage("Motståndarlaget är fullt – spelaren kan inte byta lag.");
      return;
    }

    getList(toTeam).append(li); // append flyttar elementet om det redan finns i DOM:en
    updateTeam(fromTeam);
    updateTeam(toTeam);
    showMessage("");
  });

  actions.append(changeBtn, leaveBtn);
  li.append(name, actions);
  return li;
}

// ===== 2. Change Team name =====
changeNameBtn.addEventListener("click", () => {
  const newName = teamNameInput.value.trim();

  if (newName === "") {
    showMessage("Skriv in ett lagnamn först.");
    return;
  }

  const team = getSelectedTeam();
  document.querySelector(`#team-name-${team}`).textContent = newName;
  teamNameInput.value = "";
  showMessage("");
});

// ===== 3–5. Add player =====
addPlayerBtn.addEventListener("click", async () => {
  const team = getSelectedTeam();

  // 4. Laget är fullt
  if (isFull(team)) {
    showMessage("Laget är fullt! Välj det andra laget eller ta bort en spelare.");
    return;
  }

  addPlayerBtn.disabled = true; // förhindrar dubbelklick medan vi väntar på API:et

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Status " + res.status);

    const data = await res.json();
    const username = data.results[0].login.username;

    // Kolla igen ifall laget hann bli fullt medan vi väntade
    if (isFull(team)) {
      showMessage("Laget är fullt!");
      return;
    }

    getList(team).append(createPlayer(username));
    updateTeam(team);
    showMessage("");
  } catch (err) {
    console.error(err);
    showMessage("Kunde inte hämta en spelare. Försök igen!");
  } finally {
    addPlayerBtn.disabled = false;
  }
});