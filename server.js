const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const mockTasks = [
  {
    tarefaId: 1,
    state: "PENDING",
    status: "Identificando Registros",
    progress: 0,
    nome_arquivo: "Arquivo 1",
  },
  {
    tarefaId: 2,
    state: "PENDING",
    status: "Identificando Registros",
    progress: 0,
    nome_arquivo: "Arquivo 2",
  },
  {
    tarefaId: 3,
    state: "PENDING",
    status: "Identificando Registros",
    progress: 0,
    nome_arquivo: "Arquivo 3",
  },
  {
    tarefaId: 4,
    state: "PENDING",
    status: "Identificando Registros",
    progress: 0,
    nome_arquivo: "Arquivo 4 (Vai dar erro)",
    finalState: "FAILURE",
  },
  {
    tarefaId: 5,
    state: "PENDING",
    status: "Identificando Registros",
    progress: 0,
    nome_arquivo: "Arquivo 5 (Parcial)",
    finalState: "PARTIAL_SUCCESS",
  },
];

const updateTaskProgress = () => {
  const pendingTasks = mockTasks.filter((t) => t.progress < 100);

  if (!pendingTasks.length) return null;

  const taskIndex = Math.floor(Math.random() * pendingTasks.length);
  const updatedTask = pendingTasks[taskIndex];

  updatedTask.progress = Math.min(updatedTask.progress + 5, 100);

  if (updatedTask.progress === 100) {

    if (updatedTask.finalState === "FAILURE") {
      updatedTask.state = "FAILURE";
      updatedTask.status = "Falha na Correção";

    } else if (updatedTask.finalState === "PARTIAL_SUCCESS") {
      updatedTask.state = "PARTIAL_SUCCESS";
      updatedTask.status = "Concluído Parcialmente";

    } else {
      updatedTask.state = "SUCCESS";
      updatedTask.status = "Concluído com Sucesso";
    }

  } else {
    updatedTask.state = "PROGRESS";
    updatedTask.status = "Corrigindo Registros";
  }

  return JSON.stringify({
    type: "ATUALIZACAO_TAREFA",
    payload: updatedTask,
  });
};

const sendInitialTasks = () => {
  const message = JSON.stringify({
    type: 'TAREFAS_ASSINCRONAS_LOTE',
    payload: {
      count: mockTasks.length,
      items: mockTasks,
    },
  });

  return message;
};

wss.on("connection", (ws) => {
  console.log("Cliente conectado.");

  ws.send(sendInitialTasks());

  const intervalId = setInterval(() => {
    const message = updateTaskProgress();

    if (message) {
      ws.send(message);
    }
  }, 1000);

  ws.on("close", () => {
    clearInterval(intervalId);
    console.log("Cliente desconectado.");
  });
});

console.log('Servidor WebSocket rodando na porta 8080...');
