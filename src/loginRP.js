const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('motDePasse');

// Fonction pour vérifier si les champs sont vides
function validateForm() {
    if (!emailInput.value || !passwordInput.value) {
        alert('Veuillez remplir tous les champs');
        return false;
    }
    return true;
}

// Ajouter un événement sur la soumission du formulaire
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Vérifier si les champs sont remplis
    if (!validateForm()) {
        return;
    }

   
    fetch('http://localhost:3000/RP')
        .then(response => {
            if (!response.ok) {
                alert('Erreur réseau');
                return null;
            }
            return response.json();
        })
        .then(etudiants => {
            if (etudiants) {
                // Vérifier si l'utilisateur existe
                const user = etudiants.find(etudiant =>
                    etudiant.login === emailInput.value &&
                    etudiant.pwd === passwordInput.value
                );

                if (user) {
                    localStorage.setItem('login', emailInput.value);
                    localStorage.setItem('password', passwordInput.value);

                    window.location.href = 'listeAnnee.html';
                } else {
                    alert('Login ou mot de passe incorrect');
                    passwordInput.value = ''; 
                }
            }
        })
        .catch(() => {
            alert('Erreur de connexion au serveur');
        });
});
//vider le localStorage
window.addEventListener('load', () => {
    localStorage.removeItem('login');
    localStorage.removeItem('password');
});
