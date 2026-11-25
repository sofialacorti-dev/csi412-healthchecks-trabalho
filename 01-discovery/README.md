# 01 - Discovery (Descoberta)

## O que o Healthchecks resolve
O Healthchecks é um serviço de monitoramento de tarefas cron (cron jobs). Ele escuta pings HTTP de rotinas agendadas e alerta quando um script falha ou deixa de rodar.

## Jobs-to-be-Done (JTBD)
- **Quando** meu script de backup noturno executa, **eu quero** enviar um ping automático para o Healthchecks, **para que** eu seja alertado imediatamente se a rotina falhar.
- **Quando** um job de sincronização de dados falha silenciosamente, **eu quero** receber um alerta por e-mail ou webhook, **para que** o problema seja corrigido rapidamente.

## Personas
1. **Carlos (Engenheiro DevOps):** Gerencia dezenas de servidores e precisa de monitoramento simples baseado em URLs web.
2. **Ana (Desenvolvedora Backend):** Cria rotinas em lote e precisa auditar o histórico de execuções e durações.
