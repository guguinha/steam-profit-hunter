chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "buscarCartas") {
        
        // Montamos a URL oficial de busca do mercado da Steam para pegar a carta mais barata do jogo
        const urlAPI = `https://steamcommunity.com/market/search/render/?query=&start=0&count=1&search_descriptions=0&sort_column=price&sort_dir=asc&appid=753&category_753_Game%5B%5D=tag_app_${request.appId}&category_753_item_class%5B%5D=tag_item_class_2`;

        fetch(urlAPI)
            .then(response => {
                // A Steam bloqueia temporariamente quem faz muitos pedidos seguidos (Status 429)
                if (response.status === 429) {
                    throw new Error("RATE_LIMIT"); 
                }
                if (!response.ok) {
                    throw new Error("ERRO_API");
                }
                return response.json();
            })
            .then(dados => {
                // Verifica se a Steam retornou sucesso e se o jogo possui cartas listadas
                if (dados && dados.success && dados.total_count > 0 && dados.results && dados.results.length > 0) {
                    
                    // total_count nos dá a quantidade exata de cartas diferentes daquele jogo no mercado
                    const totalCartas = dados.total_count;
                    
                    // O sell_price vem em centavos (ex: 25 = R$ 0,25). Dividimos por 100.
                    const precoMenorCarta = dados.results[0].sell_price / 100;

                    sendResponse({ 
                        sucesso: true, 
                        totalCartas: totalCartas, 
                        precoMenorCarta: precoMenorCarta 
                    });
                } else {
                    // Jogo não tem cartas ou as cartas não podem ser vendidas
                    sendResponse({ sucesso: false, erro: "SEM_CARTAS" });
                }
            })
            .catch(erro => {
                sendResponse({ sucesso: false, erro: erro.message });
            });

        return true; // Mantém o canal aberto para a resposta assíncrona
    }
});