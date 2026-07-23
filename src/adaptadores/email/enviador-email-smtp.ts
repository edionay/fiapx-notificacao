import nodemailer, { type Transporter } from "nodemailer";
import type { Email, EnviadorEmail } from "../../aplicacao/portas.js";

export function criarTransporte(host: string, porta: number): Transporter {
  return nodemailer.createTransport({
    host,
    port: porta,
    secure: false,
  });
}

export class EnviadorEmailSmtp implements EnviadorEmail {
  constructor(
    private readonly transporte: Transporter,
    private readonly remetente: string,
  ) {}

  async enviar(email: Email): Promise<void> {
    await this.transporte.sendMail({
      from: this.remetente,
      to: email.para,
      subject: email.assunto,
      text: email.corpo,
    });
  }
}
