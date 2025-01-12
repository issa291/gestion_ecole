const sidebar = document.getElementById('sidebar');
const toggleSidebar = document.getElementById('toggleSidebar');
const menuText = document.querySelectorAll('.menu-text');
const tBodyCours = document.querySelector("#tBodyCours");
const semesterFilter = document.getElementById('semesterFilter');
const popupSeances = document.getElementById('popupSeances');
const closePopup = document.getElementById('closePopup');
const seancesContainer = document.getElementById('seancesContainer');

let allCours = [];
let professeurs = [];
let semestres = [];
let allSceances = [];

let currentPage = 1;
const itemsPerPage = 3;

async function fetchProfesseurs() {
    try {
        const response = await fetch('http://localhost:3000/Professeurs');
        professeurs = await response.json();
    } catch (error) {
        console.error('Erreur lors de la récupération des professeurs:', error);
    }
}

async function fetchSemestres() {
    try {
        const response = await fetch('http://localhost:3000/Semestres');
        semestres = await response.json();
    } catch (error) {
        console.error('Erreur lors de la récupération des semestres:', error);
    }
}

async function fetchSceances() {
    try {
        const response = await fetch('http://localhost:3000/Seances');
        allSceances = await response.json();
    } catch (error) {
        console.error('Erreur lors de la récupération des séances:', error);
    }
}

async function fetchCours() {
    try {
        const response = await fetch('http://localhost:3000/Cours');
        allCours = await response.json();
        await fetchProfesseurs();
        await fetchSemestres();
        await fetchSceances();
        listCours(allCours, currentPage);
    } catch (error) {
        console.error('Erreur lors de la récupération des cours:', error);
    }
}



function listCours(cours, currentPage) {
    tBodyCours.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const coursesToDisplay = cours.slice(startIndex, endIndex);

    coursesToDisplay.forEach(cour => {
        const prof = professeurs.find(p => p.idProf === cour.idProf);
        const semestre = semestres.find(s => s.idSemestre === cour.idSemestre);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="border border-gray-300 px-4 py-2">${cour.module}</td>
            <td class="border border-gray-300 px-4 py-2">${prof.nom}</td>
            <td class="border border-gray-300 px-4 py-2">${semestre.nom}</td>
            <td class="border border-gray-300 px-4 py-2 text-center">
                <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 voirSeancesBtn" data-id="${cour.idCours}">
                    Voir Séances
                </button>
            </td>
        `;
        tBodyCours.appendChild(row);
    });

    updatePagination(cours.length, currentPage);

    document.querySelectorAll('.voirSeancesBtn').forEach(button => {
        button.addEventListener('click', (e) => {
            const idCours = e.target.getAttribute('data-id');
            showSeances(idCours);
        });
    });
}

function showSeances(idCours) {
    seancesContainer.innerHTML = '';
    const seances = allSceances.filter(s => s.idCours === parseInt(idCours));

    if (seances.length === 0) {
        seancesContainer.innerHTML = '<p>Aucune séance trouvée pour ce cours.</p>';
        return;
    }

    const cours = allCours.find(c => c.idCours === parseInt(idCours));
    seances.forEach(seance => {
        const card = document.createElement('div');
        card.className = 'bg-gray-100 p-6 rounded-lg shadow-lg mb-4';
        card.innerHTML = `
            <h4 class="text-xl font-semibold text-blue-600 mb-2">${cours.module}</h4>
            <p class="text-sm text-gray-600">Date du cours : ${seance.dateCour}</p>
            <p class="text-sm text-gray-600">Heure de début : ${seance.heureDebut}</p>
            <p class="text-sm text-gray-600">Heure de fin : ${seance.heureFin}</p>
            <p class="text-sm text-red-600">Type : ${seance.type}</p>
        `;
        seancesContainer.appendChild(card);
    });

    popupSeances.classList.remove('hidden');
}

closePopup.addEventListener('click', () => {
    popupSeances.classList.add('hidden');
});

function updatePagination(totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.getElementById('paginationContainer');
    paginationContainer.innerHTML = '';

    const nav = document.createElement('nav');
    nav.className = 'flex space-x-2';

    const previousButton = document.createElement('button');
    previousButton.className = `px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''}`;
    previousButton.textContent = 'Précédent';
    previousButton.disabled = currentPage === 1;
    previousButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            listCours(allCours, currentPage);
        }
    });
    nav.appendChild(previousButton);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `px-4 py-2 rounded hover:bg-gray-400 ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200'}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            listCours(allCours, currentPage);
        });
        nav.appendChild(pageButton);
    }

    const nextButton = document.createElement('button');
    nextButton.className = `px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''}`;
    nextButton.textContent = 'Suivant';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            listCours(allCours, currentPage);
        }
    });
    nav.appendChild(nextButton);

    paginationContainer.appendChild(nav);
}

semesterFilter.addEventListener('change', (e) => {
    const semesterValue = e.target.value;
    let filteredCourses = allCours;

    if (semesterValue !== 'all') {
        filteredCourses = allCours.filter(c => c.idSemestre === parseInt(semesterValue));
    }

    listCours(filteredCourses, currentPage);
});

fetchCours();


