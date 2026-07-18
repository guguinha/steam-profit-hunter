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

function rodarAnaliseProfit() {
    const elementosPreco = document.querySelectorAll('.game_purchase_price.price, .discount_final_price, .bundle_final_package_price, .search_reviewsummary_each_price_box span');

    for (let elemento of elementosPreco) {
        if (elemento.getAttribute('data-profit-injected') === 'true') continue;
        elemento.setAttribute('data-profit-injected', 'true');

        const precoValor = extrairPrecoPuro(elemento.innerText);
        const appId = extrairAppId(elemento);

        if (precoValor && appId) {
            // 1. CRIANDO A CAIXA DE LOADING IMEDIATAMENTE
            const divCaixa = document.createElement('div');
            divCaixa.className = 'steam-profit-box-local';
            divCaixa.style.padding = '4px 6px';
            divCaixa.style.marginTop = '4px';
            divCaixa.style.borderRadius = '3px';
            divCaixa.style.fontFamily = 'Arial, sans-serif';
            divCaixa.style.fontSize = '11px';
            divCaixa.style.display = 'block'; // Block para ficar alinhado bonito debaixo do preço
            
            // Visual de "carregando"
            divCaixa.style.background = '#222222';
            divCaixa.style.color = '#888888';
            divCaixa.style.border = '1px solid #444444';
            divCaixa.innerHTML = `⏳ Analisando cartas (ID: ${appId})...`;

            // Injeta o Loading na tela
            elemento.parentElement.appendChild(divCaixa);

            // 2. PEDINDO DADOS AO BACKGROUND
            chrome.runtime.sendMessage({ action: "buscarCartas", appId: appId }, (resposta) => {
                
                // 3. ATUALIZANDO A MESMA CAIXA COM O RESULTADO
                if (resposta && resposta.sucesso && resposta.totalCartas > 0) {
                    const resultado = calcularLucroReal(precoValor, resposta.totalCartas, resposta.precoMenorCarta);

                    divCaixa.style.background = resultado.positivo ? '#1b401e' : '#332222';
                    divCaixa.style.color = '#ffffff';
                    divCaixa.style.border = resultado.positivo ? '1px solid #308a37' : '1px solid #663333';
                    
                    divCaixa.innerHTML = `
                        Cards: ${resposta.totalCartas} | Carta: R$ ${resposta.precoMenorCarta.toFixed(2)} | Profit: <strong style="color: ${resultado.positivo ? '#5cff67' : '#ff5c5c'}">R$ ${resultado.lucro}</strong>
                    `;
                } else {
                    // Tratamento visual de erros reais
                    divCaixa.style.background = '#2a2a2a';
                    divCaixa.style.color = '#777777';
                    divCaixa.style.border = '1px solid #555555';
                    
                    if (resposta && resposta.erro === "RATE_LIMIT") {
                        divCaixa.innerHTML = `⚠️ Limite da Steam (Espere um pouco)`;
                        divCaixa.style.color = '#d4b73b'; // Amarelo para chamar atenção
                    } else {
                        divCaixa.innerHTML = `❌ Sem cartas no mercado`;
                        // Apaga caixas sem cartas após 3 segundos para limpar a tela
                        setTimeout(() => divCaixa.remove(), 3000); 
                    }
                }
            });
        }
    }
}

// Inicializações básicas
rodarAnaliseProfit();
setInterval(rodarAnaliseProfit, 2500);