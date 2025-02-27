import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Input,
  Button,
  Typography,
  IconButton,
} from "@material-tailwind/react";

const FLASK_API_ENDPOINT = 'http://localhost:5000/api/chat';

export function ChatBot() {
    const [messages, setMessages] = useState([{ 
        text: "👋 Hello! I'm your Tastoria assistant. How can I help you today?", 
        sender: "bot" 
    }]);
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            await axios.get('http://localhost:5000/api/health');
            setIsConnected(true);
        } catch (error) {
            console.error('API connection error:', error);
            setIsConnected(false);
        }
    };

    const handleNavigation = (cafeId) => {
        console.log("Attempting navigation to:", cafeId);
        console.log("Current URL before navigation:", window.location.pathname);
        setIsOpen(false);

        // Check if this is a slot booking navigation
        if (cafeId === 'ttmm-slot') {
            navigate(`/book-slot/ttmm`);
        } else {
            navigate(`/preorder/${cafeId}`);
        }
        
        console.log("Navigation completed");
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
        
        const userMessage = { text: input, sender: "user" };
        setMessages(prev => [...prev, userMessage]);
        setInput("");

        try {
            // Show typing indicator
            setMessages(prev => [...prev, { text: "typing...", sender: "bot", isTyping: true }]);

            const response = await axios.post(FLASK_API_ENDPOINT, {
                message: input
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            // Remove typing indicator
            setMessages(prev => prev.filter(msg => !msg.isTyping));

            if (response.data) {
                setMessages(prev => [...prev, { 
                    text: response.data.message, 
                    sender: "bot" 
                }]);

                if (response.data.action === 'navigate' && response.data.cafeId) {
                    setTimeout(() => handleNavigation(response.data.cafeId), 1000);
                }
            }

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => prev.filter(msg => !msg.isTyping));
            
            // Show specific error message
            const errorMessage = !isConnected 
                ? "Unable to connect to the server. Please make sure the Flask server is running."
                : "Sorry, I'm having trouble processing your request. Please try again.";
            
            setMessages(prev => [...prev, { 
                text: errorMessage, 
                sender: "bot" 
            }]);
        }
    };

    return (
        <div className="fixed bottom-6 left-6 z-50">
            {/* Chat Toggle Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-full p-4 shadow-lg flex items-center justify-between min-w-[160px]"
                color="blue"
            >
                <div className="flex items-center gap-2">
                    {isOpen ? (
                        <>
                            <span>Close Chat</span>
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                strokeWidth={1.5} 
                                stroke="currentColor" 
                                className="w-6 h-6 ml-auto"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </>
                    ) : (
                        <>
                            <span>Chat with Us</span>
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                strokeWidth={1.5} 
                                stroke="currentColor" 
                                className="w-6 h-6 ml-auto"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                            </svg>
                        </>
                    )}
                </div>
            </Button>

            {/* Chat Window */}
            {isOpen && (
                <Card className="fixed bottom-16 left-6 w-96 shadow-xl">
                    <CardBody className="p-4">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 border-b pb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-500 rounded-full p-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                                    </svg>
                                </div>
                                <Typography variant="h6" color="blue-gray">
                                    Tastoria Assistant
                                </Typography>
                            </div>
                            <div className="flex items-center gap-2">
                                <Typography variant="small" color="gray" className="flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                    Online
                                </Typography>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="h-96 overflow-y-auto mb-4 pr-2">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.sender === "bot" ? "justify-start" : "justify-end"} mb-4`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-xl ${
                                            msg.sender === "bot"
                                                ? "bg-blue-50 text-blue-gray-800"
                                                : "bg-blue-500 text-white"
                                        }`}
                                    >
                                        <Typography>{msg.text}</Typography>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="flex gap-2 items-center border-t pt-4">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                                placeholder="Type your message..."
                                className="flex-1"
                                labelProps={{
                                    className: "hidden",
                                }}
                                containerProps={{
                                    className: "min-w-0",
                                }}
                            />
                            <Button
                                onClick={sendMessage}
                                className="rounded-full p-3"
                                color="blue"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}

export default ChatBot;
