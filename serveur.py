# server.py
import socket

server = socket.socket()
server.bind(("0.0.0.0", 5000))   # Listen on all interfaces
server.listen(1)
print("Server waiting for connection...")
conn, addr = server.accept()
print(f"Connected by {addr}")
msg = conn.recv(1024).decode()
print("Message:", msg)
conn.close()
