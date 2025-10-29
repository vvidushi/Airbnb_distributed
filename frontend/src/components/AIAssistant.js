import React, { useState } from 'react';
import axios from 'axios';
import { FaRobot, FaTimes, FaPaperPlane, FaExpand, FaCompress } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const AIAssistant = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages([...messages, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const requestData = {
                query: input.trim(),
                userId: (user && user.id) ? String(user.id) : 'anonymous'
            };
            
            console.log('Sending AI request:', requestData);
            
            const response = await axios.post('http://localhost:8000/api/ai/plan', requestData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const aiMessage = { role: 'assistant', content: response.data.response };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('AI request failed:', error);
            const errorMessage = { 
                role: 'assistant', 
                content: 'Sorry, I encountered an error. Please try again.' 
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleMaximize = () => {
        setIsMaximized(!isMaximized);
    };

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-red-600 transition z-50"
            >
                {isOpen ? <FaTimes className="text-2xl" /> : <FaRobot className="text-2xl" />}
            </button>

            {/* Chat panel */}
            {isOpen && (
                <div className={`fixed bg-white rounded-lg shadow-2xl flex flex-col z-50 transition-all duration-300 ease-in-out ${
                    isMaximized 
                        ? 'bottom-6 right-6 w-1/3 h-[calc(100vh-3rem)] max-w-2xl' 
                        : 'bottom-24 right-6 w-96 h-[500px]'
                }`}>
                    {/* Header */}
                    <div className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold flex items-center space-x-2">
                                <FaRobot />
                                <span>AI Travel Assistant</span>
                            </h3>
                            <p className="text-sm opacity-90">Ask me about your trip plans!</p>
                        </div>
                        <button
                            onClick={toggleMaximize}
                            className="text-white hover:text-gray-200 transition-colors p-1"
                            title={isMaximized ? "Minimize" : "Maximize"}
                        >
                            {isMaximized ? <FaCompress className="text-lg" /> : <FaExpand className="text-lg" />}
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-dark mt-8">
                                <FaRobot className="text-6xl text-gray mx-auto mb-4" />
                                <p>Hello! I'm your AI travel assistant.</p>
                                <p className="text-sm mt-2">Ask me about activities, restaurants, packing lists, or day plans!</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg ${
                                        msg.role === 'user'
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-light text-dark'
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-light p-3 rounded-lg">
                                    <p className="text-sm text-gray-dark">Thinking...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="border-t p-4">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything..."
                                className="flex-1 px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                                disabled={loading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaPaperPlane />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIAssistant;

