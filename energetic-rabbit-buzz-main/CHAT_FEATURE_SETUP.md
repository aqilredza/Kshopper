# Custom Request Chat Feature

This feature allows admins and users to communicate directly about custom requests through a real-time chat interface.

## Features Implemented

1. **Admin Chat Interface**:
   - Added chat functionality to the Admin Custom Requests page
   - Admins can communicate directly with users about specific requests
   - Real-time messaging with message history

2. **User Chat Interface**:
   - Added chat functionality to the User Account page (Custom Requests tab)
   - Users can communicate with admins about their requests
   - Real-time messaging with message history

3. **Request Detail Page**:
   - Added chat button to the Custom Request Detail page
   - Users can chat about specific requests from the detail view

4. **Database Structure**:
   - Created `custom_request_messages` table for storing messages
   - Added SQL scripts for table creation and RLS policies

5. **Admin Server**:
   - Created a simple admin server with Socket.IO for real-time notifications
   - Handles message broadcasting between users and admins

## Setup Instructions

### 1. Database Setup

Run the SQL scripts in your Supabase dashboard:
- `create_chat_table.sql` - Creates the messages table and RLS policies
- `create_message_function.sql` - Creates a function for fetching messages with sender profiles

### 2. Environment Variables

Set the following environment variables:
- `SUPABASE_SERVICE_KEY` - Your Supabase service key for the admin server

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
npm run dev
```

### 5. Run the Admin Server

```bash
npm run admin-server
```

## How to Use

### For Admins
1. Navigate to the Admin Dashboard
2. Go to "Custom Requests" section
3. Click the "Chat" button next to any request
4. Send and receive messages with users

### For Users
1. Navigate to "My Account"
2. Go to the "Custom Requests" tab
3. Click the "Chat" button next to any request
4. Send and receive messages with admins

### From Request Detail Page
1. Navigate to a specific custom request detail page
2. Click the "Chat with Admin" button in the sidebar
3. Send and receive messages about that specific request

## Security

- Users can only see messages for their own requests
- Admins can see messages for all requests
- All messages are stored securely in the database
- Row Level Security (RLS) policies ensure data isolation

## Future Improvements

- Add real-time notifications using Socket.IO
- Implement message read status
- Add file/image sharing in chat
- Implement chat search functionality
- Add chat history export feature