import { loadTwitchToken } from '@/utils/token-loader';
import { twitchChatQueue } from '@/utils/twitch-chat-queue';

export class TwitchChat {
  private ws: WebSocket | null = null;
  private isConnected = false;

  constructor() {
    // No parameters needed
  }

  async connect(): Promise<void> {
    try {
      // Load token from the pkl file
      const token = await loadTwitchToken();
      if (!token) {
        throw new Error('Token não encontrado');
      }

      // Connect to Twitch IRC
      this.ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
      
      this.ws.onopen = () => {
        console.log('Conectado ao chat da Twitch');
        this.isConnected = true;
        
        // Authenticate
        this.sendCommand(`PASS oauth:${token}`);
        this.sendCommand(`NICK nthnunes`);
        this.sendCommand(`JOIN #nthnunes`);
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = () => {
        console.log('Desconectado do chat da Twitch');
        this.isConnected = false;
      };

      this.ws.onerror = (error) => {
        console.error('Erro no chat da Twitch:', error);
        this.isConnected = false;
      };

    } catch (error) {
      console.error('Falha ao conectar no chat da Twitch:', error);
    }
  }

  private sendCommand(command: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(command);
    }
  }

  private handleMessage(data: string): void {
    const lines = data.split('\r\n').filter(line => line.trim());
    
    for (const line of lines) {
      if (line.startsWith('PING')) {
        this.sendCommand('PONG :tmi.twitch.tv');
        continue;
      }

      if (line.includes('PRIVMSG')) {
        this.parseChatMessage(line);
      }
    }
  }

  private parseChatMessage(line: string): void {
    try {
      // Parse: :username!username@username.tmi.twitch.tv PRIVMSG #nthnunes :message
      const match = line.match(/^:(\w+)!\w+@\w+\.tmi\.twitch\.tv PRIVMSG #nthnunes :(.+)$/);
      
      if (match) {
        const [, username, message] = match;
        
        console.log(`[Twitch] ${username}: ${message}`);
        
        // Add message to Twitch chat queue
        console.log('[Twitch] Adicionando mensagem à fila...');
        twitchChatQueue.addMessage(username, message);
        console.log(`[Twitch] Mensagem adicionada à fila. Total na fila: ${twitchChatQueue.getQueueLength()}`);
        
        // Force process if AI is idle (since useEffect only runs on state change)
        console.log('[Twitch] Verificando se deve processar fila imediatamente...');
        twitchChatQueue.forceProcessIfIdle();
      }
    } catch (error) {
      console.error('Erro ao processar mensagem do chat:', error);
    }
  }



  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  getConnected(): boolean {
    return this.isConnected;
  }
}
