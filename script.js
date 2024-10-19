
 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
 import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
 import { getFirestore, collection, addDoc, onSnapshot, query, where, Timestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
 import { doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"; // Corrigido para ter o caminho completo

const firebaseConfig = {
 apiKey: "AIzaSyBHdddPNz8AcbbphzLrPL_AB-9GULOdzwc",
 authDomain: "todolist-80826.firebaseapp.com",
 projectId: "todolist-80826",
 storageBucket: "todolist-80826.appspot.com",
 messagingSenderId: "442240953666",
 appId: "1:442240953666:web:ab89005aca35061ebbecdb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
const tarefasRef = collection(db, 'tarefas');

 let manualLogin = false;

 // Monitorar o estado de autenticação
 onAuthStateChanged(auth, (usuario) => {
 if (usuario) {
     if (!manualLogin) {
         alert('Bem-vindo de volta ' + usuario.email);
     }
     document.querySelector('.login-form').style.display = "none";
     document.querySelector('.container-login').style.display = "block";

 // Consultando e ordenando a coleção de tarefas
 onSnapshot(query(tarefasRef, where("horario", "!=", null)), (data) => {
     let list = document.querySelector('#tarefas');
     list.innerHTML = "";

     let tarefas = data.docs;

     // Ordenar as tarefas pelo campo 'horario' de forma crescente 
     tarefas.sort((a, b) => {
         let horarioA = a.data().horario;
         let horarioB = b.data().horario;

         if (horarioA instanceof Timestamp) {
             horarioA = horarioA.toDate().getTime();
         } else {
             horarioA = new Date(horarioA).getTime();
         }

         if (horarioB instanceof Timestamp) {
             horarioB = horarioB.toDate().getTime();
         } else {
             horarioB = new Date(horarioB).getTime();
         }

         return horarioA - horarioB; // Deixa as tarefas cadastradas em ordem crescente
     });

     // Renderizar a tarefa e o horário 
     tarefas.map((val) => {
         const tarefa = val.data().tarefa;
         const horario = new Date(val.data().horario).toLocaleString(); 

         list.innerHTML += `<li>${tarefa} - <strong>Horário:</strong> ${horario} <a tarefa-id="${val.id}" class="excluir-btn" href="javascript:void(0)">(X)</a></li>`;
     });

     // Função de excluir tarefas.
     var excluirTarefas = document.querySelectorAll('.excluir-btn');

     excluirTarefas.forEach(element => {
         element.addEventListener('click', async function(e) {
             e.preventDefault();
             let docId = element.getAttribute('tarefa-id');

             try {
                 await deleteDoc(doc(db, 'tarefas', docId)); 
                 alert('Tarefa excluída com sucesso!');
             } catch (error) {
                 console.error('Erro ao excluir a tarefa:', error);
                 alert('Erro ao tentar excluir a tarefa.');
             }
         });
     });
 });
             } else {
                 document.querySelector('.login-form').style.display = "block";
                 document.querySelector('.container-login').style.display = "none";
             }
         });

     // Função de login
     document.getElementById('loginForm').addEventListener('submit', (e) => {
         e.preventDefault();
         
         let email = document.querySelector('[name=email]').value;
         let password = document.querySelector('[name=password]').value;

         manualLogin = true;

         signInWithEmailAndPassword(auth, email, password)
         .then((userCredential) => {
             const usuario = userCredential.user;
             alert('Logado com sucesso! ' + usuario.email);
             document.querySelector('.login-form').style.display = "none";
             document.querySelector('.container-login').style.display = "block";
         })
         .catch((error) => {
             alert('E-mail ou senha estão incorretos!');
         });
     });

     // Função de logout
     document.querySelector('.logout').addEventListener('click', (e) => {
         e.preventDefault();

         signOut(auth).then(() => {
             alert('Deslogado com sucesso!');
             document.querySelector('.login-form').style.display = "block";
             document.querySelector('.container-login').style.display = "none";
             
             // Resetar o formulário de login
             document.getElementById('loginForm').reset();
         }).catch((error) => {
             console.error('Erro ao deslogar:', error);
             alert('Erro ao tentar deslogar!');
         });
     });

     var formCadastro = document.querySelector('.form-cadastro-tarefa');

     formCadastro.addEventListener('submit', async (e) => {
         e.preventDefault();
     
         let tarefa = document.querySelector('.form-cadastro-tarefa [name=tarefa]').value;
         let dateTime = document.querySelector('.form-cadastro-tarefa [name=datetime]').value;

         let usuario = auth.currentUser; // Obtenha o usuário autenticado no momento do cadastro

         let dataAtual = new Date().getTime();
         if (dataAtual > new Date(dateTime).getTime()) {
             alert('A data informada não pode ser cadastrada!');
                 } else {
         if (usuario) {  // Verifica se o usuário está autenticado
             try {
                 await addDoc(collection(db, 'tarefas'), {
                     tarefa: tarefa,
                     horario: dateTime,
                     userId: usuario.uid,  // Adiciona o UID do usuário autenticado
                     createdAt: Timestamp.fromDate(new Date()) // Adiciona a data e hora atuais
                 });
                 alert('Sua tarefa foi cadastrada com sucesso!');
                 formCadastro.reset(); // Reseta o formulário após o cadastro
             } catch (error) {
                 console.error('Erro ao cadastrar a tarefa: ', error);
                 alert('Erro ao cadastrar a tarefa. Tente novamente.');
             }
         } else {
             alert('Usuário não está autenticado.');
         }
     }
 });

