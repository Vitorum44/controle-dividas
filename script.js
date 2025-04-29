
// === FIREBASE CONFIG ===
const firebaseConfig = {
    apiKey: "AIzaSyBKbnHDUkSo7vUitb0QQqK8l-Uc3oTLivE",
    authDomain: "minhas-financas-d507f.firebaseapp.com",
    projectId: "minhas-financas-d507f",
    storageBucket: "minhas-financas-d507f.appspot.com",
    messagingSenderId: "640574577406",
    appId: "1:640574577406:web:4ea795fe3c139ef238a3af"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function getMesSelecionado() {
    return document.getElementById("mes-selecionado").value;
}

function exibirMeses() {
    const container = document.getElementById("tables-container");
    container.innerHTML = "";

    meses.forEach((mes, index) => {
        const div = document.createElement("div");
        div.className = "month-container";

        const mostrarBtn = document.createElement("button");
        mostrarBtn.innerText = "Adicionar Dívida";
        mostrarBtn.style.marginTop = "10px";
        mostrarBtn.style.backgroundColor = "#007bff";
        mostrarBtn.style.color = "#fff";
        mostrarBtn.style.padding = "8px 16px";
        mostrarBtn.style.border = "none";
        mostrarBtn.style.borderRadius = "5px";
        mostrarBtn.style.cursor = "pointer";

        const formDiv = document.createElement("div");
        formDiv.id = "form-divida-" + index;
        formDiv.style.display = "none";
        formDiv.style.marginTop = "10px";
        formDiv.style.padding = "10px";
        formDiv.style.background = "#f1f1f1";
        formDiv.style.borderRadius = "5px";

        const descInput = document.createElement("input");
        descInput.id = `desc-${index}`;
        descInput.placeholder = "Descrição";
        descInput.style.marginRight = "10px";
        descInput.style.marginBottom = "10px";

        const valorInput = document.createElement("input");
        valorInput.id = `valor-${index}`;
        valorInput.type = "number";
        valorInput.placeholder = "Valor";
        valorInput.style.marginRight = "10px";
        valorInput.style.marginBottom = "10px";

        const diaInput = document.createElement("input");
        diaInput.id = `dia-${index}`;
        diaInput.type = "number";
        diaInput.placeholder = "Dia";
        diaInput.min = 1;
        diaInput.max = 31;
        diaInput.style.marginBottom = "10px";

        const addBtn = document.createElement("button");
        addBtn.innerText = "Confirmar";
        addBtn.style.marginLeft = "10px";
        addBtn.style.backgroundColor = "#28a745";
        addBtn.style.color = "#fff";
        addBtn.style.padding = "6px 14px";
        addBtn.style.border = "none";
        addBtn.style.borderRadius = "5px";
        addBtn.style.cursor = "pointer";
        addBtn.onclick = () => adicionarDivida(index);

        mostrarBtn.onclick = () => {
            const form = document.getElementById("form-divida-" + index);
            form.style.display = form.style.display === "none" ? "block" : "none";
        };

        formDiv.appendChild(descInput);
        formDiv.appendChild(valorInput);
        formDiv.appendChild(diaInput);
        formDiv.appendChild(addBtn);

        div.innerHTML = `
            <h2>${mes}</h2>
            <table id="tabela-${index}">
                <thead>
                    <tr>
                        <th>Descrição</th>
                        <th>Valor</th>
                        <th>Dia</th>
                        <th>Pago?</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
            <p>Total de Dívidas: R$ <span id="total-${index}">0</span></p>
        `;

        div.appendChild(mostrarBtn);
        div.appendChild(formDiv);
        container.appendChild(div);

        carregarDados(index);
    });
}

function adicionarDivida(mes) {
    const desc = document.getElementById(`desc-${mes}`).value;
    const valor = parseFloat(document.getElementById(`valor-${mes}`).value);
    const dia = document.getElementById(`dia-${mes}`).value || "";

    if (!desc || isNaN(valor)) return;

    const novaDivida = { descricao: desc, valor, pago: false, dia };
    const docRef = db.collection("financas").doc(mes.toString());

    docRef.get().then(doc => {
        const data = doc.exists ? doc.data().dividas || [] : [];
        data.push(novaDivida);
        docRef.set({ dividas: data }).then(() => carregarDados(mes));
    });

    document.getElementById(`desc-${mes}`).value = "";
    document.getElementById(`valor-${mes}`).value = "";
    document.getElementById(`dia-${mes}`).value = "";
    document.getElementById("form-divida-" + mes).style.display = "none";
}

function carregarDados(mes) {
    const tbody = document.querySelector(`#tabela-${mes} tbody`);
    tbody.innerHTML = "";
    let total = 0;

    const docRef = db.collection("financas").doc(mes.toString());
    docRef.get().then(doc => {
        if (doc.exists) {
            const dividas = doc.data().dividas || [];
            dividas.forEach((divida, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${divida.descricao}</td>
                    <td>R$ ${divida.valor.toFixed(2)}</td>
                    <td>${divida.dia || ""}</td>
                    <td><input type="checkbox" ${divida.pago ? "checked" : ""} onchange="alternarPago(${mes}, ${index}, this.checked)"></td>
                    <td><button onclick="removerDivida(${mes}, ${index})">Remover</button></td>
                `;

                if (divida.pago) {
                    tr.style.backgroundColor = "#d4edda";
                }

                tbody.appendChild(tr);
                if (!divida.pago) total += divida.valor;
            });
        }
        document.getElementById(`total-${mes}`).textContent = total.toFixed(2);
    });
}

function alternarPago(mes, index, status) {
    const docRef = db.collection("financas").doc(mes.toString());
    docRef.get().then(doc => {
        if (doc.exists) {
            const data = doc.data().dividas || [];
            data[index].pago = status;
            docRef.set({ dividas: data }).then(() => {
                const tbody = document.querySelector(`#tabela-${mes} tbody`);
                const linha = tbody.children[index];
                if (linha) linha.style.backgroundColor = status ? "#d4edda" : "transparent";

                let total = 0;
                data.forEach(d => {
                    if (!d.pago) total += d.valor;
                });
                document.getElementById(`total-${mes}`).textContent = total.toFixed(2);
            });
        }
    });
}

function removerDivida(mes, index) {
    const docRef = db.collection("financas").doc(mes.toString());
    docRef.get().then(doc => {
        if (doc.exists) {
            const data = doc.data().dividas || [];
            data.splice(index, 1);
            docRef.set({ dividas: data }).then(() => carregarDados(mes));
        }
    });
}

function addParcelada() {
    if (document.getElementById("form-parcela")) return;

    const btn = document.querySelector(".parcelada-btn");
    const form = document.createElement("div");
    form.id = "form-parcela";
    form.style.marginTop = "10px";
    form.style.backgroundColor = "#f9f9f9";
    form.style.padding = "10px";
    form.style.border = "1px solid #ccc";
    form.style.maxWidth = '380px';
    form.style.margin = '20px auto';

    form.innerHTML = `
      <input type="text" id="desc-parcela" placeholder="Descrição"><br><br>
      <input type="number" id="valor-parcela" placeholder="Valor Total"><br><br>
      <input type="number" id="dia-parcela" placeholder="Dia"><br><br>
      <input type="number" id="qtd-parcela" placeholder="Quantidade de Parcelas"><br><br>
      <button onclick="confirmarParcelada()">Confirmar Parcelamento</button>
      <button onclick="document.getElementById('form-parcela').remove()">Cancelar</button>
    `;

    btn.insertAdjacentElement("afterend", form);
}

function confirmarParcelada() {
    const mesInicial = parseInt(getMesSelecionado());
    const desc = document.getElementById("desc-parcela").value;
    const valor = parseFloat(document.getElementById("valor-parcela").value);
    const dia = document.getElementById("dia-parcela").value || "";
    const qtd = parseInt(document.getElementById("qtd-parcela").value);

    if (!desc || isNaN(valor) || isNaN(qtd)) {
        alert("Preencha todos os campos corretamente.");
        return;
    }

    const valorParcela = valor / qtd;

    for (let i = 0; i < qtd; i++) {
        const mesAlvo = (mesInicial + i) % 12;
        const docRef = db.collection("financas").doc(mesAlvo.toString());

        const parcelaDesc = `${desc} ${i + 1}/${qtd}`;
        const novaDivida = { descricao: parcelaDesc, valor: valorParcela, pago: false, dia };

        docRef.get().then(doc => {
            const data = doc.exists ? doc.data().dividas || [] : [];
            data.push(novaDivida);
            docRef.set({ dividas: data }).then(() => carregarDados(mesAlvo));
        });
    }

    document.getElementById("form-parcela").remove();
}
// === RENDAS ===
function toggleEditIncome(pessoa) {
    const inputs = document.querySelectorAll(`#${pessoa}-adiantamento, #${pessoa}-15zena1, #${pessoa}-15zena2, #${pessoa}-vale, #${pessoa}-5util1, #${pessoa}-5util2`);
    inputs.forEach(input => input.disabled = !input.disabled);
}

function saveIncome(pessoa) {
    const campos = {
        vitor: ["vitor-15zena1", "vitor-15zena2", "vitor-vale"],
        aline: ["aline-adiantamento", "aline-5util1", "aline-5util2"]
    };

    let total = 0;
    const dados = {};

    campos[pessoa].forEach(id => {
        const input = document.getElementById(id);
        const valor = parseFloat(input.value) || 0;
        dados[id] = valor;
        total += valor;
        input.disabled = true;
    });

    document.getElementById(`${pessoa}-total`).textContent = total.toFixed(2);
    atualizarTotalCasal();

    // Correção: Preserva valores anteriores antes de sobrescrever
    const docRef = db.collection("financas").doc("rendas");
    docRef.get().then(doc => {
        const data = doc.exists ? doc.data() : {}; 

        data[pessoa] = dados; // Atualiza apenas a pessoa específica
        data[`${pessoa}Total`] = total;

        docRef.set(data, { merge: true }) 
            .then(() => console.log(`Renda de ${pessoa} salva corretamente!`))
            .catch(error => console.error("Erro ao salvar renda:", error));
    });
}

function atualizarTotalCasal() {
    const totalVitor = parseFloat(document.getElementById("vitor-total").textContent) || 0;
    const totalAline = parseFloat(document.getElementById("aline-total").textContent) || 0;
    const totalCasal = totalVitor + totalAline;
    document.getElementById("total-casal").textContent = totalCasal.toFixed(2);
    salvarRendasFirestore(totalVitor, totalAline, totalCasal);
}

function salvarRendasFirestore(vitorTotal, alineTotal, totalCasal) {
    db.collection("financas").doc("rendas").set({
        vitorTotal: vitorTotal,
        alineTotal: alineTotal,
        totalCasal: totalCasal
    }, { merge: true });
}

function carregarRendas() {
    const docRef = db.collection("financas").doc("rendas");
    docRef.get().then(doc => {
        if (doc.exists) {
            const data = doc.data();

            ["vitor", "aline"].forEach(pessoa => {
                const campos = {
                    vitor: ["vitor-15zena1", "vitor-15zena2", "vitor-vale"],
                    aline: ["aline-adiantamento", "aline-5util1", "aline-5util2"]
                };

                let total = 0;
                campos[pessoa].forEach(id => {
                    const input = document.getElementById(id);
                    const valor = data[pessoa]?.[id] || 0;
                    input.value = valor;
                    total += valor;
                });

                document.getElementById(`${pessoa}-total`).textContent = total.toFixed(2);
            });

            const totalCasal = (data.vitorTotal || 0) + (data.alineTotal || 0);
            document.getElementById("total-casal").textContent = totalCasal.toFixed(2);
        }
    });
}


// === INICIALIZAÇÃO ===
exibirMeses();
carregarRendas();


function toggleLogout() {
    const logoutDiv = document.getElementById('logout-button');
    logoutDiv.style.display = logoutDiv.style.display === 'none' ? 'block' : 'none';
}

function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "login.html";
    }).catch((error) => {
        console.error("Erro ao fazer logout:", error);
    });
}

// Mostrar a inicial do e-mail no ícone
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        const email = user.email;
        const firstLetter = email.charAt(0).toUpperCase();
        document.getElementById('user-initial').textContent = firstLetter;
    } else {
        window.location.href = "login.html"; // Protege a página se não estiver logado
    }
});

function toggleLogout() {
    const logoutDiv = document.getElementById('logout-button');
    logoutDiv.style.display = logoutDiv.style.display === 'none' ? 'block' : 'none';
}

function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "login.html"; // Agora vai redirecionar certo!
    }).catch((error) => {
        console.error("Erro ao fazer logout:", error);
    });
}
