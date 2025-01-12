document.body.insertAdjacentHTML('afterbegin', `
    <div id="profileDrawer" class="fixed top-20 right-4 w-80 bg-white rounded-lg shadow-xl transform translate-x-full transition-transform duration-300 ease-in-out z-50">
        <div class="relative">
            <!-- En-tête du drawer -->
            <div class="bg-[#06045A] p-4 rounded-t-lg">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-white">Profil Étudiant</h3>
                    <button id="closeDrawer" class="text-white hover:text-gray-300">
                        <i class='bx bx-x text-2xl'></i>
                    </button>
                </div>
            </div>
            
            <!-- Contenu du profil -->
            <div id="drawerContent" class="p-4">
                <!-- Le contenu sera injecté dynamiquement -->
            </div>
            
            <!-- Bouton de déconnexion -->
            <div class="p-4 border-t border-gray-200">
                <button id="logoutBtn" class="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 flex items-center justify-center">
                    <i class='bx bx-log-out mr-2'></i>
                    Déconnexion
                </button>
            </div>
        </div>
    </div>
`);

// Gestion du profil et du drawer
document.addEventListener('DOMContentLoaded', function() {
    // Récupérer les identifiants stockés
    const userLogin = localStorage.getItem('login');
    const userPassword = localStorage.getItem('password');
    
    if (!userLogin || !userPassword) {
        window.location.href = 'index.html';
        return;
    }

    // Récupérer les infos de l'utilisateur
    fetch('http://localhost:3000/Etudiants')
        .then(response => response.json())
        .then(data => {
            const etudiant = data.find(e => e.login === userLogin && e.pwd === userPassword);
            if (etudiant) {
                // Afficher le nom dans l'en-tête
                const profileText = document.querySelector('header .text-right p:first-child');
                profileText.textContent = `${etudiant.nom} ${etudiant.prenom || ''}`;
                profileText.classList.add('cursor-pointer', 'hover:text-blue-600');
                
                // Gestionnaire de clic pour ouvrir le drawer
                profileText.addEventListener('click', () => {
                    updateDrawerContent(etudiant);
                    openDrawer();
                });
            } else {
                window.location.href = 'index.html';
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            alert("Erreur lors de la récupération des informations");
        });
});


function updateDrawerContent(etudiant) {
    const drawerContent = document.getElementById('drawerContent');
    drawerContent.innerHTML = `
        <div class="flex justify-center mb-6">
            <div class="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <i class='bx bxs-user text-3xl text-gray-400'></i>
            </div>
        </div>
        <div class="space-y-4">
            <div class="p-3 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-500">Nom complet</p>
                <p class="font-medium">${etudiant.nom} </p>
            </div>
            <div class="p-3 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-500">Email</p>
                <p class="font-medium">${etudiant.login}</p>
            </div>
            <div class="p-3 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-500">Adresse</p>
                <p class="font-medium">${etudiant.adresse }</p>
            </div>
        </div>
    `;
}


function openDrawer() {
    document.getElementById('profileDrawer').classList.remove('translate-x-full');
}


function closeDrawer() {
    document.getElementById('profileDrawer').classList.add('translate-x-full');
}

document.getElementById('closeDrawer').addEventListener('click', closeDrawer);


document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('login');
    localStorage.removeItem('password');
    window.location.href = 'login.html';
});


