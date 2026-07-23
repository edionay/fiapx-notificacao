import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import amqp, { type Channel, type ChannelModel } from "amqplib";
import { EnviarNotificacao } from "../../src/aplicacao/enviar-notificacao.js";
import type { Email, EnviadorEmail } from "../../src/aplicacao/portas.js";
import { iniciarConsumoNotificacoes } from "../../src/adaptadores/mensageria/consumidor-notificacoes-rabbit.js";

const url = process.env.RABBITMQ_URL;

class EnviadorFake implements EnviadorEmail {
  public readonly enviados: Email[] = [];
  async enviar(email: Email): Promise<void> {
    this.enviados.push(email);
  }
}

describe.skipIf(!url)("consumidor da fila notificacoes", () => {
  let conexao: ChannelModel;
  let canal: Channel;
  const fila = `notificacoes.teste.${randomUUID()}`;

  beforeAll(async () => {
    conexao = await amqp.connect(url!);
    canal = await conexao.createChannel();
    await canal.assertQueue(fila, { durable: false, autoDelete: true });
  });

  afterAll(async () => {
    await canal.close();
    await conexao.close();
  });

  it("consome a mensagem e dispara o envio do e-mail", async () => {
    const enviador = new EnviadorFake();
    await iniciarConsumoNotificacoes(canal, new EnviarNotificacao(enviador), fila);

    const videoId = randomUUID();
    canal.sendToQueue(
      fila,
      Buffer.from(
        JSON.stringify({
          videoId,
          emailUsuario: "dono@email.com",
          mensagemErro: "falha no ffmpeg",
        }),
      ),
    );

    for (let tentativa = 0; tentativa < 40 && enviador.enviados.length === 0; tentativa++) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    expect(enviador.enviados).toHaveLength(1);
    expect(enviador.enviados[0]!.para).toBe("dono@email.com");
    expect(enviador.enviados[0]!.corpo).toContain(videoId);
  });
});
