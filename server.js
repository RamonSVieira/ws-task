const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 }); // O servidor WebSocket irá escutar na porta 8080

// Mock de dados de tarefas
const mockTasks = [
  {
    tarefaId: 1,
    state: 'PENDING',
    status: 'Iniciado',
    progress: 10,
    nome_arquivo: 'Arquivo 1',
  },
  {
    tarefaId: 2,
    state: 'PROGRESS',
    status: 'Processando',
    progress: 50,
    nome_arquivo: 'Arquivo 2',
  },
  {
    tarefaId: 3,
    state: 'SUCCESS',
    status: 'Concluído',
    progress: 100,
    nome_arquivo: 'Arquivo 3',
  },
];

// Simula atualizações de tarefas
const updateTaskProgress = () => {
  const taskIndex = Math.floor(Math.random() * mockTasks.length);
  const updatedTask = mockTasks[taskIndex];
  
  // Atualiza o progresso das tarefas
  updatedTask.progress = updatedTask.progress + 10 > 100 ? 100 : updatedTask.progress + 10;

  const message = JSON.stringify({
    type: 'ATUALIZACAO_TAREFA',
    payload: updatedTask,
  });

  return message;
};

// Envia dados de tarefas em lotes a cada 5 segundos
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

// Inicia a conexão WebSocket
wss.on('connection', (ws) => {
  console.log('Cliente conectado.');

  // Envia as tarefas iniciais
  ws.send(sendInitialTasks());

  // Envia atualizações a cada 3 segundos
  const intervalId = setInterval(() => {
    ws.send(updateTaskProgress());
  }, 3000);

  // Fecha a conexão após 30 segundos (simulando tempo de execução)
  setTimeout(() => {
    clearInterval(intervalId);
    ws.close();
  }, 30000);

  // Quando o cliente desconectar
  ws.on('close', () => {
    console.log('Cliente desconectado.');
  });
});

console.log('Servidor WebSocket rodando na porta 8080...');
