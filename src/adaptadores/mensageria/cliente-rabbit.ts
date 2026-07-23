import amqp from "amqplib";
import type { EnviarNotificacao } from "../../aplicacao/enviar-notificacao.js";
import {
  FILA_NOTIFICACOES,
  iniciarConsumoNotificacoes,
} from "./consumidor-notificacoes-rabbit.js";

export interface ClienteRabbit {
  consumirNotificacoes(enviar: EnviarNotificacao): Promise<void>;
  fechar(): Promise<void>;
}

export async function conectarRabbit(url: string): Promise<ClienteRabbit> {
  const conexao = await amqp.connect(url);
  const canal = await conexao.createChannel();
  await canal.assertQueue(FILA_NOTIFICACOES, { durable: true });
  await canal.prefetch(1);

  return {
    async consumirNotificacoes(enviar: EnviarNotificacao): Promise<void> {
      await iniciarConsumoNotificacoes(canal, enviar);
    },
    async fechar(): Promise<void> {
      await canal.close();
      await conexao.close();
    },
  };
}
