# Imports
import re
import json
import tiktoken
import requests
from typing import TypedDict, Annotated, Sequence, Union
from langgraph.graph import add_messages, StateGraph, END
from langchain_core.messages import BaseMessage
from langgraph.prebuilt import ToolNode
from langchain_community.tools import DuckDuckGoSearchResults
from langchain_core.tools import tool
from langchain_lilypad import ChatLilypad
from fastapi import FastAPI, Depends
from auth import check_api_key 
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import os

# Environment variables
load_dotenv()
api_key = os.getenv("API_KEY_LILYPAD") 

# Fast API Classes

class Item(BaseModel):
    message : str
    context: str

# Langchain Classes
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    context: str

class ResponseFormatter(BaseModel):
    "Evaluate the dataset based on its quality, accuracy, completeness, consistency, and relevance to the intended real-world application. Determine if it is valid and reliable for use. """
    answer: bool = Field(description="Return True if the dataset meets all criteria and is deemed valid, or False if it does not.")

# Definitions and Extra Functions 
def unthink(text):
    # Remove all instances of <think>{content}</think>
    unthink_text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()
    # Remove "'"
    if unthink_text.startswith("'"):
        unthink_text = unthink_text[len("'"):]
    if unthink_text.endswith("'"):
        unthink_text = unthink_text[:-len("'")]
    # Strip whitespaces from the cleaned text
    return unthink_text.strip()

def count_tokens(text: str) -> int:
    tokenizer = tiktoken.get_encoding("cl100k_base") 
    tokens = tokenizer.encode(text)
    return len(tokens)

# Verification

def sendTokens( address: str, amount: str): # Express <> Privy, Server
    url = "http://localhost:8001/transaction"
    payload = json.dumps({
    "to": address,
    "value": amount
    })
    headers = {
    'Content-Type': 'application/json'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    print("Token transfer hash: "+response.text)


# Tools Chat Workflow

@tool
def websearch(webprompt: str) -> str:
    """This tool allows users to perform accurate and targeted internet searches for specific terms or phrases."""
    res = search.invoke(webprompt)
    return res

@tool
def prices(counter: int) -> str:
    """Fetch real-time prices of cryptocurrency tokens from the top 25 in the market."""
    temp_counter = counter
    flag = False
    if temp_counter > 25:
        temp_counter = 25
        flag = True
    elif temp_counter < 1:
        temp_counter = 1
        flag = True
    url = f"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page={temp_counter}"
    headers = {'accept': 'application/json'}
    response = requests.request("GET", url, headers=headers, data={})
    return response.text + (" This information reflects correctly the current market price and is up-to-date. "
                             if not flag else f"The query was adjusted from {counter} to {temp_counter} to ensure proper functionality.")

@tool
def databaseTool(database: str) -> str:
    """
    This tool activates only when a database context has been explicitly provided as part of the conversation.
    """
    return database

@tool
def fallback(fallData:str) -> str:
    """This tool activates only when the assistant has no other tool actively invoked in response to a user query"""
    return "As stated above, say something friendly and invite the user to interact with you."

# Workflow

def selector(state):
    messages = state["messages"]
    last_message = messages[-1]
    res = ""
    print(last_message.tool_calls)
    if not last_message.tool_calls:
        res = "end"
    elif any(tool['name'] == 'fallback' for tool in last_message.tool_calls):
        res = "fallback"
    else:
        res = "continue"
    return res

def call_model(state, config):
    system_prompt = """
    Act as DeSmond, a highly knowledgeable, perceptive, and approachable assistant. DeSmond is capable of providing accurate insights, answering complex inquiries, and offering thoughtful guidance in various domains. Embody professionalism and warmth, tailoring responses to meet the user's needs effectively while maintaining an engaging and helpful tone.
    """
    if state["context"] != "":
        system_prompt += f"""
        Use the following database for your responses and process additional entries in the provided comprehensive database to enrich your capabilities.

        Database:

        {state["context"]}

        and the user prompt is the next one...
        """
    messages = [{"role": "system", "content": system_prompt}] + state["messages"]
    print("Tokens: " + str(count_tokens(str(messages))))
    response = model_with_tools.invoke(messages)
    return {"messages": [response]}

def run_graph(message, context, session_id="0"):
    config = {"configurable": {"thread_id": session_id}}
    events = graph.invoke(
        {"messages": ("user", message), "context": context},
        config=config,
        stream_mode="values",
    )
    messages = events.get("messages", [])
    response = messages[-1].content
    return response

# Executable Code
search = DuckDuckGoSearchResults(safesearch="strict", max_results=10)
my_tools = [fallback, websearch, prices, databaseTool]
tool_node = ToolNode([websearch, prices, databaseTool])
fallback_node = ToolNode([fallback])

# Workflow Chat
model = ChatLilypad(model_name="llama3.1:8b", api_key=api_key)
model_verifier = model.with_structured_output(ResponseFormatter)
model_with_tools = model.bind_tools(my_tools)

workflow = StateGraph(state_schema=AgentState)
workflow.set_entry_point(key="agent")
workflow.add_node("agent", call_model)
workflow.add_node("tool", tool_node)
workflow.add_node("fall", fallback_node)
workflow.add_conditional_edges(
    source="agent",
    path=selector,
    path_map={
        "continue": "tool",
        "fallback": "fall",
        "end": END,
    },
)
workflow.add_edge("tool", "agent")
workflow.add_edge("fall", "agent")
graph = workflow.compile()

app = FastAPI(max_request_body_size=10 * 1024 * 1024)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/run_graph", dependencies=[Depends(check_api_key)])
async def run_graph_endpoint(item: Item):
    print(item.message, item.context)
    r = run_graph(item.message, item.context)
    return {"response": r}

@app.post("/verify_database", dependencies=[Depends(check_api_key)])
async def run_graph_endpoint(item: Item):
    try:
        print("DB Tokens Value: " + str(count_tokens(item.context)))
        r = model_verifier.invoke(item.context[0:1024*7])
        print("AI Verified Result: "+str({'answer': True}))
        if(True):
            amount = '{0:.5f}'.format(count_tokens(item.context)/10000)
            sendTokens(item.message, amount)
        return {"response": r.tool_calls[0]["args"]}
        #print(r.tool_calls[0]["args"])
        #if(r.tool_calls[0]["args"]["answer"]):
        #    amount = '{0:.5f}'.format(count_tokens(item.context)/10000)
        #    sendTokens(item.message, amount)
        #return {"response": r.tool_calls[0]["args"]}
    except Exception as e:
        print(e)
        return {"response": {"answer": False}}
