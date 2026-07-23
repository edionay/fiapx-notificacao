import { env } from "./config/env.js";
import { EnviarNotificacao } from "./aplicacao/enviar-notificacao.js";
import {
  criarTransporte,
  EnviadorEmailSmtp,
} from "./adaptadores/email/enviador-email-smtp.js";
import { conectarRabbit } from "./adaptadores/mensageria/cliente-rabbit.js";

const transporte = criarTransporte(env.smtpHost, env.smtpPort);
const enviador = new EnviadorEmailSmtp(transporte, env.emailRemetente);
const enviar = new EnviarNotificacao(enviador);

const rabbit = await conectarRabbit(env.rabbitmqUrl);
await rabbit.consumirNotificacoes(enviar);

console.log("fiapx-notificacao consumindo a fila notificacoes");

for (const sinal of ["SIGINT", "SIGTERM"] as const) {
  process.on(sinal, () => {
    console.log(`Recebido ${sinal}, encerrando...`);
    void rabbit.fechar().then(() => {
      transporte.close();
      process.exit(0);
    });
  });
}
