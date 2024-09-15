// Função para carregar um arquivo JSON
async function carregarJSON(caminho) {
    try {
        const resposta = await fetch(caminho);
        if (!resposta.ok) throw new Error(`Erro ao carregar o arquivo JSON: ${resposta.statusText}`);
        const dados = await resposta.json();
        return dados;
    } catch (erro) {
        console.error(`Erro: ${erro.message}`);
        return null;
    }
}

// Função para exibir uma pergunta
function exibirPergunta(pergunta, index) {
    const container = document.getElementById('perguntas');
    container.innerHTML = ''; // Limpar conteúdo existente
    
    const perguntaElement = document.createElement('div');
    perguntaElement.classList.add('question');

    const perguntaTexto = document.createElement('p');
    perguntaTexto.textContent = `${index + 1}. ${pergunta.pergunta}`;
    perguntaElement.appendChild(perguntaTexto);

    pergunta.respostas.forEach(opcao => {
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="radio" name="pergunta" value="${opcao}">
            ${opcao}
        `;
        perguntaElement.appendChild(label);
    });

    container.appendChild(perguntaElement);
}

// Função para mostrar a próxima pergunta
function mostrarProximaPergunta(index, perguntas) {
    if (index < perguntas.length) {
        exibirPergunta(perguntas[index], index);
    } else {
        document.getElementById('proximo-pergunta').classList.add('hidden');
        document.getElementById('enviar-respostas').classList.remove('hidden');
    }
}

// Função para gerar uma sugestão com base nas respostas
function gerarSugestao(respostas) {
    let sugestao = 'Baseado nas suas respostas, recomendamos o seguinte:';

    const contagemRespostas = respostas.reduce((acc, resposta) => {
        if (resposta) {
            acc[resposta] = (acc[resposta] || 0) + 1;
        }
        return acc;
    }, {});

    if (contagemRespostas['Alto'] > 5) {
        sugestao += ' Você pode estar enfrentando altos níveis de estresse. Considere práticas de relaxamento, como meditação, exercícios físicos regulares e técnicas de respiração. É importante também buscar apoio profissional se necessário.';
    } else if (contagemRespostas['Moderado'] > 5) {
        sugestao += ' Seu nível de estresse parece moderado. É uma boa ideia praticar atividades que ajudem a relaxar e reduzir o estresse, como hobbies ou exercícios físicos. Tente também manter uma rotina equilibrada.';
    } else if (contagemRespostas['Baixo'] > 5) {
        sugestao += ' Seu nível de estresse parece baixo. Continue a monitorar sua saúde mental e mantenha práticas saudáveis que contribuem para seu bem-estar. Considerar atividades que promovam relaxamento e lazer é sempre benéfico.';
    } else {
        sugestao += ' Mantenha o acompanhamento regular de suas emoções e bem-estar. Se perceber qualquer mudança significativa ou desafio persistente, considere buscar apoio profissional.';
    }

    // Sugestões adicionais com base na qualidade do sono e nível de energia
    if (contagemRespostas['Sono Ruim']) {
        sugestao += ' Considerando a qualidade do seu sono, é importante estabelecer uma rotina regular de sono e criar um ambiente propício para descansar. Se o problema persistir, procure um especialista em sono.';
    }
    
    if (contagemRespostas['Baixa Energia']) {
        sugestao += ' Se você está enfrentando baixa energia, tente identificar a causa e ajuste sua rotina para incluir atividades que aumentem sua energia e motivação, como exercícios físicos e uma dieta equilibrada.';
    }

    return sugestao;
}

// Função para exibir o resultado do questionário
function exibirResultado(respostas) {
    const resultadoContainer = document.getElementById('resultado');
    if (resultadoContainer) {
        const sugestao = gerarSugestao(respostas);
        resultadoContainer.innerHTML = `<p>${sugestao}</p>`;
        resultadoContainer.classList.remove('hidden');
    }
}

// Função para carregar e exibir o questionário
async function carregarQuestionario() {
    const dados = await carregarJSON('data/questions.json');
    if (dados) {
        // Assumindo que queremos exibir perguntas de todos os grupos
        const todasPerguntas = Object.values(dados).flat();
        return todasPerguntas;
    } else {
        console.error('Não foi possível carregar os dados do questionário.');
        return [];
    }
}

// Função para salvar emoção no diário
function salvarEmocao(emocaoTexto) {
    const historicoEmocoes = document.getElementById('historico-emocoes');
    if (historicoEmocoes) {
        const emocaoItem = {
            texto: emocaoTexto,
            timestamp: new Date().toISOString()
        };

        let historico = JSON.parse(localStorage.getItem('mindCheck')) || [];
        historico.push(emocaoItem);
        localStorage.setItem('mindCheck', JSON.stringify(historico));

        atualizarHistorico();
    }
}

// Função para atualizar o histórico de emoções na página
function atualizarHistorico() {
    const historicoEmocoes = document.getElementById('historico-emocoes');
    if (historicoEmocoes) {
        historicoEmocoes.innerHTML = '';

        let historico = JSON.parse(localStorage.getItem('mindCheck')) || [];

        historico.forEach(emocaoItem => {
            const emocaoDiv = document.createElement('div');
            emocaoDiv.classList.add('emocao-item');
            emocaoDiv.innerHTML = `
                ${emocaoItem.texto}
                <button class="delete-emocao" aria-label="Excluir emoção">X</button>
            `;

            emocaoDiv.querySelector('.delete-emocao').addEventListener('click', () => {
                removerEmocao(emocaoItem.timestamp);
            });

            historicoEmocoes.appendChild(emocaoDiv);
        });
    }
}

// Função para remover uma emoção do diário
function removerEmocao(timestamp) {
    let historico = JSON.parse(localStorage.getItem('mindCheck')) || [];
    historico = historico.filter(emocao => emocao.timestamp !== timestamp);
    localStorage.setItem('mindCheck', JSON.stringify(historico));

    atualizarHistorico();
}

// Configurar eventos para o questionário e o diário de emoções
document.addEventListener('DOMContentLoaded', () => {
    let perguntas = [];
    let perguntaAtual = 0;

    document.getElementById('iniciar-questionario').addEventListener('click', async () => {
        perguntas = await carregarQuestionario();
        if (perguntas.length > 0) {
            document.getElementById('iniciar-questionario').classList.add('hidden');
            document.getElementById('proximo-pergunta').classList.remove('hidden');
            mostrarProximaPergunta(perguntaAtual, perguntas);
        }
    });

    document.getElementById('proximo-pergunta').addEventListener('click', () => {
        perguntaAtual++;
        if (perguntaAtual < perguntas.length) {
            mostrarProximaPergunta(perguntaAtual, perguntas);
        } else {
            document.getElementById('proximo-pergunta').classList.add('hidden');
            document.getElementById('enviar-respostas').classList.remove('hidden');
        }
    });

    document.getElementById('enviar-respostas').addEventListener('click', () => {
        const respostas = Array.from(document.querySelectorAll('input[name="pergunta"]:checked')).map(input => input.value);
        exibirResultado(respostas);
    });

    document.getElementById('salvar-emocao').addEventListener('click', () => {
        const emocaoTexto = document.getElementById('entrada-emocao').value.trim();
        if (emocaoTexto) {
            salvarEmocao(emocaoTexto);
            document.getElementById('entrada-emocao').value = '';
        }
    });

    atualizarHistorico();
});
