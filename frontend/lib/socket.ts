import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private statusListeners: Set<(status: 'connected' | 'disconnected' | 'reconnecting') => void> = new Set();
  // store listeners so they can be attached when socket connects
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const ensureSocket = () => {
        if (!this.socket) {
          this.socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000', {
            transports: ['websocket', 'polling'],
            reconnection: false // we handle reconnection ourselves
          });

          this.socket.on('connect', () => {
            console.log('Connected to server');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.emitStatus('connected');
            // attach queued listeners
            for (const [event, handlers] of Array.from(this.listeners.entries())) {
              for (const h of Array.from(handlers)) {
                this.socket?.on(event, h);
              }
            }
            resolve();
          });

          this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.isConnected = false;
            this.emitStatus('disconnected');
            // start reconnect attempts
            this.scheduleReconnect();
          });

          this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.isConnected = false;
            this.emitStatus('reconnecting');
            // schedule reconnect attempts
            this.scheduleReconnect();
          });
        }

        // If already connected
        if (this.isConnected) {
          return resolve();
        }
      };

      ensureSocket();

      // safety timeout
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('Socket connection timeout'));
        }
      }, 15000);
    });
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const maxAttempts = 8;
    if (this.reconnectAttempts > maxAttempts) {
      console.warn('Max socket reconnect attempts reached');
      return;
    }

    const backoffMs = Math.min(30000, Math.pow(2, this.reconnectAttempts) * 1000);
    this.emitStatus('reconnecting');
    setTimeout(() => {
      try {
        // destroy previous socket and recreate
        if (this.socket) {
          this.socket.removeAllListeners();
          try { this.socket.close(); } catch (_) {}
          this.socket = null;
        }
        this.connect().catch(() => {});
      } catch (err) {
        console.warn('Reconnect attempt failed:', err);
      }
    }, backoffMs);
  }

  onStatus(cb: (status: 'connected' | 'disconnected' | 'reconnecting') => void) {
    this.statusListeners.add(cb);
  }

  offStatus(cb?: (status: 'connected' | 'disconnected' | 'reconnecting') => void) {
    if (!cb) {
      this.statusListeners.clear();
      return;
    }
    this.statusListeners.delete(cb);
  }

  private emitStatus(status: 'connected' | 'disconnected' | 'reconnecting') {
    Array.from(this.statusListeners).forEach((cb) => cb(status));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  on(event: string, callback: (data: any) => void) {
    // keep callback in listeners map
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(callback);

    // attach immediately if socket exists
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string) {
    // remove all listeners for event locally and from socket
    const handlers = this.listeners.get(event);
    if (handlers) {
      if (this.socket) {
        for (const h of Array.from(handlers)) this.socket.off(event, h);
      }
      this.listeners.delete(event);
    } else if (this.socket) {
      // fallback: remove any listener bound to event on socket
      this.socket.off(event);
    }
  }

  emit(event: string, data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }
}

export const socketService = new SocketService();