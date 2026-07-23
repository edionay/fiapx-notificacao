import type { EnviadorEmail } from "./portas.js";

export interface EntradaNotificacao {
  videoId: unknown;
  emailUsuario: unknown;
  mensagemErro: unknown;
}

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

export class EnviarNotificacao {
  constructor(private readonly enviador: EnviadorEmail) {}

  async executar(entrada: EntradaNotificacao): Promise<boolean> {
    const emailUsuario = texto(entrada.emailUsuario);
    if (emailUsuario === "") {
      return false;
    }

    const videoId = texto(entrada.videoId);
    const mensagemErro = texto(entrada.mensagemErro);
    const detalhe = mensagemErro === "" ? "Motivo não informado." : mensagemErro;

    await this.enviador.enviar({
      para: emailUsuario,
      assunto: "Falha no processamento do seu vídeo",
      corpo:
        `O processamento do vídeo ${videoId} falhou.\n\n` +
        `Motivo: ${detalhe}\n\n` +
        "Envie o vídeo novamente ou entre em contato com o suporte.",
    });

    return true;
  }
}
