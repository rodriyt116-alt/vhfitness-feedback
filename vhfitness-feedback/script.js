import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const form = document.getElementById('feedbackForm');
const container = document.querySelector('.form-container');

// VERIFICAÇÃO DE SEGUNDA A SEGUNDA COM DESIGN ATRATIVO E PROFISSIONAL
document.addEventListener("DOMContentLoaded", () => {
    const ultimaResposta = localStorage.getItem("vh_ultimo_feedback");
    
    if (ultimaResposta) {
        const dataUltima = new Date(ultimaResposta);
        const dataAtual = new Date();
        
        const diferencaTempo = Math.abs(dataAtual - dataUltima);
        const diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));
        
        if (diferencaDias <= 7) {
            container.innerHTML = `
                <div class="mb-4">
                    <img src="logotipo_vh.jpg" alt="VHFitness" class="img-fluid rounded-circle shadow" style="max-width: 140px;">
                </div>
                <div class="card card-blocked p-5 shadow-lg border-0 text-center animate__animated animate__fadeIn">
                    <div class="mb-3"><span style="font-size: 4rem;">⚡</span></div>
                    <h3 class="fw-bold text-vh-green">Foco no Treino, Atleta!</h3>
                    <p class="mt-3 fs-6 style="color: #eee;">O teu feedback desta semana já está guardado na nossa box. Obrigado por nos ajudares a evoluir!</p>
                    <hr class="border-secondary my-4">
                    <p class="text-muted-custom small m-0">🔒 Próxima avaliação disponível na <strong>próxima semana</strong>.</p>
                </div>
            `;
            return;
        }
    }

    // PROIBIÇÃO TOTAL: IMPEDE EXTREMOS E INVENTAR NÚMEROS FORA DE 1 A 5
    const camposNumero = ['treino', 'limpeza', 'atendimento', 'equipamentos'];
    camposNumero.forEach(id => {
        const input = document.getElementById(id);
        const displayEstrelas = document.getElementById(`estrelas-${id}`);

        if (input && displayEstrelas) {
            input.addEventListener('input', (e) => {
                let valor = parseInt(e.target.value);

                if (valor > 5) {
                    valor = 5;
                    e.target.value = 5; // Força o limite máximo imediato
                } else if (valor < 1 || isNaN(valor)) {
                    valor = 0;
                    e.target.value = ''; // Limpa se for inválido ou negativo
                }

                if (valor > 0) {
                    displayEstrelas.innerHTML = '⭐'.repeat(valor);
                } else {
                    displayEstrelas.innerHTML = '';
                }
            });
        }
    });
});

// SUBMETER FORMULÁRIO PARA O FIREBASE
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validação extra de segurança anti-fraude antes de enviar
        const t = Number(document.getElementById('treino').value);
        const l = Number(document.getElementById('limpeza').value);
        const a = Number(document.getElementById('atendimento').value);
        const eq = Number(document.getElementById('equipamentos').value);

        if(t > 5 || l > 5 || a > 5 || eq > 5 || t < 1 || l < 1 || a < 1 || eq < 1) {
            alert("Por favor, introduz apenas notas válidas entre 1 e 5.");
            return;
        }

        const feedback = {
            data: new Date().toISOString(),
            createdAt: serverTimestamp(), // 🔥 LINHA NOVA: Crucial para o Firebase contar os 15 dias!
            treino: t,
            limpeza: l,
            atendimento: a,
            equipamentos: eq,
            pontosFortes: document.getElementById('pontos_fortes').value,
            pontosMelhoria: document.getElementById('pontos_melhoria').value
        };

        try {
            await addDoc(collection(db, "feedbacks"), feedback);
            
            localStorage.setItem("vh_ultimo_feedback", new Date().toISOString());
            
            container.innerHTML = `
                <div class="mb-4">
                    <img src="logotipo_vh.jpg" alt="VHFitness" class="img-fluid rounded-circle" style="max-width: 140px;">
                </div>
                <div class="card card-blocked p-5 shadow-lg border-0 text-center">
                    <div class="mb-3"><span style="font-size: 4rem;">💪🎉</span></div>
                    <h2 class="fw-bold text-vh-green">Avaliação Enviada!</h2>
                    <p class="mt-3 text-muted-custom">Obrigado por fazeres parte da comunidade VHFitness. Bons treinos para esta semana!</p>
                </div>
            `;
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao enviar. Tenta novamente!");
        }
    });
}

// FUNÇÃO AUTOMÁTICA QUE APAGA VOTOS COM MAIS DE 15 DIAS
async function limparDadosAntigos() {
    try {
        const quinzeDiasAtras = new Date();
        quinzeDiasAtras.setDate(quinzeDiasAtras.getDate() - 15);

        // Procura no Firebase documentos onde a data seja menor que há 15 dias
        const q = query(collection(db, "feedbacks"), where("createdAt", "<", quinzeDiasAtras));
        const querySnapshot = await getDocs(q);
        
        // Apaga um por um
        querySnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });
        console.log("Limpeza automática de 15 dias concluída com sucesso!");
    } catch (error) {
        console.error("Erro na limpeza automática:", error);
    }
}

// Executa a limpeza sempre que o site abre
document.addEventListener("DOMContentLoaded", limparDadosAntigos);
