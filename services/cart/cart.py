from abc import abstractmethod, ABC
import redis

class BaseCartManager(ABC):
    @abstractmethod
    def get_cart(self, username: str) -> dict:
        pass

    @abstractmethod
    def update_cart_entry(self, username: str, item_id: int, quantity: int) -> dict:
        pass

class MemoryCartManager(BaseCartManager):
  def __init__(self):
      self.carts = {}

  def get_cart(self, username: str) -> dict:
      return self.carts.get(username, {})
  
  def update_cart_entry(self, username: str, item_id: int, quantity: int) -> dict:
      if username not in self.carts:
          self.carts[username] = {}
      self.carts[username][item_id] = {"item_id": item_id, "quantity": quantity}
      return self.carts[username]

class RedisCartManager(BaseCartManager):
    def __init__(self, host, port, db, client_id):
        self.redis_client = redis.StrictRedis(host=host, port=port, db=db, decode_responses=True)
        self.client_id = client_id

    def get_cart(self, username: str) -> dict:
        cart_data = self.redis_client.hgetall(f"{username}-{self.client_id}")
        cart = {}
        for item_id, quantity in cart_data.items():
            cart[int(item_id)] = {"item_id": int(item_id), "quantity": int(quantity)}
        return cart
    
    def update_cart_entry(self, username: str, item_id: int, quantity: int) -> dict:
        self.redis_client.hset(f"{username}-{self.client_id}", item_id, quantity)
        return self.get_cart(username)