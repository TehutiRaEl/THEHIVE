"""MCP Tools — safe implementations (no eval)."""
import ast
import operator
from typing import Dict


async def web_search_tool(args: Dict) -> str:
    query = args.get("query", "")
    return f"Simulated search results for: {query}"


async def calculator_tool(args: Dict) -> str:
    expression = args.get("expression", "0")
    safe_ops = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul, ast.Div: operator.truediv, ast.Pow: operator.pow, ast.USub: operator.neg}

    def eval_node(node):
        if isinstance(node, ast.Num):
            return node.n
        elif isinstance(node, ast.BinOp):
            op_type = type(node.op)
            if op_type not in safe_ops:
                raise ValueError(f"Unsupported operator: {op_type}")
            return safe_ops[op_type](eval_node(node.left), eval_node(node.right))
        elif isinstance(node, ast.UnaryOp):
            op_type = type(node.op)
            if op_type not in safe_ops:
                raise ValueError(f"Unsupported unary operator: {op_type}")
            return safe_ops[op_type](eval_node(node.operand))
        elif isinstance(node, ast.Expression):
            return eval_node(node.body)
        else:
            raise ValueError(f"Unsupported node type: {type(node)}")

    try:
        parsed = ast.parse(expression, mode='eval')
        result = eval_node(parsed)
        return str(result)
    except Exception as e:
        return f"Error: {str(e)}"


async def echo_tool(args: Dict) -> str:
    return f"Echo: {args.get('message', '')}"
