import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD4zDuVmsmFFl9YQjF898Aw_3DLEnrZbe4",
  authDomain: "vhfitness-feedback.firebaseapp.com",
  projectId: "vhfitness-feedback",
  storageBucket: "vhfitness-feedback.firebasestorage.app",
  messagingSenderId: "683196513267",
  appId: "1:683196513267:web:88f9a420f9f2c85cd4f086"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let meuGrafico;

async function carregarDashboard() {
    try {
        const querySnapshot = await getDocs(collection(db, "feedbacks"));
        
        // Configurar a data limite (Hoje menos 30 dias)
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - 30);

        let totalTreino = 0, totalLimpeza = 0, totalAtendimento = 0, totalEquipamentos = 0;
        let contagemValidos = 0;

        const ulElogios = document.getElementById('ul-elogios');
        const ulSugestoes = document.getElementById('ul-sugestoes');
        
        ulElogios.innerHTML = "";
        ulSugestoes.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const fb = doc.data();
            const dataEnvio = new Date(fb.data);

            // === REGRA FILTRO: Só aceita se for dos últimos 30 dias ===
            if (dataEnvio >= dataLimite) {
                contagemValidos++;
                
                totalTreino += fb.treino;
                totalLimpeza += fb.limpeza;
                totalAtendimento += fb.atendimento;
                totalEquipamentos += fb.equipamentos;

                // Adicionar comentários de texto se existirem
                if (fb.pontosFortes) {
                    ulElogios.innerHTML += `<li class="list-group-item mb-2 rounded">🔹 ${fb.pontosFortes}</li>`;
                }
                if (fb.pontosMelhoria) {
                    ulSugestoes.innerHTML += `<li class="list-group-item mb-2 rounded border-danger">🔸 ${fb.pontosMelhoria}</li>`;
                }
            }
        });

        // Atualizar o contador no ecrã
        document.getElementById('total-votos').innerText = contagemValidos;

        if (contagemValidos === 0) {
            ulElogios.innerHTML = "<li class='list-group-item text-muted'>Nenhum feedback nos últimos 30 dias.</li>";
            ulSugestoes.innerHTML = "<li class='list-group-item text-muted'>Nenhuma sugestão nos últimos 30 dias.</li>";
            desenharGrafico([0, 0, 0, 0]);
            return;
        }

        // Calcular as médias reais
        const medias = [
            (totalTreino / contagemValidos).toFixed(1),
            (totalLimpeza / contagemValidos).toFixed(1),
            (totalAtendimento / contagemValidos).toFixed(1),
            (totalEquipamentos / contagemValidos).toFixed(1)
        ];

        desenharGrafico(medias);

    } catch (error) {
        console.error("Erro ao carregar os dados: ", error);
    }
}

function desenharGrafico(medias) {
    const ctx = document.getElementById('graficoMedias').getContext('2d');
    
    if (meuGrafico) { meuGrafico.destroy(); }

    meuGrafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['🏋️‍♂️ Treino', '🧼 Limpeza', '🤝 Atendimento', '⚙️ Equipamentos'],
            datasets: [{
                label: 'Média de Notas (1 a 5)',
                data: medias,
                backgroundColor: ['#26b921', '#3cd037', '#53e34e', '#6bf766'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { min: 0, max: 5, grid: { color: '#444' }, ticks: { color: '#fff' } },
                x: { ticks: { color: '#fff' } }
            }
        }
    });
}

// Inicializar ao carregar o ecrã
document.addEventListener("DOMContentLoaded", carregarDashboard);