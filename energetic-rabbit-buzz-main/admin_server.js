// Simple admin server for handling custom request chat notifications
// This server can be extended to handle real-time notifications

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Change this to your frontend URL in production
    methods: ["GET", "POST"]
  }
});

// Initialize Supabase client
const SUPABASE_URL = process.env.SUPABASE_URL || "https://tdhbuutpolmwxjgzqxtp.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "YOUR_SERVICE_KEY_HERE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Store connected clients
const connectedClients = new Map();

io.on('connection', (socket) => {
  console.log('Admin client connected:', socket.id);
  
  // Handle admin authentication
  socket.on('admin-auth', (adminId) => {
    connectedClients.set(socket.id, { type: 'admin', id: adminId });
    console.log('Admin authenticated:', adminId);
  });
  
  // Handle user authentication
  socket.on('user-auth', (userId) => {
    connectedClients.set(socket.id, { type: 'user', id: userId });
    console.log('User authenticated:', userId);
  });
  
  // Handle new message
  socket.on('new-message', async (data) => {
    const { customRequestId, senderId, message } = data;
    
    // Save message to database
    const { data: insertedMessage, error } = await supabase
      .from('custom_request_messages')
      .insert({
        custom_request_id: customRequestId,
        sender_id: senderId,
        message: message
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error saving message:', error);
      return;
    }
    
    // Broadcast message to relevant clients
    // In a real implementation, you would check which clients should receive this message
    io.emit('message-received', {
      customRequestId,
      message: insertedMessage
    });
    
    console.log('Message saved and broadcasted:', insertedMessage);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    connectedClients.delete(socket.id);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Admin server running on port ${PORT}`);
});