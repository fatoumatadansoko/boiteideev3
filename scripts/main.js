import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyADknjQnDgiASmGzKhxia4LKSmm4owpphw",
  authDomain: "mon-first-firebase.firebaseapp.com",
  databaseURL: "https://mon-first-firebase-default-rtdb.firebaseio.com",
  projectId: "mon-first-firebase",
  storageBucket: "mon-first-firebase.appspot.com",
  messagingSenderId: "80068622956",
  appId: "1:80068622956:web:e01530e5361550bb07f649",
  measurementId: "G-7N7ERKNQ46"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

import { getDatabase,push,remove,ref,set,get,update } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";
const db = getDatabase();

document.addEventListener('DOMContentLoaded', function() {
          const ideeContainer = document.querySelector('#idee-container');
          let allIdees = [];

          // Fonction pour afficher les idées
          const displayIdees = (idees) => {
              ideeContainer.innerHTML = '';
              Object.values(idees).forEach(function(idee) {
                  let actionButtons = '';
                  if (idee.etat !== 'Approuvée' && idee.etat !== 'Désapprouvée') {
                      actionButtons = `
                          <i data-id="${idee.id}" class="bi bi-heart-fill text-success" style="font-size: 1.5rem;" data-action="approve" title="Approuver"></i>
                          <i data-id="${idee.id}" class="bi bi-hand-thumbs-down-fill text-warning" style="font-size: 1.5rem;" data-action="reject" title="Désapprouver"></i>
                      `;
                  }
                  let borderClass = '';
                  if (idee.etat === 'Approuvée') {
                      borderClass = 'approve-border';
                  } else if (idee.etat === 'Désapprouvée') {
                      borderClass = 'reject-border';
                  }
                  const ideeHtml = `
                      <div class="col-md-4 mb-3">
                          <div id="idee-${idee.id}" class="card ${borderClass}">
                              <div class="card-body">
                                  <h5 class="card-title">${idee.libelle}</h5>
                                  <h6 class="card-subtitle mb-2 text-muted">Auteur: ${idee.auteur}</h6>
                                  <p class="card-text">${idee.message}</p>
                                  <p class="card-text"><small class="text-muted">État: ${idee.etat}</small></p>
                                  <p class="card-text"><small class="text-muted">Catégorie: ${idee.categorie}</small></p>
                                  <div class="d-flex justify-content-between">
                                      ${actionButtons}
                                      <i data-id="${idee.id}" class="bi bi-trash3 text-danger" style="font-size: 1.5rem;" data-action="delete" title="Supprimer"></i>
                                  </div>
                              </div>
                          </div>
                      </div>`;
                  ideeContainer.innerHTML += ideeHtml;
              });
          };

          // Sauvegarder les idées dans Firebase
          const saveIdeeToFirebase = async (idee) => {
            const ideeRef = push(ref(db, 'idees/'));
            const ideeId = ideeRef.key;
            idee.id = ideeId; // Assigner l'identifiant Firebase à l'idée
            await set(ideeRef, idee);
        };
        

          // Charger les idées depuis Firebase
          const loadIdeesFromFirebase = async () => {
              const dbRef = ref(db, 'idees/');
              const snapshot = await get(dbRef);
              return snapshot.exists() ? snapshot.val() : {};
          };

          // Récupérer les idées depuis Firebase
          const fetchIdees = async () => {
              try {
                  allIdees = await loadIdeesFromFirebase();
                  displayIdees(allIdees);
              } catch (error) {
                  console.error('Erreur lors de la récupération des idées:', error);
              }
          };

          fetchIdees();

          const ideeForm = document.querySelector('#idee-form');
          ideeForm.addEventListener('submit', async (e) => {
              e.preventDefault();
              const libelleInput = ideeForm.querySelector('#libelle').value;
              const auteurInput = ideeForm.querySelector('#auteur').value;
              const messageInput = ideeForm.querySelector('#message').value;
              const categorieInput = ideeForm.querySelector('#categorie').value;

              const newIdee = {
                  id: Date.now().toString(),
                  libelle: libelleInput,
                  auteur: auteurInput,
                  message: messageInput,
                  categorie: categorieInput,
                  etat: 'En attente'
              };

              await saveIdeeToFirebase(newIdee);
              fetchIdees();
              ideeForm.reset();
              document.getElementById('submitBtn').disabled = true;
          });

          const updateIdeeState = async (id, newState) => {
            const ideeRef = ref(db, `idees/${id}`);
            await update(ideeRef, { etat: newState });
            fetchIdees();
        };
        

        const deleteIdee = async (id) => {
            const ideeRef = ref(db, `idees/${id}`);
            await remove(ideeRef);
            fetchIdees();
        };
        

          ideeContainer.addEventListener('click', (e) => {
              const ideeId = e.target.dataset.id;
              if (e.target.dataset.action === 'approve') {
                  updateIdeeState(ideeId, 'Approuvée');
              } else if (e.target.dataset.action === 'reject') {
                  updateIdeeState(ideeId, 'Désapprouvée');
              } else if (e.target.dataset.action === 'delete') {
                  deleteIdee(ideeId);
              }
          });

          function validateField(input, errorElement, minLength, pattern) {
              let isValid = true;
              errorElement.innerHTML = "";
              if (input.value.trim() === "" || (minLength && input.value.length < minLength) || (pattern && !pattern.test(input.value))) {
                  errorElement.innerHTML = "Ce champ est requis et doit respecter les contraintes.";
                  isValid = false;
              }
              return isValid;
          }

          function validateForm() {
              let isValid = true;
              isValid = validateField(document.getElementById('libelle'), document.getElementById('errorLibelle'), 3) && isValid;
              isValid = validateField(document.getElementById('auteur'), document.getElementById('errorAuteur'), 3) && isValid;
              isValid = validateField(document.getElementById('message'), document.getElementById('errorMessage'), 10) && isValid;
              isValid = validateField(document.getElementById('categorie'), document.getElementById('errorCategorie')) && isValid;
              const submitBtn = document.getElementById('submitBtn');
              submitBtn.disabled = !isValid;
          }

          const formInputs = document.querySelectorAll('#idee-form input, #idee-form textarea, #idee-form select');
          formInputs.forEach(input => input.addEventListener('input', validateForm));

          const messageInput = document.getElementById('message');
          messageInput.addEventListener('input', function() {
              if (messageInput.value.length > 255) {
                  messageInput.value = messageInput.value.slice(0, 255);
              }
          });
      });