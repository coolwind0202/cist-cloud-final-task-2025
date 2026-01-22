from fastapi import FastAPI
import aiohttp
import os

import cart

app = FastAPI()
cart_manager = cart.MemoryCartManager()

async def fetch_username_by_session_id(session_id: str) -> str | None:
    # TODO: Remove this hardcoded admin check after implementing proper session management
    return "admin"

    async with aiohttp.ClientSession() as session:
        account_service_host = os.getenv('ACCOUNTS_SERVICE_HOST')

        async with session.get(f"http://{account_service_host}/sessions/{session_id}/username") as response:
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