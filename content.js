// Função real de cálculo com as taxas em Reais (BRL)
function calcularLucroReal(precoJogo, totalCartas, precoCarta) {
    const cartasDropadas = Math.ceil(totalCartas / 2);
    let ganhoLiquidoTotal = 0;

    for (let i = 0; i < cartasDropadas; i++) {
        if (precoCarta <= 0.15) {
            ganhoLiquidoTotal += 0.05;
        } else {
            let estimadoReceber = Math.floor((precoCarta / 1.15) * 100) / 100;
            ganhoLiquidoTotal += estimadoReceber;
        }
    }

    const lucroEstimado = ganhoLiquidoTotal - precoJogo;
    return {
        cartasDropadas,
        lucro: lucroEstimado.toFixed(2),
        roi: ((lucroEstimado / precoJogo) * 100).toFixed(0),
        positivo: lucroEstimado > 0
    };
}

// Função para descobrir o AppID do jogo com base no HTML da Steam
function extrairAppId(elemento) {
    // Procura o link do jogo (pode ser o próprio elemento ou um pai/filho dele)
    const linkElemento = elemento.closest('a') || elemento.querySelector('a') || document.location;
    const url = linkElemento.href || "";
    
    // Expressão regular para pegar o número logo após o "/app/"
    const match = url.match(/\/app\/(\d+)/);
    return match ? match[1] : null;
}

// FUNÇÃO CHAVE: Busca os dados reais das cartas via API externa
async function buscarDadosDasCartas(appId) {
    try {
        // No projeto final do Git, aqui faremos o fetch para uma API real, ex:
        // const response = await fetch(`https://api.exemplo.com/steam/cartas/${appId}`);
        // const dados = await response.json();
        
        // --- SIMULAÇÃO DE RESPOSTA DA API ---
        // Aqui simulamos que a API respondeu dinamicamente baseado no ID do jogo
        // Se o ID for do Rain World (312520), fingimos dados diferentes para teste:
        if (appId === "312520") {
            return { totalCartas: 9, precoMenorCarta: 0.45 }; 
        }
        
        // Valor genérico simulado para outros jogos enquanto não conectamos a API real
        return {
            totalCartas: 6,
            precoMenorCarta: 0.25
        };
        // -------------------------------------
        
    } catch (erro) {
        console.error("Erro ao buscar dados das cartas para o app " + appId, erro);
        return null;
    }
}

function extrairPrecoPuro(texto) {
    if (!texto) return null;
    const textoMinusculo = texto.toLowerCase();
    if (textoMinusculo.includes('grátis') || textoMinusculo.includes('gratuito') || textoMinusculo.includes('free')) return null;
    
    const encontrarNumeros = textoMinusculo.match(/\d+[\.,]\d+/g);
    if (encontrarNumeros && encontrarNumeros.length > 0) {
        return parseFloat(encontrarNumeros[encontrarNumeros.length - 1].replace(',', '.'));
    }
    return null;
}

// Transformamos a função em ASSÍNCRONA (async) para ela poder esperar (await) as respostas das APIs
async function rodarAnaliseProfit() {
    const elementosPreco = document.querySelectorAll('.game_purchase_price.price, .discount_final_price, .bundle_final_package_price, .search_reviewsummary_each_price_box span');

    for (let elemento of elementosPreco) {
        if (elemento.getAttribute('data-profit-injected') === 'true') continue;
        elemento.setAttribute('data-profit-injected', 'true');

        const precoValor = extrairPrecoPuro(elemento.innerText);
        const appId = extrairAppId(elemento);

        // Só faz a conta se tivermos o preço do jogo E o ID dele
        if (precoValor && appId) {
            
            // O script "pausa" aqui rapidinho até a API responder os dados deste jogo específico
            const dadosCartas = await buscarDadosDasCartas(appId);

            if (dadosCartas) {
                const resultado = calcularLucroReal(precoValor, dadosCartas.totalCartas, dadosCartas.precoMenorCarta);

                const divLucro = document.createElement('div');
                divLucro.className = 'steam-profit-box-local';
                divLucro.style.padding = '5px';
                divLucro.style.marginTop = '3px';
                divLucro.style.borderRadius = '3px';
                divLucro.style.fontFamily = 'Arial, sans-serif';
                divLucro.style.fontSize = '11px';
                divLucro.style.display = 'inline-block';
                divLucro.style.background = resultado.positivo ? '#1b401e' : '#332222';
                divLucro.style.color = '#ffffff';
                divLucro.style.border = resultado.positivo ? '1px solid #308a37' : '1px solid #663333';
                
                divLucro.innerHTML = `
                    ID: ${appId} | Drops: <strong>${resultado.cartasDropadas}</strong> | Lucro: <strong style="color: ${resultado.positivo ? '#5cff67' : '#ff5c5c'}">R$ ${resultado.lucro}</strong>
                `;

                elemento.parentElement.appendChild(divLucro);
            }
        }
    }
}

// Execuções
rodarAnaliseProfit();
setInterval(rodarAnaliseProfit, 2000);