import { describe, it, expect } from "vitest";
import { EnviarNotificacao } from "../../src/aplicacao/enviar-notificacao.js";
import type { Email, EnviadorEmail } from "../../src/aplicacao/portas.js";

class EnviadorFake implements EnviadorEmail {
  public readonly enviados: Email[] = [];
  async enviar(email: Email): Promise<void> {
    this.enviados.push(email);
  }
}

describe("EnviarNotificacao", () => {
  it("envia um e-mail com o vídeo e o motivo da falha", async () => {
    const enviador = new EnviadorFake();
    const enviada = await new EnviarNotificacao(enviador).executar({
      videoId: "video-1",
      emailUsuario: "dono@email.com",
      mensagemErro: "falha no ffmpeg",
    });

    expect(enviada).toBe(true);
    expect(enviador.enviados).toHaveLength(1);
    const email = enviador.enviados[0]!;
    expect(email.para).toBe("dono@email.com");
    expect(email.assunto).toBe("Falha no processamento do seu vídeo");
    expect(email.corpo).toContain("video-1");
    expect(email.corpo).toContain("falha no ffmpeg");
  });

  it("não envia quando o e-mail do usuário está ausente", async () => {
    const enviador = new EnviadorFake();
    const enviada = await new EnviarNotificacao(enviador).executar({
      videoId: "video-1",
      emailUsuario: "  ",
      mensagemErro: "falha no ffmpeg",
    });

    expect(enviada).toBe(false);
    expect(enviador.enviados).toHaveLength(0);
  });

  it("usa um motivo padrão quando a mensagem de erro está vazia", async () => {
    const enviador = new EnviadorFake();
    await new EnviarNotificacao(enviador).executar({
      videoId: "video-1",
      emailUsuario: "dono@email.com",
      mensagemErro: "",
    });

    expect(enviador.enviados[0]!.corpo).toContain("Motivo não informado.");
  });
});