// Fonction principale pour charger les cours de l'étudiant connecté
document.addEventListener('DOMContentLoaded', function() {
  const userLogin = localStorage.getItem('login');
  const userPassword = localStorage.getItem('password');
  
  if (!userLogin || !userPassword) {
      window.location.href = 'index.html';
      return;
  }

  // Récupération des données de l'étudiant et chargement des cours
  Promise.all([
      fetch('http://localhost:3000/Etudiants'),
      fetch('http://localhost:3000/Classes'),
      fetch('http://localhost:3000/Cours'),
      fetch('http://localhost:3000/Professeurs'),
      fetch('http://localhost:3000/Semestres'),
      fetch('http://localhost:3000/Seances')
  ])
  .then(responses => Promise.all(responses.map(res => res.json())))
  .then(([etudiants, classes, cours, professeurs, semestres, seances]) => {
      const etudiant = etudiants.find(e => e.login === userLogin && e.pwd === userPassword);
      if (!etudiant) {
          window.location.href = 'index.html';
          return;
      }

      // Mise à jour du profil et du drawer
      const classe = classes.find(c => c.idClasse === etudiant.idClasse);
      updateProfile(etudiant, classe);

      
      const coursEtudiant = cours.filter(c => c.idClasse === etudiant.idClasse);
      
     
      const tbody = document.getElementById('tBodyCours');
      tbody.innerHTML = coursEtudiant.map(cours => {
          const prof = professeurs.find(p => p.idProf === cours.idProf);
          const semestre = semestres.find(s => s.idSemestre === cours.idSemestre);
          return `
              <tr>
                  <td class="border border-gray-300 px-4 py-2">${cours.module}</td>
                  <td class="border border-gray-300 px-4 py-2">${prof ? prof.nom : 'Non défini'}</td>
                  <td class="border border-gray-300 px-4 py-2">${semestre ? semestre.nom : 'Non défini'}</td>
                  <td class="border border-gray-300 px-4 py-2">
                      <button onclick="showSeances(${cours.idCours})" 
                              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                          Séances
                      </button>
                  </td>
              </tr>
          `;
      }).join('');

      
      document.getElementById('semesterFilter').addEventListener('change', function(e) {
          const selectedSemester = e.target.value;
          const filteredCours = selectedSemester === 'all' 
              ? coursEtudiant 
              : coursEtudiant.filter(c => c.idSemestre === parseInt(selectedSemester));
          
          updateCoursTable(filteredCours, professeurs, semestres);
      });

      // Stockage des séances dans une variable  pour y accéder dans showSeances
      window.allSeances = seances;
  })
  .catch(error => {
      console.error('Erreur:', error);
      alert("Erreur lors de la récupération des données");
  });
});

// Fonction de mise à jour du profil et du drawer
function updateProfile(etudiant, classe) {
  const profileText = document.querySelector('header .text-right p:first-child');
  profileText.textContent = etudiant.nom;
  profileText.classList.add('cursor-pointer', 'hover:text-blue-600');
  
  profileText.addEventListener('click', () => {
      updateDrawerContent(etudiant, classe);
      openDrawer();
  });
}

function updateDrawerContent(etudiant, classe) {
  const drawerContent = document.getElementById('drawerContent');
  drawerContent.innerHTML = `
      <div class="flex justify-center mb-6">
          <div class="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <i class='bx bxs-user text-3xl text-gray-400'></i>
          </div>
      </div>
      <div class="space-y-4">
          <div class="p-3 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">Nom complet</p>
              <p class="font-medium">${etudiant.nom}</p>
          </div>
          <div class="p-3 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">Classe</p>
              <p class="font-medium">${classe ? classe.nom : 'Non définie'}</p>
          </div>
          <div class="p-3 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">Email</p>
              <p class="font-medium">${etudiant.login}</p>
          </div>
          <div class="p-3 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-500">Adresse</p>
              <p class="font-medium">${etudiant.adresse}</p>
          </div>
      </div>
  `;
}

// Fonction pour afficher les séances d'un cours
function showSeances(idCours) {
  const seances = window.allSeances.filter(s => s.idCours === idCours);
  const popup = document.getElementById('popupSeances');
  const container = document.getElementById('seancesContainer');
  
  container.innerHTML = seances.map(seance => `
      <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-semibold mb-2">Séance du ${formatDate(seance.dateCour)}</h4>
          <p class="text-sm text-gray-600">
              Horaire: ${seance.heureDebut} - ${seance.heureFin}<br>
              Type: ${seance.type}
          </p>
      </div>
  `).join('') || '<p class="col-span-3 text-center text-gray-500">Aucune séance programmée</p>';

  popup.classList.remove('hidden');
}



// Fonction de mise à jour du tableau des cours
function updateCoursTable(cours, professeurs, semestres) {
  const tbody = document.getElementById('tBodyCours');
  tbody.innerHTML = cours.map(cours => {
      const prof = professeurs.find(p => p.idProf === cours.idProf);
      const semestre = semestres.find(s => s.idSemestre === cours.idSemestre);
      return `
          <tr>
              <td class="border border-gray-300 px-4 py-2">${cours.module}</td>
              <td class="border border-gray-300 px-4 py-2">${prof ? prof.nom : 'Non défini'}</td>
              <td class="border border-gray-300 px-4 py-2">${semestre ? semestre.nom : 'Non défini'}</td>
              <td class="border border-gray-300 px-4 py-2">
                  <button onclick="showSeances(${cours.idCours})" 
                          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                      Séances
                  </button>
              </td>
          </tr>
      `;
  }).join('');
}


document.getElementById('closePopup').addEventListener('click', function() {
  document.getElementById('popupSeances').classList.add('hidden');
});
