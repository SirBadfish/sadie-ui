// This is a placeholder service that will be expanded
// to connect to n8n properly with WebSockets and API calls

let messageCallback: Function | null = null;

// Mock connection to n8n
export function connectToN8n(url: string, apiKey: string) {
  console.log(`Connecting to n8n at ${url} with key ${apiKey}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Connected to n8n (simulated)');
      resolve(true);
    }, 1000);
  });
}

// Mock sending a message to n8n
export async function sendMessage(message: string, context: Record&lt;string, any&gt; = {}) {
  console.log('Sending message to n8n:', message, context);
  
  // In a real implementation, this would send to n8n and get a response
  return new Promise((resolve) => {
    setTimeout(() => {
      const response = {
        text: `This is a simulated response to: "${message}"`,
        elements: []
      };
      
      if (messageCallback) {
        messageCallback(response);
      }
      
      resolve(response);
    }, 1500);
  });
}

// Register a callback for incoming messages
export function onMessage(callback: Function) {
  messageCallback = callback;
}