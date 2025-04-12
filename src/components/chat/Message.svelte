<script>
  export let message = '';
  export let sender = 'ai'; // 'user' or 'ai'
  export let timestamp = new Date();
</script>

<div class="message {sender === 'user' ? 'message-user' : 'message-ai'}">
  <div class="message-content">
    {#if sender === 'ai'}
      <div class="avatar">S</div>
    {/if}
    <div class="text">
      <div class="message-text">{message}</div>
      <div class="timestamp">{timestamp.toLocaleTimeString()}</div>
    </div>
  </div>
</div>

<style>
  .message {
    margin-bottom: 1rem;
    padding: 0.5rem;
  }
  
  .message-content {
    display: flex;
    align-items: flex-start;
  }
  
  .message-user {
    justify-content: flex-end;
  }
  
  .message-ai {
    justify-content: flex-start;
  }
  
  .avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: #3B82F6;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 0.5rem;
  }
  
  .text {
    background-color: #f3f4f6;
    padding: 0.75rem;
    border-radius: 0.5rem;
    max-width: 80%;
  }
  
  .message-user .text {
    background-color: #dbeafe;
  }
  
  .timestamp {
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.25rem;
    text-align: right;
  }
</style>