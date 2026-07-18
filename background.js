chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "buscarCartas") {
        
        // Count 100 é o limite máximo da API. Isso garante que venha o set completo.
        const urlAPI = `https://steamcommunity.com/market/search/render/?query=&start=0&count=100&search_descriptions=0&appid=753&category_753_Game%5B%5D=tag_app_${request.appId}&category_753_item_class%5B%5D=tag_item_class_2&norender=1`;

        fetch(urlAPI, { credentials: 'include' })
            .then(response => {
                if (response.status === 429) throw new Error("RATE_LIMIT");
                if (!response.ok) throw new Error(`HTTP_${response.status}`);
                return response.json();
            })
            .then(dados => {
                if (dados && dados.success && dados.results && dados.results.length > 0) {
                    
                    // 1. FILTRAGEM LOCAL: Remove Foil/Brilhante
                    // O filtro usa .toLowerCase() para evitar erros de acentuação ou caixa
                    const cartasNormais = dados.results.filter(item => {
                        const nome = item.name.toLowerCase();
                        return !nome.includes("foil") && !nome.includes("brilhante") && !nome.includes("shiny");
                    });

                    // 2. CONTAGEM EXATA: Quantos tipos diferentes existem?
                    const nomesUnicos = new Set(cartasNormais.map(item => item.name));
                    const totalCartasReais = nomesUnicos.size;

                    // 3. PREÇO: Menor preço apenas entre as cartas normais
                    const precoMenorCarta = cartasNormais.length > 0 
                        ? Math.min(...cartasNormais.map(item => item.sell_price)) / 100 
                        : 0;

                    if (totalCartasReais > 0) {
                        sendResponse({ 
                            sucesso: true, 
                            totalCartas: totalCartasReais, 
                            precoMenorCarta: precoMenorCarta 
                        });
                    } else {
                        // Se não sobrou nenhuma carta após o filtro
                        sendResponse({ sucesso: false, erro: "SEM_CARTAS_NORMAIS" });
                    }
                } else {
                    sendResponse({ sucesso: false, erro: "SEM_CARTAS" });
                }
            })
            .catch(erro => {
                sendResponse({ sucesso: false, erro: erro.message });
            });

        return true;
    }
});