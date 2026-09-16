from dotenv import load_dotenv
load_dotenv()

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
# This is the correct import
from livekit.plugins import google, noise_cancellation
from livekit.agents import llm
from prompt import AGENT_INSTRUCTION, AGENT_RESPONSE
from memory import save_memory, get_memories, search_similar_memories
import json

load_dotenv(".env.local")

class AssistantContext(llm.FunctionContext):
    def __init__(self, room):
        super().__init__()
        self.room = room
    
    @llm.ai_callable(description="Change the UI core color to visually respond to the user.")
    async def change_ui_color(self, color: str):
        """Change the visual color theme of the frontend. Supported colors: cyan, blue, violet, magenta, pink, red, green, yellow, orange."""
        print(f"[TOOL] Changing UI color to {color}")
        data = json.dumps({"type": "change_color", "color": color}).encode("utf-8")
        if self.room and self.room.local_participant:
            await self.room.local_participant.publish_data(data, reliable=True)
            # Send tool call visualization
            tool_data = json.dumps({"type": "tool_call", "tool": "change_ui_color", "args": {"color": color}}).encode("utf-8")
            await self.room.local_participant.publish_data(tool_data, reliable=True)
        return f"UI color changed to {color}"
        
    @llm.ai_callable(description="Save an important fact or preference about the user into long-term memory.")
    async def save_user_preference(self, fact: str):
        """Save a memory fact about the user."""
        print(f"[TOOL] Saving memory: {fact}")
        save_memory("default_user", fact)
        if self.room and self.room.local_participant:
            tool_data = json.dumps({"type": "tool_call", "tool": "save_user_preference", "args": {"fact": fact}}).encode("utf-8")
            await self.room.local_participant.publish_data(tool_data, reliable=True)
        return "Memory saved successfully."

    @llm.ai_callable(description="Search the user's long-term memory for past facts, preferences, or context based on a topic.")
    async def search_memory(self, topic: str):
        """Search memory for relevant facts."""
        print(f"[TOOL] Searching memory for: {topic}")
        if self.room and self.room.local_participant:
            tool_data = json.dumps({"type": "tool_call", "tool": "search_memory", "args": {"topic": topic}}).encode("utf-8")
            await self.room.local_participant.publish_data(tool_data, reliable=True)
            
        results = search_similar_memories("default_user", topic)
        return f"Memory search results for '{topic}':\n{results}"

class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions="You are a helpful voice AI assistant.")


async def entrypoint(ctx: agents.JobContext):
    memories = get_memories("default_user", limit=5)
    memory_context = f"\n\nHere are some past memories about the user:\n{memories}" if memories else ""
    
    fnc_ctx = AssistantContext(ctx.room)
    
    session = AgentSession(
    llm=google.beta.realtime.RealtimeModel(
        model="gemini-2.0-flash-exp",
        voice="Puck",
        temperature=0.8,
        instructions=AGENT_INSTRUCTION + memory_context,
        ),
        fnc_ctx=fnc_ctx
    )

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_input_options=RoomInputOptions(
            # For telephony applications, use `BVCTelephony` instead for best results
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    await session.generate_reply(
        instructions=AGENT_RESPONSE
    )


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
    