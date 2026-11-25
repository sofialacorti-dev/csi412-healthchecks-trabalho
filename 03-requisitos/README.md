# 03 - Requisitos do Sistema

## Requisitos Funcionais (RF)
- **RF01:** O sistema deve permitir o cadastro de checagens com agendamento cron e tolerância (grace period).
- **RF02:** O sistema deve registrar pings HTTP de sucesso, início e falha com duração em milissegundos.
- **RF03:** O sistema deve transicionar o estado para "down" se o ping não for recebido no prazo.
- **RF04:** O sistema deve suportar canais de notificação (Webhooks, E-mail).

## Requisitos Não Funcionais (RNF)
- **RNF01:** Tempo de resposta do endpoint de ping menor que 100ms.
- **RNF02:** Interface web responsiva e compatível com navegadores modernos.
- **RNF03:** Alta disponibilidade para recepção de batimentos cardíacos (pings).
