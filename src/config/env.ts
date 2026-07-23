function lerPorta(valor: string | undefined, padrao: number): number {
  if (valor === undefined) {
    return padrao;
  }
  const porta = Number(valor);
  if (!Number.isInteger(porta) || porta <= 0 || porta > 65535) {
    throw new Error(`Porta inválida: ${valor}`);
  }
  return porta;
}

export const env = {
  rabbitmqUrl: process.env.RABBITMQ_URL ?? "amqp://guest:guest@localhost:5672",
  smtpHost: process.env.SMTP_HOST ?? "localhost",
  smtpPort: lerPorta(process.env.SMTP_PORT, 1025),
  emailRemetente: process.env.EMAIL_REMETENTE ?? "nao-responda@fiapx.local",
};
