export class WebSocketService {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout = 1000; // Start with 1 second

    constructor(private url: string) {}

    connect() {
        try {
            this.ws = new WebSocket(this.url);

            this.ws.onopen = () => {
                console.log('WebSocket Connected');
                this.reconnectAttempts = 0;
                this.reconnectTimeout = 1000;
            };

            this.ws.onclose = () => {
                console.log('WebSocket Disconnected');
                this.attemptReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket Error:', error);
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
        } catch (error) {
            console.error('Error creating WebSocket connection:', error);
            this.attemptReconnect();
        }
    }

    private attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
                console.log(`Attempting to reconnect... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
                this.reconnectAttempts++;
                this.reconnectTimeout *= 2; // Exponential backoff
                this.connect();
            }, this.reconnectTimeout);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    private handleMessage(data: any) {
        // Handle different types of messages
        switch (data.type) {
            case 'chat_message':
                this.handleChatMessage(data);
                break;
            case 'notification':
                this.handleNotification(data);
                break;
            default:
                console.log('Received message:', data);
        }
    }

    private handleChatMessage(data: any) {
        // Emit event for chat messages
        const event = new CustomEvent('chat_message', { detail: data });
        window.dispatchEvent(event);
    }

    private handleNotification(data: any) {
        // Emit event for notifications
        const event = new CustomEvent('notification', { detail: data });
        window.dispatchEvent(event);
    }

    send(data: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.error('WebSocket is not connected');
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

// Create and export a singleton instance
export const wsService = new WebSocketService(import.meta.env.VITE_WS_URL);
