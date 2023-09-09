from concurrent import futures
import grpc
import time

import msg_pb2 as chat
import msg_pb2_grpc as rpc

class ChatServer(rpc.ChatServerServicer):

    def __init__(self):
        self.hotel_chat_apps = {}  # Dictionary to store hotel chat apps
        self.initial_message_sent = False  # Flag to track if initial message has been sent
        self.message_history = {}  # Dictionary to store message history for each hotel
    
    def ChatStream(self, request_iterator, context):
        # Stream new messages to clients
        while True:
            if not self.initial_message_sent:
                # Send the initial message to the client
                initial_message = chat.ChatMessage(from_user_id="Server", content=f"Connected")
                self.initial_message_sent = True
                yield initial_message

            # Check if there are any new messages
            for hotel_id, messages in self.hotel_chat_apps.items():
                # Check if there are new messages for the hotel
                if messages:
                    # Yield each new message to the client
                    for message in messages:
                        yield message
                        # Store the message in the message history
                        if hotel_id not in self.message_history:
                            self.message_history[hotel_id] = []
                        self.message_history[hotel_id].append(message)
                    # Clear the hotel's message queue after sending
                    self.hotel_chat_apps[hotel_id] = []

    def SendChatMessage(self, request: chat.ChatMessage, context):
        # Check if the hotel ID is provided in the message
        hotel_id = request.hotel_id
        if not hotel_id:
            return chat.Empty()  # Return an empty response or handle the error

        # Check if the hotel chat app exists, and if not, create one
        if hotel_id not in self.hotel_chat_apps:
            self.hotel_chat_apps[hotel_id] = []  # Create a chat app list for the hotel

        # Append the message to the chat app of the specified hotel
        self.hotel_chat_apps[hotel_id].append(request)

        # Store the message in the message history
        if hotel_id not in self.message_history:
            self.message_history[hotel_id] = []
        self.message_history[hotel_id].append(request)

        print(f"Received message for Hotel {hotel_id}: {request.content}")

          # Print the chat messages for debugging
        print(f"Chat Messages for Hotel {hotel_id}:")

        for message in self.message_history[hotel_id]:
            print(f" {message.from_user_id}: {message.content}")

        # print(self.hotel_chat_apps)
        print("message history ",self.message_history)


        return chat.Empty()
   
        # Check if the hotel ID is provided in the message
        hotel_id = request.hotel_id
        if not hotel_id:
            return chat.Empty()  # Return an empty response or handle the error

        # Check if the hotel chat app exists, and if not, create one
        if hotel_id not in self.hotel_chat_apps:
            self.hotel_chat_apps[hotel_id] = []  # Create a chat app list for the hotel

        # Append the message to the chat app of the specified hotel
        self.hotel_chat_apps[hotel_id].append(request)

        # Store the message in the message history
        if hotel_id not in self.message_history:
            self.message_history[hotel_id] = []
        self.message_history[hotel_id].append(request)

        print(f"Received message for Hotel {hotel_id}: {request.content}")

        # Print the chat messages for debugging
        print(f"Chat Messages for Hotel {hotel_id}:")

        for message in self.message_history[hotel_id]:
            print(f" {message.from_user_id}: {message.content}")

    
    


if __name__ == '__main__':
    port = 11912  # a random port for the server to run on
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    rpc.add_ChatServerServicer_to_server(ChatServer(), server)
    print('Starting server. Msg.proto file being used. Listening...')
    server.add_insecure_port('[::]:' + str(port))
    server.start()
    while True:
        time.sleep(64 * 64 * 100)