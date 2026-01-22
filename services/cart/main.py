from fastapi import FastAPI
import aiohttp
import os

import cart

app = FastAPI()

def get_cart_manager() -> cart.BaseCartManager:
    redis_host = os.getenv('REDIS_HOST')
    redis_port = int(os.getenv('REDIS_PORT', '6379'))
    redis_pass = os.getenv('REDIS_PASS')
    redis_client_id = os.getenv('REDIS_CLIENT_ID')

    if redis_host:
        return cart.RedisCartManager(host=redis_host, port=redis_port, password=redis_pass, client_id=redis_client_id)
    else:
        return cart.MemoryCartManager()

cart_manager = get_cart_manager()

async def fetch_username_by_session_id(session_id: str) -> str | None:
    async with aiohttp.ClientSession() as session:
        account_service_host = os.getenv('ACCOUNTS_SERVICE_HOST')
        account_service_port = os.getenv('ACCOUNTS_SERVICE_PORT', '80')
        account_service_url = f"http://{account_service_host}:{account_service_port}/sessions/{session_id}/username"

        async with session.get(account_service_url) as response:
            if response.status == 200:
                data = await response.json()
                return data.get("username")
            return None

@app.get("/carts/{username}")
async def get_cart(username: str, session_id: str):
    username_from_session = await fetch_username_by_session_id(session_id)
    if username_from_session != username:
        return {"error": "Unauthorized"}

    return {"session_id": session_id, "username": username, "items": cart_manager.get_cart(username)}

@app.put("/carts/{username}/{item_id}")
async def add_to_cart(username: str, session_id: str, item_id: int, quantity: int):
    username_from_session = await fetch_username_by_session_id(session_id)
    if username_from_session != username:
        return {"error": "Unauthorized"}

    cart_manager.update_cart_entry(username, item_id, quantity)

    return {"session_id": session_id, "username": username, "items": cart_manager.get_cart(username)}