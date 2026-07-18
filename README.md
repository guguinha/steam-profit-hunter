# Steam Profit Hunter 🎮

O **Steam Profit Hunter** é uma extensão para Google Chrome criada para auxiliar na identificação de jogos na loja da Steam que possuem cartas colecionáveis, calculando automaticamente se o valor das cartas compensa o preço do jogo.

## ✨ Funcionalidades
*   **Análise em Tempo Real:** Identifica o preço do jogo e o valor de mercado das cartas.
*   **Filtro Inteligente:** Filtra cartas *Foil* (Brilhantes) automaticamente, focando apenas no lucro real das cartas normais.
*   **Sistema de Fila (Queue):** Processa os jogos de forma ordenada para evitar bloqueios temporários (Rate Limits) pela Steam.
*   **Indicadores Visuais:** 
    *   🟢 **Verde:** Lucro estimado positivo.
    *   🔴 **Vermelho:** Prejuízo estimado.
    *   ⚙️ **Cinza:** Em processamento ou sem dados disponíveis.

## 🛠 Como Instalar

1.  **Prepare a pasta:** Certifique-se de que todos os arquivos da extensão (`manifest.json`, `background.js`, `content.js`, etc.) estejam em uma única pasta no seu computador.
2.  **Acesse as Extensões:** No Google Chrome, digite `chrome://extensions/` na barra de endereços e pressione Enter.
3.  **Ative o Modo Desenvolvedor:** No canto superior direito, ative a chave **"Modo do desenvolvedor"**.
4.  **Carregue a extensão:** Clique no botão **"Carregar sem compactação"** (Load unpacked) que aparecerá no topo esquerdo.
5.  **Selecione a pasta:** Navegue até a pasta onde você salvou os arquivos e clique em "Selecionar Pasta".

## 🚀 Como Utilizar

1.  **Login:** Certifique-se de estar logado na sua conta da Steam no navegador. A extensão utiliza seus cookies de sessão para ler os preços corretamente em Reais (R$).
2.  **Navegação:** Acesse a loja da Steam, páginas de promoções ou resultados de busca.
3.  **Processamento:** A extensão injetará automaticamente caixinhas abaixo do preço de cada jogo.
4.  **Leitura:**
    *   Aguarde o status *"🔄 Buscando API..."* ser substituído pelos dados de cálculo.
    *   Se o jogo for lucrativo, o valor do lucro aparecerá em destaque.

## ⚠️ Observações Importantes

*   **Evite o Erro 429:** A Steam bloqueia conexões se muitas requisições forem feitas em curtíssimo espaço de tempo. A extensão possui um delay automático, mas evite rolar páginas com centenas de jogos muito rapidamente.
*   **Precisão de Dados:** O lucro exibido é uma estimativa baseada nos preços atuais do mercado da comunidade Steam. Os valores podem oscilar conforme a oferta e demanda.
*   **Privacidade:** Esta extensão não armazena, coleta ou envia nenhum dado pessoal ou financeiro para servidores externos. Todo o processamento ocorre localmente no seu navegador.

---
*Projeto desenvolvido para uso pessoal e educacional.*
