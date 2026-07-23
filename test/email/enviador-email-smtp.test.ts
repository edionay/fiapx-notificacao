import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { SMTPServer } from "smtp-server";
import type { AddressInfo } from "node:net";
import {
  criarTransporte,
  EnviadorEmailSmtp,
} from "../../src/adaptadores/email/enviador-email-smtp.js";

describe("EnviadorEmailSmtp", () => {
  let servidor: SMTPServer;
  let porta: number;
  const recebidos: string[] = [];

  beforeAll(async () => {
    servidor = new SMTPServer({
      authOptional: true,
      hideSTARTTLS: true,
      onData(fluxo, _sessao, callback) {
        let bruto = "";
        fluxo.on("data", (pedaco) => {
          bruto += pedaco.toString();
        });
        fluxo.on("end", () => {
          recebidos.push(bruto);
          callback();
        });
      },
    });

    await new Promise<void>((resolve) => {
      servidor.listen(0, "127.0.0.1", () => resolve());
    });
    porta = (servidor.server.address() as AddressInfo).port;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => servidor.close(() => resolve()));
  });

  it("entrega o e-mail com remetente, destinatário e corpo", async () => {
    const transporte = criarTransporte("127.0.0.1", porta);
    const enviador = new EnviadorEmailSmtp(transporte, "nao-responda@fiapx.local");

    await enviador.enviar({
      para: "dono@email.com",
      assunto: "Falha no processamento do seu vídeo",
      corpo: "O processamento do vídeo video-99 falhou.",
    });
    transporte.close();

    expect(recebidos).toHaveLength(1);
    const bruto = recebidos[0]!;
    expect(bruto).toContain("dono@email.com");
    expect(bruto).toContain("nao-responda@fiapx.local");
    expect(bruto).toContain("video-99");
  });
});
