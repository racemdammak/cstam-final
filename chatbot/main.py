from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import websockets
import asyncio
from contextlib import asynccontextmanager

AGENT_WS_URL = "ws://localhost:8765"  # Connection to your AI Agent
agent_ws = None  # Global persistent connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manages startup and shutdown events.
    Establishes a persistent connection with the AI agent.
    """
    global agent_ws
    print("🔗 Connecting to Agent WebSocket...")

    try:
        agent_ws = await websockets.connect(
            AGENT_WS_URL,
            ping_interval=3600,
            ping_timeout=3600
        )
        print("✅ Connected to Agent WebSocket")
    except Exception as e:
        print(f"❌ Failed to connect to Agent: {e}")
        agent_ws = None

    yield

    if agent_ws:
        await agent_ws.close()
        print("🔌 Agent connection closed")


app = FastAPI(lifespan=lifespan)

# ✅ Allow your React frontend to access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "FastAPI Chat Server is running ✅"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Bridge between frontend WebSocket and AI Agent WebSocket.
    """
    global agent_ws
    print("🔌 New WebSocket connection from client...")
    await websocket.accept()

    if not agent_ws:
        await websocket.send_text("❌ Agent is not connected. Please try again later.")
        await websocket.close()
        return

    try:
        while True:
            # Receive message from frontend
            user_message = await websocket.receive_text()
            print(f"👤 Client says: {user_message}")

            # Forward message to AI Agent
            await agent_ws.send(user_message)

            # Wait for agent's reply
            ai_reply = await agent_ws.recv()
            print(f"🤖 Agent replies: {ai_reply}")

            # Send AI reply back to frontend
            await websocket.send_text(ai_reply)

    except WebSocketDisconnect:
        print("❌ Client disconnected.")
    except Exception as e:
        print(f"⚠️ Error: {e}")
        await websocket.send_text(f"Error: {str(e)}")
