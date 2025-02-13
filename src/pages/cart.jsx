import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    // Check authentication
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/sign-in');
        return;
      }
      
      // Load cart items from localStorage
      const savedCart = localStorage.getItem(`cart_${user.uid}`);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem(`cart_${auth.currentUser.uid}`, JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem(`cart_${auth.currentUser.uid}`, JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#d0b290]">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#d0b290]">
      <div className="container mx-auto p-4 relative">
        {/* Logo */}
        <div className="absolute top-7 left-4">
          <img 
            src="/img/Tastoria.jpg"
            alt="Tastoria Logo"
            className="h-28 w-44 mt-2"
          />
        </div>

        <div className="pt-36">
          <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
          
          {cartItems.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-xl text-gray-600">Your cart is empty</p>
              <button 
                onClick={() => navigate('/preorder')}
                className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Browse Restaurants
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-6 py-4 border-b border-gray-200 last:border-b-0">
                  <img 
                    src={item.image}
                    alt={item.name}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold">{item.name}</h3>
                    <p className="text-gray-600">{item.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="bg-gray-200 px-3 py-1 rounded-md"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="bg-gray-200 px-3 py-1 rounded-md"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-lg font-semibold">₹{item.price * item.quantity}</span>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center text-xl font-semibold mb-6">
                  <span>Total</span>
                  <span>₹{calculateTotal()}</span>
                </div>
                <div className="flex justify-center">
                  <button 
                    className="w-48 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"
                    onClick={() => navigate('/checkout')}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart; 