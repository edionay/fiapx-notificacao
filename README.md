# fiapx-notificacao

Serviço de notificação do **Sistema de Processamento de Vídeos FIAP X**. É um serviço
**stateless e sem HTTP**: consome a fila `notificacoes` do RabbitMQ e envia um e-mail ao
usuário quando o processamento de um vídeo falha.

> Contratos das filas e visão do sistema no repositório
> [`fiapx-infra`](https://github.com/edionay/fiapx-infra).

## Stack

- **Node** ≥ 22
- **TypeScript** (ESM)
- **amqplib** para consumo do RabbitMQ
- **nodemailer** para envio por SMTP
- **Vitest** para testes

## Como funciona

A API publica na fila `notificacoes` sempre que um vídeo termina em `ERRO`. Cada mensagem
carrega `{ videoId, emailUsuario, mensagemErro }`. Este serviço consome a fila, monta um
e-mail com o vídeo e o motivo da falha e o envia por SMTP ao dono do vídeo. O consumo usa
fila durável, `prefetch` 1 e confirmação manual (`ack`).

Sem um destinatário válido a mensagem é confirmada e descartada, evitando reprocessamento.

## Configuração

As variáveis ficam em [`.env.example`](.env.example):

| Variável | Padrão | Descrição |
|---|---|---|
| `RABBITMQ_URL` | `amqp://guest:guest@localhost:5672` | Conexão com o RabbitMQ. |
| `SMTP_HOST` | `localhost` | Host do servidor SMTP. |
| `SMTP_PORT` | `1025` | Porta do servidor SMTP. |
| `EMAIL_REMETENTE` | `nao-responda@fiapx.local` | Endereço usado como remetente. |

## Scripts

```bash
npm install
npm run dev        # execução em desenvolvimento
npm run build      # compila para dist/
npm run typecheck  # verificação de tipos
npm test           # testes
```

## Docker

O `Dockerfile` é multi-stage: compila o TypeScript em um estágio de build e produz uma
imagem final enxuta com apenas as dependências de produção e usuário não-root.

```bash
docker build -t fiapx-notificacao .
docker run --rm \
  -e RABBITMQ_URL="amqp://fiapx:fiapx@rabbitmq:5672" \
  -e SMTP_HOST="smtp" \
  fiapx-notificacao
```

## Testes

```bash
npm test
```

Os testes cobrem o caso de uso (`EnviarNotificacao`) e o envio por SMTP contra um servidor
em memória. O teste de integração com o RabbitMQ roda quando `RABBITMQ_URL` está definido,
como acontece na integração contínua.

## Integração contínua

O workflow em `.github/workflows/ci.yml` roda a cada pull request e push na `main`. Ele sobe
um RabbitMQ de serviço, instala as dependências e executa `typecheck`, `test` e `build`.

## Estrutura

O código segue Clean Architecture, com as dependências apontando para o domínio:
`dominio` (contrato da notificação) ← `aplicacao` (caso de uso e portas) ← `adaptadores`
(SMTP e RabbitMQ).

```
Dockerfile
src/
├── server.ts                 # sobe o serviço: conecta SMTP e RabbitMQ
├── config/
│   └── env.ts                # configuração lida do ambiente
├── dominio/
│   └── notificacao.ts        # contrato da notificação
├── aplicacao/
│   ├── portas.ts             # portas (EnviadorEmail)
│   └── enviar-notificacao.ts # caso de uso
└── adaptadores/
    ├── email/                # envio por SMTP (nodemailer)
    └── mensageria/           # consumo do RabbitMQ
test/
├── aplicacao/                # teste unitário do caso de uso
├── email/                    # envio SMTP contra servidor em memória
└── mensageria/               # integração com o RabbitMQ (roda com RABBITMQ_URL)
```
