import { collectDefaultMetrics, Counter, Registry } from "prom-client";

export const registro = new Registry();
registro.setDefaultLabels({ service: "fiapx-notificacao" });
collectDefaultMetrics({ register: registro });

export const notificacoesProcessadas = new Counter({
  name: "notificacoes_processadas_total",
  help: "Total de notificações processadas por resultado",
  labelNames: ["resultado"],
  registers: [registro],
});
