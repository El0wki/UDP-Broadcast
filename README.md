# Protocolo de Descoberta de Serviço com UDP Broadcast

Este projeto é uma implementação simples de um protocolo de descoberta de serviços em uma rede local utilizando UDP broadcast, desenvolvido em Node.js como parte da disciplina de Redes de Computadores.

O sistema é composto por dois programas:

- `server.js`: Representa um serviço que deseja ser descoberto na rede. Ele escuta por um pedido de descoberta e responde com suas informações.
- `client.js`: Representa uma aplicação que busca por serviços na rede. Ele envia uma única mensagem de broadcast e coleta as respostas dos servidores.

## Requisitos

- Node.js

## Como Executar

Não são necessárias dependências externas. Basta ter o Node.js instalado.

### 1. Executando o Servidor

Abra um terminal e execute o `server.js`. Você pode especificar a porta UDP em que ele vai escutar e uma lista de serviços que ele deve anunciar no formato `NomeServico:PortaTCP`.

**Sintaxe:**

```sh
node server.js [porta_udp] [servico1:porta_tcp] [servico2:porta_tcp] ...
```

**Exemplos:**

- Para iniciar um servidor na porta padrão `12345` anunciando um serviço padrão:

  ```sh
  node server.js
  ```

- Para iniciar um servidor na porta `5000` anunciando um serviço de jogo e uma API:
  ```sh
  node server.js 5000 ServidorJogo:9999 ApiDados:8080
  ```

O servidor ficará ativo, aguardando por pedidos de descoberta.

### 2. Executando o Cliente

Abra **outro** terminal e execute o `client.js`. Você deve especificar a mesma porta UDP que o servidor está usando.

**Sintaxe:**

```sh
node client.js [porta_udp]
```

**Exemplo:**

- Para descobrir serviços na porta `12345`:
  ```sh
  node client.js 12345
  ```

O cliente enviará uma mensagem de broadcast e aguardará por 5 segundos, exibindo todos os servidores que responderam nesse intervalo.

## Protocolo de Aplicação

O projeto utiliza um protocolo de texto simples para a comunicação.

#### Mensagem do Cliente para o Servidor (UDP Broadcast)

O cliente envia uma string única para identificar a requisição.

```
DISCOVER_SERVICE_REQUEST
```

#### Mensagem do Servidor para o Cliente (UDP Unicast)

O servidor responde diretamente ao cliente com uma mensagem estruturada, separada por ponto e vírgula.

```
DISCOVER_SERVICE_RESPONSE;<NomeDoServidor>;<PortaDoServicoTCP>;<IPDoServidor>
```

**Exemplo de resposta:**

```
DISCOVER_SERVICE_RESPONSE;ServidorJogo;9999;192.168.1.10
```
