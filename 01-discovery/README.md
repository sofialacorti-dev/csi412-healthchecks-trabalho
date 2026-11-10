# 01 — Discovery: O que é o Healthchecks?

> Investigação realizada em 09/11/2026 sobre o release **v5.0.3** (publicado em 27/10/2026).
> Toda seção abaixo indica a evidência que sustenta a afirmação, no formato **[E#]**.

---

## 1. O que é o software?

**Healthchecks** é um serviço de monitoramento de _cron jobs_ e tarefas agendadas ("cron job monitoring service"). Ele funciona com base no modelo **dead man's switch**: o sistema monitorado deve enviar um "ping" (requisição HTTP ou e-mail) periodicamente para o Healthchecks. Se o ping esperado **não chega no prazo**, o Healthchecks envia alertas por múltiplos canais.

- **Definição do próprio projeto:** _"Healthchecks is a cron job monitoring service. It listens for HTTP requests and email messages ('pings') from your cron jobs and scheduled tasks ('checks'). When a ping does not arrive on time, Healthchecks sends out alerts."_ — README do repositório [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md)
- **Versão analisada:** v5.0.3, publicada em 27/10/2026 [[E2]](https://github.com/healthchecks/healthchecks/releases/tag/v5.0.3)

### O problema que o software resolve

Falhas em tarefas agendadas (backups, relatórios, renovação de certificados) costumam ser **silenciosas**: o cron roda (ou falha) sem ninguém olhando, e o problema só é descoberto semanas depois, quando alguém precisa do backup que nunca foi gerado. O próprio projeto descreve isso na documentação pública: _"A failed cron job often has no immediate visible consequences and can go unnoticed for a long time."_ [[E3]](https://healthchecks.io/)

O Healthchecks inverte a lógica: em vez de monitorar se o processo rodou, ele alerta quando o **sinal de sucesso esperado não chega**.

### Como funciona (modelo de uso)

1. O usuário cria um "check" no dashboard e recebe uma **URL de ping única** (ex.: `https://hc.exemplo.com/ping/<uuid>`).
2. O usuário adiciona ao final do seu script/job uma chamada para essa URL (ex.: `curl -fsS --retry 3 https://hc.exemplo.com/ping/<uuid>`).
3. Cada check tem dois parâmetros configuráveis: **Period** (intervalo esperado entre pings) e **Grace Time** (tolerância de atraso antes de alertar) [[E4]](https://healthchecks.io/).
4. Estados possíveis de um check: **New** (sem pings ainda), **Up**, **Late** (passou do Period, dentro do Grace) e **Down** (passou de Period + Grace → dispara notificação) [[E4]](https://healthchecks.io/).
5. Alternativamente ao Period, o usuário pode definir a expectativa via **expressão cron**, interpretada pela biblioteca `cronsim` [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md).

---

## 2. Público-alvo e principais usuários

**Público-alvo:** desenvolvedores, administradores de sistemas (sysadmins), engenheiros DevOps/SRE e equipes técnicas que operam servidores, automações e tarefas agendadas.

**Evidências de quem usa:**

- Os casos de uso listados publicamente pelo projeto são todos técnicos: backups de filesystem/banco de dados, e-mails de relatório diários/semanais, renovação de SSL, jobs do Jenkins, tarefas agendadas do Windows, `wp-cron`, GitHub workflows, Kubernetes CronJobs, verificação de replicação de banco, espaço em disco, "I'm alive" de servidores/NAS/routers [[E5]](https://healthchecks.io/)
- Depoimentos públicos de usuários incluem fundadores de empresas de tecnologia e desenvolvedores que o usam para monitorar gateways IoT e processos de servidor [[E5]](https://healthchecks.io/)

---

## 3. Principais funcionalidades

| #   | Funcionalidade                                                                                                                                                                                                     | Evidência                                                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | Recebimento de pings via **HTTP** e via **e-mail** (servidor SMTP embutido, comando `manage.py smtpd`)                                                                                                             | README [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md)                                                                         |
| F2  | **Dashboard web** "My Checks" com atualização ao vivo do status de todos os checks                                                                                                                                 | README e página oficial [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md) [[E4]](https://healthchecks.io/)                       |
| F3  | Configuração de **Period + Grace Time** ou **expressão cron** por check (biblioteca `cronsim`)                                                                                                                     | README [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md)                                                                         |
| F4  | **Alertas em 25+ integrações**: E-mail, Webhooks, Slack, Discord, Telegram, MS Teams, PagerDuty, Opsgenie, Pushover, Signal, Matrix, Trello, Zulip, Gotify, ntfy, Spike.sh, SMS, ligação telefônica, WhatsApp etc. | README e página oficial [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md) [[E5]](https://healthchecks.io/)                       |
| F5  | **Log de eventos por check** (pings recebidos, notificações enviadas) com atualização ao vivo                                                                                                                      | README [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md)                                                                         |
| F6  | **Status badges públicos** com URLs difíceis de adivinhar, para uso em READMEs e status pages                                                                                                                      | README [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md)                                                                         |
| F7  | **API** para criação/gerenciamento de checks programaticamente                                                                                                                                                     | rodapé do site oficial: link "API" [[E5]](https://healthchecks.io/), docs da API [[E6]](https://healthchecks.io/docs/api/)                                |
| F8  | **Relatórios mensais/semanais** e lembretes diários/horários por e-mail (comando `sendreports`)                                                                                                                    | README [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md)                                                                         |
| F9  | **Gestão de equipes:** projetos, membros de time, acesso somente-leitura                                                                                                                                           | README _"team management features: projects, team members, read-only access"_ [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md)  |
| F10 | **Autenticação:** login por magic link e-mail, senha, **WebAuthn 2FA** (chaves de segurança) e autenticação externa via header de proxy                                                                            | README [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md)                                                                         |
| F11 | **Self-hosting**: Dockerfile oficial e imagens pré-construídas multi-arquitetura (amd64, arm/v7, arm64)                                                                                                            | README e Docker Hub [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md) [[E7]](https://hub.docker.com/r/healthchecks/healthchecks) |
| F12 | Armazenamento opcional dos **corpos de ping grandes em S3** (object storage compatível)                                                                                                                            | README [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md)                                                                         |

---

## 4. Tecnologias utilizadas

**Evidência principal:** `requirements.txt` do repositório [[E8]](https://github.com/healthchecks/healthchecks/blob/master/requirements.txt) e README [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md).

| Camada                              | Tecnologia                                                                        | Evidência                                                                                                                                                                                                          |
| ----------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Linguagem                           | Python 3.12+                                                                      | README [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md); release v5.0.3 atualiza imagem Docker para Python 3.14 [[E2]](https://github.com/healthchecks/healthchecks/releases/tag/v5.0.3) |
| Framework web                       | Django 6.1 (`Django[argon2]==6.1.3`)                                              | requirements.txt [[E8]](https://github.com/healthchecks/healthchecks/blob/master/requirements.txt)                                                                                                                 |
| Banco de dados                      | PostgreSQL, MySQL ou MariaDB (driver `psycopg==3.3.8`); SQLite em desenvolvimento | README [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md) + requirements.txt [[E8]](https://github.com/healthchecks/healthchecks/blob/master/requirements.txt)                             |
| Agendamento cron                    | `cronsim==2.8` (parser de expressões cron)                                        | requirements.txt [[E8]](https://github.com/healthchecks/healthchecks/blob/master/requirements.txt)                                                                                                                 |
| 2FA / WebAuthn                      | `fido2==2.2.1`                                                                    | requirements.txt [[E8]](https://github.com/healthchecks/healthchecks/blob/master/requirements.txt)                                                                                                                 |
| TOTP                                | `pyotp==2.10.0`                                                                   | requirements.txt [[E8]](https://github.com/healthchecks/healthchecks/blob/master/requirements.txt)                                                                                                                 |
| JWT                                 | `PyJWT[crypto]==2.15.1`                                                           | requirements.txt [[E8]](https://github.com/healthchecks/healthchecks/blob/master/requirements.txt)                                                                                                                 |
| QR codes                            | `segno==1.6.6` (provável uso em QR de 2FA/TOTP — _a verificar no código_)         | requirements.txt [[E8]](https://github.com/healthchecks/healthchecks/blob/master/requirements.txt)                                                                                                                 |
| HTTP client (pings de saída)        | `pycurl==7.49.0`                                                                  | requirements.txt [[E8]](https://github.com/healthchecks/healthchecks/blob/master/requirements.txt)                                                                                                                 |
| Servidor SMTP para pings por e-mail | `minismtpd==0.5` (comando `manage.py smtpd`)                                      | requirements.txt [[E8]](https://github.com/healthchecks/healthchecks/blob/master/requirements.txt) + README [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md)                             |
| Validação de dados                  | `pydantic==2.14.3`                                                                | requirements.txt [[E8]](https://github.com/healthchecks/healthchecks/blob/master/requirements.txt)                                                                                                                 |
| Assets estáticos                    | `django-compressor==4.6` e `whitenoise==6.12.0`                                   | requirements.txt [[E8]](https://github.com/healthchecks/healthchecks/blob/master/requirements.txt)                                                                                                                 |
| Métricas                            | `statsd==4.0.1`                                                                   | requirements.txt [[E8]](https://github.com/healthchecks/healthchecks/blob/master/requirements.txt)                                                                                                                 |
| Empacotamento/infra                 | Docker oficial, reverse proxy recomendado (nginx/Caddy/HAProxy)                   | README [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md)                                                                                                                                  |

**Arquitetura de processos** (README [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md)):

- Servidor web (uWSGI/gunicorn em produção; `runserver` só em desenvolvimento)
- `manage.py sendalerts` — loop contínuo que detecta mudanças de estado e envia notificações
- `manage.py sendreports --loop` — relatórios e lembretes periódicos
- `manage.py smtpd` — listener SMTP para pings via e-mail

---

## 5. Licença

**BSD 3-clause ("BSD 3-Clause License")** [[E9]](https://github.com/healthchecks/healthchecks/blob/master/LICENSE).

> _"Copyright (c) 2015, Pēteris Caune and other contributors. All rights reserved."_ — primeiras linhas do arquivo LICENSE [[E9]](https://github.com/healthchecks/healthchecks/blob/master/LICENSE)

Também declarada no README: _"Healthchecks is licensed under the BSD 3-clause license."_ [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md)

**Implicação prática:** licença permissiva — permite uso, modificação, redistribuição e uso comercial, desde que o aviso de copyright seja mantido. Não é copyleft (ao contrário de GPL).

---

## 6. Modelo de negócio / distribuição

- **SaaS hospedado** (gratuito até 20 checks) em https://healthchecks.io — mantido pela empresa SIA Monkey See Monkey Do [[E5]](https://healthchecks.io/)
- **Self-hosted gratuito:** qualquer pessoa pode rodar sua própria instância a partir do código-fonte [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md)
- Desenvolvimento primariamente conduzido por **Pēteris Caune (@cuu508)**, autor da release v5.0.3 [[E2]](https://github.com/healthchecks/healthchecks/releases/tag/v5.0.3)

---

## 7. Personas

### Persona 1 — Rafael, engenheiro DevOps (29 anos)

- **Contexto:** trabalha em uma fintech com ~15 servidores e dezenas de jobs agendados (backups noturnos de banco, sincronização de dados, renovação de certificados SSL).
- **Comportamento:** administra crontabs espalhados por vários servidores; usa Slack como canal central de alertas da equipe.
- **Necessidade:** saber, o mais rápido possível, quando um job crítico falhou — sem ter que abrir mão de ferramentas pagas pesadas.
- **Evidências que sustentam esta persona:** casos de uso descritos publicamente (backups, renovação de SSL, pipelines de dados, monitoramento de recursos de sistema) [[E5]](https://healthchecks.io/); integrações com Slack, PagerDuty, Opsgenie (ferramentas típicas de equipes DevOps) [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md).

**JTBD (Job to Be Done):**

> **Quando** um job de backup noturno falha silenciosamente em um dos meus servidores, **quero** receber um alerta no Slack da equipe dentro do prazo de tolerância que defini, **para** poder corrigir ou acionar o plano de contingência antes que a falta do backup vire um problema real para o negócio.

### Persona 2 — Ana, desenvolvedora full-stack e mantenedora de SaaS (34 anos)

- **Contexto:** mantém sozinha um SaaS com poucos clientes; roda uma instância self-hosted do Healthchecks em um VPS próprio porque prefere não depender de serviço pago nem enviar dados para terceiros.
- **Comportamento:** escreve os próprios scripts de manutenção (limpeza, envio de relatórios, verificação de integridade); monitora também "estou viva" do próprio servidor.
- **Necessidade:** monitoramento barato (grátis), leve e de configuração em minutos — um `curl` no fim do script resolve.
- **Evidências que sustentam esta persona:** modelo self-hosted documentado (Docker, configuração via variáveis de ambiente) [[E1]](https://github.com/healthchecks/healthchecks/blob/master/README.md); caso de uso "send simple, unconditional 'I'm alive' messages from your server (or your NAS, router, Raspberry Pi...)" [[E5]](https://healthchecks.io/); depoimento público de usuário mantenedor de SaaS (_"founder of WhatIsMyBrowser.com"_) [[E5]](https://healthchecks.io/).

**JTBD (Job to Be Done):**

> **Quando** eu adiciono uma nova tarefa agendada ao meu servidor, **quero** registrá-la no Healthchecks em menos de um minuto (criar check + colar um `curl` no fim do script), **para** garantir que qualquer falha futura me avise por e-mail sem eu ter que implantar e manter uma ferramenta de monitoramento complexa.

---

## Índice de evidências

| ID  | Evidência                                                                  | Link                                                                      |
| --- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| E1  | README do repositório (funcionalidades, tecnologias, arquitetura, licença) | https://github.com/healthchecks/healthchecks/blob/master/README.md        |
| E2  | Release v5.0.3 (27/10/2026)                                                | https://github.com/healthchecks/healthchecks/releases/tag/v5.0.3          |
| E3  | Página inicial do serviço hospedado                                        | https://healthchecks.io/                                                  |
| E4  | Estados dos checks (New/Up/Late/Down) e Period/Grace                       | https://healthchecks.io/                                                  |
| E5  | Casos de uso e depoimentos de usuários                                     | https://healthchecks.io/                                                  |
| E6  | Documentação da API                                                        | https://healthchecks.io/docs/api/                                         |
| E7  | Imagens Docker oficiais                                                    | https://hub.docker.com/r/healthchecks/healthchecks                        |
| E8  | requirements.txt (dependências exatas)                                     | https://github.com/healthchecks/healthchecks/blob/master/requirements.txt |
| E9  | Arquivo LICENSE (BSD 3-clause)                                             | https://github.com/healthchecks/healthchecks/blob/master/LICENSE          |

---

> **Nota de verificação:** este documento foi elaborado com apoio de IA generativa, mas **todas** as afirmações acima foram conferidas por nós diretamente no repositório e no site oficial do Healthchecks nos links indicados. O registro completo do uso de IA está em [`../ia.md`](../ia.md).
