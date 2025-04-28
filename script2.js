// Importar o Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBKbnHDUkSo7vUitb0QQqK8l-Uc3oTLivE",
    authDomain: "minhas-financas-d507f.firebaseapp.com",
    projectId: "minhas-financas-d507f",
    storageBucket: "minhas-financas-d507f.appspot.com",
    messagingSenderId: "640574577406",
    appId: "1:640574577406:web:4ea795fe3c139ef238a3af"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Lógica de login
const form = document.getElementById('login-form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    signInWithEmailAndPassword(auth, email, senha)
        .then((userCredential) => {
            // Login realizado
            window.location.href = "index.html"; // Redireciona para o sistema de dívidas
        })
        .catch((error) => {
            alert('Email ou senha incorretos!');
        });
});

// Recuperar senha
const recuperarLink = document.querySelector('.recuperar a');
recuperarLink.addEventListener('click', (e) => {
    e.preventDefault();
    const email = prompt("Digite seu email para recuperação de senha:");
    if (email) {
        sendPasswordResetEmail(auth, email)
            .then(() => {
                alert('Email de recuperação enviado! Verifique sua caixa de entrada.');
            })
            .catch((error) => {
                alert('Erro ao enviar email de recuperação. Verifique se o email está correto.');
            });
    }
});

// Se já estiver logado, redireciona
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "index.html";
    }
});
