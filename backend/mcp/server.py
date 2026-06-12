"""MCP Server — tool registry and execution."""
from typing import Dict, Callable, Any


class MCPServer:
    def __init__(self):
        self.tools: Dict[str, Callable] = {}

    def register_tool(self, name: str, func: Callable):
        self.tools[name] = func

    async def call_tool(self, name: str, args: Dict[str, Any]) -> Any:
        if name not in self.tools:
            return {"error": f"Tool {name} not found"}
        func = self.tools[name]
        if asyncio.iscoroutinefunction(func):
            return await func(args)
        return func(args)
