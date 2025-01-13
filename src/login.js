const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('motDePasse');

// verifier si tous les champs sont remplies
function validateForm() {
    if (!emailInput.value || !passwordInput.value) {
        alert('Veuillez remplir tous les champs');
        return false;
    }
    return true;
}

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    fetch('http://localhost:3000/Users')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur réseau');
            }
            return response.json();
        })
        .then(users => {
            const user = users.find(user => 
                user.login === emailInput.value && 
                user.pwd === passwordInput.value
            );

            if (user) {
                // Stocker les informations de l'utilisateur
                localStorage.setItem('userId', user.idUser);
                localStorage.setItem('userProfil', user.profil);
                localStorage.setItem('login', user.login);

                // Redirection selon le profil
                if (user.profil === 'Etudiant') {
                    window.location.href = 'listeCours.html';
                    // console.log(localStorage);
                    
                } else if (user.profil === 'RP') {
                    window.location.href = 'listeAnnee.html';
                    // console.log(localStorage);
                }
            } else {
                alert('Login ou mot de passe incorrect');
                passwordInput.value = '';
            }
        })
       
});

window.addEventListener('load', () => {
    localStorage.clear();
});