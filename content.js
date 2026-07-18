// --- FUNÇÕES DE CÁLCULO E EXTRAÇÃO ---
function calcularLucroReal(precoJogo, totalCartas, precoCarta) {
    if (totalCartas === 0 || precoCarta === 0) return { cartasDropadas: 0, lucro: "0.00", roi: 0, positivo: false };
    
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
        roi: precoJogo > 0 ? ((lucroEstimado / precoJogo) * 100).toFixed(0) : 0,
        positivo: lucroEstimado > 0
    };
}

function extrairAppId(elemento) {
    const linkElemento = elemento.closest('a') || elemento.querySelector('a') || document.location;
    const url = linkElemento.href || "";
    const match = url.match(/\/app\/(\d+)/);
    return match ? match[1] : null;
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

// --- SISTEMA DE FILA ---
let filaDeJogos = [];
let processandoFila = false;

function escanearEAdicionarNaFila() {
    const elementosPreco = document.querySelectorAll('.game_purchase_price.price, .discount_final_price, .bundle_final_package_price, .search_reviewsummary_each_price_box span');

    for (let elemento of elementosPreco) {
        if (elemento.getAttribute('data-profit-injected') === 'true') continue;
        elemento.setAttribute('data-profit-injected', 'true');

        const precoValor = extrairPrecoPuro(elemento.innerText);
        const appId = extrairAppId(elemento);

        if (precoValor && appId) {
            const divCaixa = document.createElement('div');
            divCaixa.className = 'steam-profit-box-local';
            divCaixa.style.padding = '4px 6px';
            divCaixa.style.marginTop = '4px';
            divCaixa.style.borderRadius = '3px';
            divCaixa.style.fontFamily = 'Arial, sans-serif';
            divCaixa.style.fontSize = '11px';
            divCaixa.style.display = 'block';
            
            divCaixa.style.background = '#111111';
            divCaixa.style.color = '#555555';
            divCaixa.style.border = '1px dashed #333333';
            divCaixa.innerHTML = `⏳ Na fila de análise...`;

            elemento.parentElement.appendChild(divCaixa);

            filaDeJogos.push({ appId, precoValor, divCaixa });
        }
    }

    if (filaDeJogos.length > 0 && !processandoFila) {
        iniciarRoboDeProcessamento();
    }
}

async function iniciarRoboDeProcessamento() {
    processandoFila = true;

    while (filaDeJogos.length > 0) {
        const itemAtual = filaDeJogos.shift(); 
        
        itemAtual.divCaixa.style.background = '#222222';
        itemAtual.divCaixa.style.color = '#888888';
        itemAtual.divCaixa.style.border = '1px solid #444444';
        itemAtual.divCaixa.innerHTML = `🔄 Buscando API (ID: ${itemAtual.appId})...`;

        // Pede os dados e aguarda a promessa ser resolvida (agora com segurança contra travamentos)
        await analisarUnicoJogo(itemAtual);

        const tempoEspera = Math.floor(Math.random() * 1000) + 1000;
        await new Promise(resolve => setTimeout(resolve, tempoEspera));
    }

    processandoFila = false;
}

function analisarUnicoJogo(item) {
    return new Promise((resolve) => {
        
        // 1. A NOVA VÁLVULA DE SEGURANÇA: Se demorar mais de 10s, aborta e libera a fila
        const timeoutSeguranca = setTimeout(() => {
            item.divCaixa.innerHTML = `❌ Erro: Tempo esgotado`;
            item.divCaixa.style.background = '#2a2a2a';
            resolve(); // Libera o 'await' para a fila continuar
        }, 10000); 

        chrome.runtime.sendMessage({ action: "buscarCartas", appId: item.appId }, (resposta) => {
            
            // 2. Desativa o timeout se a resposta chegou antes dos 10s
            clearTimeout(timeoutSeguranca); 

            // 3. Verifica se o Chrome perdeu a conexão com o Background silenciosamente
            if (chrome.runtime.lastError) {
                item.divCaixa.innerHTML = `❌ Erro de comunicação interna`;
                item.divCaixa.style.background = '#2a2a2a';
                resolve();
                return;
            }
            
            if (resposta && resposta.sucesso && resposta.totalCartas > 0) {
                const resultado = calcularLucroReal(item.precoValor, resposta.totalCartas, resposta.precoMenorCarta);

                item.divCaixa.style.background = resultado.positivo ? '#1b401e' : '#332222';
                item.divCaixa.style.color = '#ffffff';
                item.divCaixa.style.border = resultado.positivo ? '1px solid #308a37' : '1px solid #663333';
                
                item.divCaixa.innerHTML = `
                    Cards: ${resposta.totalCartas} | Carta: R$ ${resposta.precoMenorCarta.toFixed(2)} | Profit: <strong style="color: ${resultado.positivo ? '#5cff67' : '#ff5c5c'}">R$ ${resultado.lucro}</strong>
                `;
            } else {
                item.divCaixa.style.background = '#2a2a2a';
                item.divCaixa.style.color = '#999999';
                item.divCaixa.style.border = '1px solid #444444';
                
                if (resposta && resposta.erro === "RATE_LIMIT") {
                    item.divCaixa.innerHTML = `⚠️ Limite da Steam (Aguarde e recarregue)`;
                    item.divCaixa.style.color = '#d4b73b';
                } else if (resposta && resposta.erro === "SEM_CARTAS") {
                    item.divCaixa.innerHTML = `❌ Sem cartas no mercado`;
                } else {
                    item.divCaixa.innerHTML = `❌ Erro: ${resposta ? resposta.erro : "Desconhecido"}`;
                }
            }
            
            resolve(); // Libera a fila
        });
    });
}

// Inicializações básicas
escanearEAdicionarNaFila();
setInterval(escanearEAdicionarNaFila, 3000);