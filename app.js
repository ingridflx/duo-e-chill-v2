import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCUfFiq-hGy59tbgxqEENNCf2hQKc2F_8U",
  authDomain: "duo-e-chill.firebaseapp.com",
  projectId: "duo-e-chill",
  storageBucket: "duo-e-chill.appspot.com",
  messagingSenderId: "222734979254",
  appId: "1:222734979254:web:12aa40c7a807320201d617",
  measurementId: "G-Z5555SE9ZM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const listaRef = collection(db, "duoList");

const form = document.getElementById("addForm");
const itemInput = document.getElementById("itemInput");
const categoriaSelect = document.getElementById("categoriaSelect");

const listas = {
  filme: document.getElementById("filmeList"),
  serie: document.getElementById("serieList"),
  jogo: document.getElementById("jogoList")
};

let filtroFeito = null;
let textoBusca = "";

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = itemInput.value.trim();
  const categoria = categoriaSelect.value;

  if (nome !== "") {
    await addDoc(listaRef, {
      nome,
      categoria,
      feito: false,
      criadoEm: new Date()
    });
    itemInput.value = "";
  }
});

document.getElementById("filter-watched").addEventListener("click", () => {
  filtroFeito = true;
  renderizarLista();
});

document.getElementById("filter-not-watched").addEventListener("click", () => {
  filtroFeito = false;
  renderizarLista();
});

document.getElementById("searchInput").addEventListener("input", (e) => {
  textoBusca = e.target.value.toLowerCase();
  renderizarLista();
});

onSnapshot(query(listaRef, orderBy("criadoEm")), (snapshot) => {
  window.listaAtual = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  renderizarLista();
});

function renderizarLista() {
  Object.values(listas).forEach(lista => (lista.innerHTML = ""));

  window.listaAtual.forEach((item) => {
    const correspondeFiltro = filtroFeito === null || item.feito === filtroFeito;
    const correspondeBusca = item.nome.toLowerCase().includes(textoBusca);

    if (correspondeFiltro && correspondeBusca) {
      const li = document.createElement("li");

      const itemText = document.createElement("span");
      itemText.textContent = item.nome;
      itemText.classList.add("item-content");
      if (item.feito) itemText.classList.add("checked");

      const btnContainer = document.createElement("div");
      btnContainer.classList.add("btn-container");

      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = item.feito ? "Desmarcar" : "Visto";
      toggleBtn.addEventListener("click", async () => {
        await updateDoc(doc(db, "duoList", item.id), {
          feito: !item.feito
        });
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Excluir";
      deleteBtn.addEventListener("click", async () => {
        await deleteDoc(doc(db, "duoList", item.id));
      });

      btnContainer.appendChild(toggleBtn);
      btnContainer.appendChild(deleteBtn);

      li.appendChild(itemText);
      li.appendChild(btnContainer);

      listas[item.categoria]?.appendChild(li);
    }
  });
}