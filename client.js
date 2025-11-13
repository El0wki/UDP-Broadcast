const dgram = require("dgram");

const PORTA_UDP = parseInt(process.argv[2], 10) || 12345;
const VALID_CLIENT_REQUEST = "DISCOVER_SERVICE_REQUEST";
const TIMEOUT_MS = 5000; //Tempo em ms

const client = dgram.createSocket("udp4");
const bufferMensagem = Buffer.from(VALID_CLIENT_REQUEST);
const ENDERECO_BROADCAST = "255.255.255.255";

let servidoresEncontrados = [];
let timeoutId = null;

function fecharCliente() {
  console.log("\n--- Fim da Descoberta (Timeout) ---");
  if (servidoresEncontrados.length === 0) {
    console.log("Nenhum servidor respondeu.");
  } else {
    console.log(`Encontrados ${servidoresEncontrados.length} servidor(es):`);
    servidoresEncontrados.forEach((s) => console.log(s));

    console.log("-----------------------------------");
  }
  client.close();
}

timeoutId = setTimeout(fecharCliente, TIMEOUT_MS); //Fecha conexão após 5 segundos
client.bind(0, () => {
  //bind pro broadcast funcionar
  try {
    client.setBroadcast(true);
  } catch (err) {
    console.log("Erro ao ativar broadcast:", err);
  }
  //Envio da mensagem
  client.send(bufferMensagem, PORTA_UDP, ENDERECO_BROADCAST, (err) => {
    if (err) {
      console.log(`Erro ao enviar mensagem: ${err}`);
      client.close();
    } else {
      console.log(
        `⬆️  Enviando broadcast de descoberta: "${VALID_CLIENT_REQUEST}"`
      );
      console.log(`Aguardando respostas por ${TIMEOUT_MS / 1000} segundos...`);
    }
  });
});

client.on("message", (msg, rinfo) => {
  //Resposta recebida do servidor
  const resposta = msg.toString();

  console.log(`\n+ Resposta recebida de ${rinfo.address}`);

  const partes = resposta.split(";");

  if (partes[0] === "DISCOVER_SERVICE_RESPONSE" && partes.length === 4) {
    const infoServidor = {
      nome: partes[1],
      portaTcp: partes[2],
      ip: rinfo.address,
    };
    console.log(`  Nome: ${infoServidor.nome}`);
    console.log(`  Serviço em: ${infoServidor.ip}:${infoServidor.portaTcp}`);
    servidoresEncontrados.push(infoServidor);
  } else {
    console.log(`  Resposta mal formatada: "${resposta}"`);
  }
});

client.on("close", () => {
  console.log("Cliente fechado.");
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
});
