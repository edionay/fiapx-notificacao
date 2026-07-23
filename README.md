# fiapx-notificacao

Serviço de notificação do **Sistema de Processamento de Vídeos FIAP X**. Será um serviço
**stateless e sem HTTP**: consome a fila `notificacoes` do RabbitMQ e envia um e-mail ao usuário
quando o processamento de um vídeo falha.

> Contratos das filas e visão do sistema no repositório
> [`fiapx-infra`](https://github.com/edionay/fiapx-infra).

Este repositório está em construção. Nesta etapa foi feita apenas a **estrutura do projeto**
(dependências, TypeScript, testes e CI). A funcionalidade entra nas próximas etapas.

## Stack

- **Node** ≥ 22
- **TypeScript** (ESM)
- **amqplib** (consumo do RabbitMQ)
- **nodemailer** (envio por SMTP)
- **Vitest** para testes

## Scripts

```bash
npm install
npm run dev        # execução em desenvolvimento
npm run build      # compila para dist/
npm run typecheck  # verificação de tipos
npm test           # testes
```
