/**
 * Fila específica para mensagens do chat do Twitch
 * Evita processamento simultâneo de múltiplas mensagens
 */

export interface TwitchChatMessage {
  username: string;
  message: string;
  timestamp: number;
}

class TwitchChatQueue {
  private queue: TwitchChatMessage[] = [];
  private isProcessing = false;
  private processCallback: ((msg: TwitchChatMessage) => void) | null = null;

  /**
   * Adiciona uma mensagem à fila
   */
  addMessage(username: string, message: string): void {
    const chatMessage: TwitchChatMessage = {
      username,
      message,
      timestamp: Date.now()
    };

    this.queue.push(chatMessage);
    console.log(`[TwitchChatQueue] Mensagem adicionada: ${username}: ${message}`);
    console.log(`[TwitchChatQueue] Total na fila: ${this.queue.length}`);
  }

  /**
   * Define o callback para processar mensagens
   */
  setProcessCallback(callback: (msg: TwitchChatMessage) => void): void {
    this.processCallback = callback;
  }

  /**
   * Processa a próxima mensagem da fila
   */
  processNext(): void {
    if (this.isProcessing || this.queue.length === 0 || !this.processCallback) {
      return;
    }

    this.isProcessing = true;
    const message = this.queue.shift();
    
    if (message) {
      console.log(`[TwitchChatQueue] Processando: ${message.username}: ${message.message}`);
      this.processCallback(message);
      
      // Aguarda um tempo antes de processar a próxima mensagem
      // Isso simula aguardar a IA terminar de falar
      setTimeout(() => {
        this.isProcessing = false;
        console.log('[TwitchChatQueue] Mensagem processada, verificando se há mais mensagens...');
        if (this.hasMessages()) {
          console.log('[TwitchChatQueue] Há mais mensagens, processando próxima...');
          this.processNext();
        }
      }, 15000); // Aguarda 15 segundos antes de processar próxima
    } else {
      this.isProcessing = false;
    }
  }

  /**
   * Processa todas as mensagens da fila
   */
  processAll(): void {
    console.log(`[TwitchChatQueue] processAll() chamado. Fila tem ${this.queue.length} mensagens`);
    while (this.queue.length > 0) {
      this.processNext();
    }
    console.log('[TwitchChatQueue] processAll() finalizado');
  }

  /**
   * Limpa a fila
   */
  clear(): void {
    this.queue = [];
    this.isProcessing = false;
    console.log('[TwitchChatQueue] Fila limpa');
  }

  /**
   * Verifica se há mensagens na fila
   */
  hasMessages(): boolean {
    return this.queue.length > 0;
  }

  /**
   * Retorna o número de mensagens na fila
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Força o processamento se a IA estiver idle
   * Este método deve ser chamado externamente para verificar o estado da IA
   */
  forceProcessIfIdle(): void {
    console.log('[TwitchChatQueue] forceProcessIfIdle() chamado');
    // Só processa se não estiver processando e tiver mensagens
    if (this.hasMessages() && this.processCallback && !this.isProcessing) {
      console.log('[TwitchChatQueue] Processando próxima mensagem da fila...');
      this.processNext(); // Processa apenas uma mensagem por vez
    } else if (this.isProcessing) {
      console.log('[TwitchChatQueue] Já está processando uma mensagem, aguardando...');
    }
  }
}

// Instância global da fila
export const twitchChatQueue = new TwitchChatQueue();
