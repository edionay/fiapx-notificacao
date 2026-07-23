import { describe, it, expect, afterAll } from "vitest";
import type { AddressInfo } from "node:net";
import { iniciarServidorMetricas } from "../../src/adaptadores/metricas/servidor-metricas.js";
import { notificacoesProcessadas } from "../../src/adaptadores/metricas/metricas.js";

const servidor = iniciarServidorMetricas(0);

function url(caminho: string): string {
  const endereco = servidor.address() as AddressInfo;
  return `http://127.0.0.1:${endereco.port}${caminho}`;
}

describe("servidor de métricas", () => {
  afterAll(() => {
    servidor.close();
  });

  it("expõe as métricas no formato do Prometheus em /metrics", async () => {
    notificacoesProcessadas.inc({ resultado: "enviada" });

    const resposta = await fetch(url("/metrics"));
    const corpo = await resposta.text();

    expect(resposta.status).toBe(200);
    expect(resposta.headers.get("content-type")).toContain("text/plain");
    expect(corpo).toContain('service="fiapx-notificacao"');
    expect(corpo).toContain("process_cpu_user_seconds_total");
    expect(corpo).toMatch(/notificacoes_processadas_total\{[^}]*resultado="enviada"[^}]*\}/);
  });

  it("responde 404 em outras rotas", async () => {
    const resposta = await fetch(url("/outra"));
    await resposta.text();
    expect(resposta.status).toBe(404);
  });
});
