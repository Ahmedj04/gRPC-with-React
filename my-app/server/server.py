from concurrent import futures

import grpc
import time

import chat_pb2 as chat
import chat_pb2_grpc as rpc


class ChatServer(rpc.ChatServerServicer):  # inheriting here from the protobuf rpc file which is generated

    def __init__(self):
        # List with all the chat history
        self.chats = []
        self.initial_message_sent = False  # Flag to track if initial message has been sent


    # The stream which will be used to send new messages to clients
    def ChatStream(self, request_iterator, context):
        """
        This is a response-stream type call. This means the server can keep sending messages
        Every client opens this connection and waits for server to send new messages

        :param request_iterator:
        :param context:
        :return:
        """
        lastindex = 0
        
        if not self.initial_message_sent:
            # Send the initial message to the client
            initial_message = chat.Note(name="Server", message=f"Connected")
            self.initial_message_sent = True

            yield initial_message

        # For every client a infinite loop starts (in gRPC's own managed thread)
        # This loop continuously checks for new messages in the chats list and
        # sends any new messages to the connected clients.
        while True:
            # Check if there are any new messages
            while len(self.chats) > lastindex:
                n = self.chats[lastindex]
                lastindex += 1
                yield n
    
    # def SendNote(self, request: chat.Note, context):
        print("[{}] {}".format(request.name, request.message))
        
        client_message = request.message  # Get the client's message
        
        response_message = f"Hi, {request.name}! You said: {client_message}"
        response_note = chat.Note(name="Server", message=response_message)  # Create a Note message
        self.chats.append(request)  # Add the client's message to the chat history
        self.chats.append(response_note)  # Add the response to the chat history
        
        return response_note  # Respond with the combined message
    
    # This method handles incoming messages from clients.
    # It processes the client's message, prepares a response, adds both the client's message and the response to the chat history, and returns the response.
   
    def SendNote(self, request: chat.Note, context):
        client_message = request.message.lower()  # Get the client's message in lowercase

        print(client_message)
        
        if "hi" == client_message:
            response_message = f"Hello, {request.name}!"
        elif "how is the weather" == client_message:
            response_message = "The weather is good!"
        else:
            response_message = "I'm sorry, I don't understand."
        
        response_note = chat.Note(name="Server", message=response_message)  # Create a Note message
        self.chats.append(request)  # Add the client's message to the chat history
        self.chats.append(response_note)  # Add the response to the chat history

         # Save the updated chat history to the file
        self.save_chats_to_file()
        
        return response_note  # Respond with the appropriate message

    def save_chats_to_file(self):
        with open("chat_history.txt", "w") as f:
            
            if self.initial_message_sent:
                # Save the initial message to the file
                f.write(f"[Server] Connected\n")
            
            print(self.chats)
            
            for chat_note in self.chats:
                f.write(f"[{chat_note.name}] {chat_note.message}\n")


if __name__ == '__main__':
    port = 11912  # a random port for the server to run on

    # the workers is like the amount of threads that can be opened at the same time, when there are 10 clients connected
    # then no more clients able to connect to the server.
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))  # create a gRPC server
    rpc.add_ChatServerServicer_to_server(ChatServer(), server)  # register the server to gRPC
    # gRPC basically manages all the threading and server responding logic, which is perfect!
    print('Starting server. Listening at port 11912...')
    server.add_insecure_port('[::]:' + str(port))
    server.start()
    # Server starts in background (in another thread) so keep waiting
    # if we don't wait here the ma  in thread will end, which will end all the child threads, and thus the threads
    # from the server won't continue to work and stop the server
    while True:
        time.sleep(64 * 64 * 100)