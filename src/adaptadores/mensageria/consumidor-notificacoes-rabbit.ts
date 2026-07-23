import type { Channel } from "amqplib";
import type { EnviarNotificacao } from "../../aplicacao/enviar-notificacao.js";

export const FILA_NOTIFICACOES = "notificacoes";

export async function iniciarConsumoNotificacoes(
  canal: Channel,
  enviar: EnviarNotificacao,
  fila: string = FILA_NOTIFICACOES,
): Promise<void> {
  await canal.consume(fila, async (mensagem) => {
    if (mensagem === null) {
      return;
    }

    try {
      const conteudo = JSON.parse(mensagem.content.toString());
      const enviada = await enviar.executar(conteudo);
      if (!enviada) {
        console.warn("Notificação ignorada: destinatário ausente", conteudo);
      }
    } catch (erro) {
      console.error("Falha ao processar notificação", erro);
    } finally {
      canal.ack(mensagem);
    }
  });
}
