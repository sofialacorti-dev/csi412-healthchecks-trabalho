# 04 - Diagramas UML

## Arquitetura e Modelagem
- **Diagrama de Contexto:** Mostra o cliente enviando requisições HTTP GET/POST para os endpoints de ping do Healthchecks.
- **Diagrama de Classes:**
  - `Check` (id, name, schedule, grace, status, ping_url)
  - `Ping` (id, check_id, timestamp, type, duration)
  - `Channel` (id, check_id, kind, value)
- **Diagrama de Sequência:** Ciclo de vida da recepção de um ping e atualização de status.
