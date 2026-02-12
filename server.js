const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const mockTasks = [
  {
    tarefaId: 1,
    state: "PENDING",
    status: "Identificando registros",
    progress: 0,
    nome_arquivo: "Arquivo 1",
  },
  {
    tarefaId: 2,
    state: "PENDING",
    status: "Identificando registros",
    progress: 0,
    nome_arquivo: "Arquivo 2",
  },
  {
    tarefaId: 3,
    state: "PENDING",
    status: "Identificando registros",
    progress: 0,
    nome_arquivo: "Arquivo 3",
  },
];

const updateTaskProgress = () => {
  const pendingTasks = mockTasks.filter((t) => t.progress < 100);

  if (!pendingTasks.length) return null;

  const taskIndex = Math.floor(Math.random() * pendingTasks.length);
  const updatedTask = pendingTasks[taskIndex];

  updatedTask.progress = Math.min(updatedTask.progress + 1, 100);

  if (updatedTask.progress === 100) {
    updatedTask.state = "SUCCESS";
    updatedTask.status = "Concluído";
  } else {
    updatedTask.state = "PROGRESS";
    updatedTask.status = "Processando";
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
