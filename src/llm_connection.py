import os, json
from google import genai
from google.genai.types import GenerateContentConfig, Tool, GoogleSearch
import anthropic
from typing import cast, Any
from dotenv import load_dotenv
from xai_sdk import Client
from xai_sdk.chat import user, system, SearchParameters
from xai_sdk.search import web_source, news_source

def gemini_completion(prompt_text, temperature=0.1, selected_model="None"):
    if selected_model == "None":
        return "⚠️ No Gemini model selected."
    
    client = genai.Client()
    
    search_tool = Tool(google_search=GoogleSearch())
    
    response = client.models.generate_content(
        model=selected_model,
        contents=prompt_text,
        config=GenerateContentConfig(
            temperature=temperature,
            tools=[search_tool],
        ),
    )
    
    if response.text:
        return response.text.strip()
    else:
        return "❌ No content received from Gemini API"

def claude_completion(prompt_text, temperature=0.1, selected_model="None"):
    if selected_model == "None":
        return "⚠️ No Claude model selected."
    
    client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
    text_content = []
    
    tools_list = [
        {
            "type": "web_search_20250305",
            "name": "web_search", 
            "max_uses": 5,
        }
    ]
    
    with client.messages.stream(
        model=selected_model,
        max_tokens=32000,
        temperature=temperature,
        tools=cast(Any, tools_list),
        messages=[
            {
                "role": "user", 
                "content": prompt_text
            }
        ]
    ) as stream:
        for event in stream:
            if event.type == "content_block_delta":
                if hasattr(event.delta, 'text') and event.delta.type == "text_delta":
                    text_content.append(event.delta.text)
    
    if text_content:
        return "".join(text_content).strip()
    else:
        return "❌ No content received from Claude API"

def grok_completion(prompt_text, temperature=0.1, selected_model="None"):
    try:
        if selected_model == "None":
            return "⚠️ No Grok model selected."
        
        client = Client(
            api_key=os.getenv("XAI_API_KEY"),
            timeout=3600
        )
        
        search_config = SearchParameters(
            sources=[
                web_source(country="US"),
                news_source(country="US")
            ],
            mode="on",
            return_citations=True,
            max_search_results=15
        )
        
        chat = client.chat.create(
            model=selected_model, 
            temperature=temperature,
            search_parameters=search_config
        )
        
        chat.append(user(prompt_text))
        
        response = chat.sample()
        
        if response and response.content:
            response_text = response.content.strip()
            return response_text
        else:
            return "❌ No content received from Grok API"
            
    except Exception as e:
        return f"⚠️ Grok API Error: {str(e)}"

def setup_environment():
    load_dotenv('secrets.env')
    script_dir = os.getcwd()
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.join(script_dir, os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "fin-ai-writer-studio-451100-0d89ef998e7a.json"))
    return script_dir

def fetch_gemini_models():
    try:
        client = genai.Client()
        models = {}
        available_models = client.models.list()
        for m in available_models:
            model_name = getattr(m, 'name', '')
            if 'gemini' in model_name.lower():
                model_id = model_name.split('/')[-1]
                display_name = getattr(m, 'displayName', None) or model_id
                models[model_id] = display_name
        return models
    except Exception as e:
        print(f"Failed to fetch Gemini models: {e}")
        return {"no_gemini": "No available gemini models found. {}".format(e)}

def fetch_claude_models():
    try:
        client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
        response = client.models.list()
        models = {}
        for model in response.data:
            models[model.id] = model.display_name or model.id
        return models
    except Exception as e:
        print(f"Failed to fetch Claude models: {e}")
        return {"no_claude": "No available claude models found. {}".format(e)}

def fetch_grok_models():
    try:
        client = Client(
            api_key=os.getenv("XAI_API_KEY"),
            timeout=3600
        )        
        language_models = client.models.list_language_models()
        models = {}
        
        for model in language_models:
            model_id = getattr(model, 'name', '')
            display_name = getattr(model, 'name', model_id)
            if model_id:
                models[model_id] = display_name            
        return models
    except Exception as e:
        print(f"Failed to fetch Grok models: {e}")
        return {"None": "No Available models found. {}".format(e)}
    
from functools import partial

def completion_function_for_model(model_id, state_):
    """
    Finds a completion function for a model id.
    Clean implementation without web search tool parameter complications.
    """
    if model_id in state_['gemini_models_ids']:
        return partial(gemini_completion, selected_model=model_id)
    elif model_id in state_['claude_models_ids']:
        return partial(claude_completion, selected_model=model_id)
    elif model_id in state_['grok_models_ids']:
        return partial(grok_completion, selected_model=model_id)
    else:
        return None


if __name__ == "__main__":
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
    setup_environment()
    gemini_models = fetch_gemini_models()
    claude_models = fetch_claude_models()
    grok_models = fetch_grok_models()
    
    print("Gemini Models:", gemini_models)
    print("Claude Models:", claude_models)
    print("Grok Models:", grok_models)
    
    print("\n" + "="*70)
    print("🧪 TESTING WEB SEARCH CAPABILITIES FOR CURRENT NVDA STOCK PRICE")
    print("="*70)
    
    nvda_test_query = "What is the current stock price of NVIDIA (NVDA) today? Please provide the exact current price in USD and the time/date of the quote. Please respond with only 1 line of text."
    
    print(f"📋 Test Query: {nvda_test_query}")
    print("="*70)
    
    print("\n🤖 TESTING GEMINI (with GoogleSearch):")
    print("-"*50)
    try:
        gemini_response = gemini_completion(nvda_test_query, temperature=0.1, selected_model="gemini-2.0-flash-exp")
        print(f"✅ Gemini Response:\n{gemini_response}")
    except Exception as e:
        print(f"❌ Gemini Error: {e}")
    
    print("\n" + "="*70)
    
    print(f"\n🤖 TESTING CLAUDE (with web search):")
    print("-"*50)
    claude_response = claude_completion(nvda_test_query, temperature=0.1, selected_model="claude-sonnet-4-20250514")
    print(f"✅ Claude Response:\n{claude_response}")
        
    print("\n" + "="*70)
    
    print("\n🤖 TESTING GROK (with SearchParameters):")
    print("-"*50)
    try:
        grok_response = grok_completion(nvda_test_query, temperature=0.1, selected_model="grok-2-1212")
        print(f"✅ Grok Response:\n{grok_response}")
    except Exception as e:
        print(f"❌ Grok Error: {e}")
    