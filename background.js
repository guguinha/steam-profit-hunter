// Escuta os pedidos vindos do content.js (página da Steam)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "buscarCartas") {
        
        // URL da API pública da comunidade ou dump do GitHub Pages (exemplo estrutural)
        // No GitHub do seu projeto, a comunidade costuma fixar o endpoint mais estável aqui
        const urlAPI = `https://raw.githubusercontent.com/CommunitySteamData/api/main/games/${request.appId}.json`;

        fetch(urlAPI)
            .then(response => {
                if (!response.ok) throw new Error("Jogo não possui cartas ou não foi mapeado");
                return response.json();
            })
            .then(dados => {
                // Devolve os dados reais recebidos da API para o content.js
                sendResponse({ 
                    sucesso: true, 
                    totalCartas: dados.total_cards || 6, 
                    precoMenorCarta: dados.lowest_price || 0.25 
                });
            })
            .catch(erro => {
                // Caso o jogo não tenha cartas (ex: jogos que não dropam nada), envia valores zerados
                sendResponse({ sucesso: false, totalCartas: 0, precoMenorCarta: 0.0 });
            });

        return true; // Mantém o canal de comunicação aberto para a resposta assíncrona
    }
});