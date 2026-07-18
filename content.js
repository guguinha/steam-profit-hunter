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

async function rodarAnaliseProfit() {
    const elementosPreco = document.querySelectorAll('.game_purchase_price.price, .discount_final_price, .bundle_final_package_price, .search_reviewsummary_each_price_box span');

    for (let elemento of elementosPreco) {
        if (elemento.getAttribute('data-profit-injected') === 'true') continue;
        elemento.setAttribute('data-profit-injected', 'true');

        const precoValor = extrairPrecoPuro(elemento.innerText);
        const appId = extrairAppId(elemento);

        if (precoValor && appId) {
            // ENVIANDO MENSAGEM PARA O BACKGROUND: Pede ao Chrome para buscar os dados reais externos
            chrome.runtime.sendMessage({ action: "buscarCartas", appId: appId }, (resposta) => {
                
                // Se a API retornou que o jogo tem cartas válidas, faz a linha de lucro
                if (resposta && resposta.totalCartas > 0) {
                    const resultado = calcularLucroReal(precoValor, resposta.totalCartas, resposta.precoMenorCarta);

                    const divLucro = document.createElement('div');
                    divLucro.className = 'steam-profit-box-local';
                    divLucro.style.padding = '4px 6px';
                    divLucro.style.marginTop = '3px';
                    divLucro.style.borderRadius = '3px';
                    divLucro.style.fontFamily = 'Arial, sans-serif';
                    divLucro.style.fontSize = '11px';
                    divLucro.style.display = 'inline-block';
                    divLucro.style.background = resultado.positivo ? '#1b401e' : '#332222';
                    divLucro.style.color = '#ffffff';
                    divLucro.style.border = resultado.positivo ? '1px solid #308a37' : '1px solid #663333';
                    
                    divLucro.innerHTML = `
                        Cards: ${resposta.totalCartas} | Menor Carta: R$ ${resposta.precoMenorCarta.toFixed(2)} | Profit: <strong style="color: ${resultado.positivo ? '#5cff67' : '#ff5c5c'}">R$ ${resultado.lucro}</strong>
                    `;

                    elemento.parentElement.appendChild(divLucro);
                }
            });
        }
    }
}

// Inicializações básicas
rodarAnaliseProfit();
setInterval(rodarAnaliseProfit, 2500);