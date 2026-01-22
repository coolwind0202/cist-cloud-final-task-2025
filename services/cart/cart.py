from abc import abstractmethod, ABC

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