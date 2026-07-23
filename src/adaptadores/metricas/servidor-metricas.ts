import { createServer, type Server } from "node:http";
import { registro } from "./metricas.js";

export function iniciarServidorMetricas(porta: number): Server {
  const servidor = createServer((req, res) => {
    if (req.url === "/metrics") {
      registro
        .metrics()
        .then((corpo) => {
          res.setHeader("Content-Type", registro.contentType);
          res.end(corpo);
        })
        .catch(() => {
          res.statusCode = 500;
          res.end();
        });
      return;
    }
    res.statusCode = 404;
    res.end();
  });

  servidor.listen(porta, () => {
    const endereco = servidor.address();
    const emUso = typeof endereco === "object" && endereco !== null ? endereco.port : porta;
    console.log(`métricas disponíveis na porta ${emUso}`);
  });

  return servidor;
}
