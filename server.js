const dgram = require("dgram");
const os = require("os");

const VALID_CLIENT_REQUEST = "DISCOVER_SERVICE_REQUEST";
const VALID_SERVER_RESPONDE = "DISCOVER_SERVICE_RESPONSE";

const PORTA_UDP = parseInt(process.argv[2], 10) || 12345;

const validatedServices = () => {
  const initialServiceArgs = process.argv.slice(3);
  const validatedServices = [];
  const tcpPorts = new Set();

  for (const serviceArg of initialServiceArgs) {
    const partes = serviceArg.split(":");
    const nomeServico = partes[0];
    const portaTcp = parseInt(partes[1], 10);

    //Validação da porta
    if (
      partes.length !== 2 ||
      !nomeServico ||
      isNaN(portaTcp) ||
      portaTcp <= 0 ||
      portaTcp > 65535
    ) {
      console.warn(
        `[AVISO] Argumento de serviço ignorado (formato ou porta inválida): "${serviceArg}"`
      );
      continue;
    }

    //Valida se a porta TCP já foi usada
    if (tcpPorts.has(portaTcp)) {
      console.warn(
        `[AVISO] Porta TCP duplicada ignorada: ${portaTcp} (do serviço "${serviceArg}")`
      );
      continue;
    }

    tcpPorts.add(portaTcp);
    validatedServices.push(serviceArg);
  }

  if (validatedServices.length === 0) {
    validatedServices.push("Servidor_Default:12346");
  }
  return validatedServices;
};
const SERVICE_ARGS = validatedServices();

const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      // Pula endereços que não são IPv4 e endereços internos (ex: 127.0.0.1)
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "127.0.0.1"; // Retorna um fallback caso nenhum IP externo seja encontrado
};

const server = dgram.createSocket("udp4");

server.on("error", (err) => {
  console.log(`Erro no servidor:\n${err.stack}`);
  server.close();
});

server.on("message", (msg, rinfo) => {
  const mensagemRecebida = msg.toString();

  if (mensagemRecebida === VALID_CLIENT_REQUEST) {
    console.log(
      `\n--- Mensagem Recebida de ${rinfo.address}:${rinfo.port} ---`
    );
    console.log(`Recebido: "${mensagemRecebida}" (VÁLIDO!)`);

    for (const serviceArg of SERVICE_ARGS) {
      const partes = serviceArg.split(":");
      const nomeServico = partes[0];
      const portaTcpServico = partes[1];

      const ipServico = getLocalIp();

      const respostaString = `${VALID_SERVER_RESPONDE};${nomeServico};${portaTcpServico};${ipServico}`;
      const resposta = Buffer.from(respostaString);

      console.log(`Enviando resposta: "${respostaString}"`);

      server.send(resposta, rinfo.port, rinfo.address, (err) => {
        if (err) {
          console.log(`Erro ao enviar resposta: ${err}`);
        }
      });
    }
  } else {
    console.log(`Recebido: "${mensagemRecebida}" (IGNORADO)`);
  }
});

server.on("listening", () => {
  const address = server.address();
  console.log(
    `✅ Servidor de Descoberta "ouvindo" em ${address.address}:${PORTA_UDP}`
  );
  if (SERVICE_ARGS.length > 0) {
    console.log("   Anunciando os seguintes serviços válidos:");
    SERVICE_ARGS.forEach((s) => console.log(`   - ${s}`));
  } else {
    console.log("   Nenhum serviço válido para anunciar.");
  }
});

server.bind(PORTA_UDP);
