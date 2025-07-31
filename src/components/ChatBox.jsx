import React, { useState } from "react";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import { chatAPI, usersAPI } from "../utils/api";
import { BsChatDots } from "react-icons/bs";
import msg from "../assets/msg.png";

const ChatBox = () => {
  const { user, isTeacher } = useAuth();
  const { on, off, emit } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Load initial data
    loadMessages();
    loadParticipants();

    // Socket listeners
    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleParticipantsUpdate = (data) => {
      setParticipants(data.participants);
    };

    const handleUserKicked = (data) => {
      setParticipants(prev => prev.filter(p => p.id !== data.userId));
    };

    on('new_message', handleNewMessage);
    on('participants_update', handleParticipantsUpdate);
    on('user_kicked', handleUserKicked);

    return () => {
      off('new_message', handleNewMessage);
      off('participants_update', handleParticipantsUpdate);
      off('user_kicked', handleUserKicked);
    };
  }, [user, on, off]);

  const loadMessages = async () => {
    try {
      const response = await chatAPI.getMessages();
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Load messages error:', error);
    }
  };

  const loadParticipants = async () => {
    try {
      const response = await usersAPI.getParticipants();
      setParticipants(response.data.participants);
    } catch (error) {
      console.error('Load participants error:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      emit('send_message', {
        content: newMessage.trim(),
        messageType: 'text'
      });
      setNewMessage("");
    } catch (error) {
      console.error('Send message error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatIconClick = () => {
    setIsOpen(!isOpen);
  };

  const handleKickOut = (id) => {
    if (!isTeacher) return;
    
    emit('kick_user', { userId: id });
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Icon Button */}
      <button
        onClick={handleChatIconClick}
        className="fixed bottom-4 right-4 z-45 bg-[#5A66D1] p-4 rounded-full shadow-lg text-white cursor-pointer"
        title="Click to open, double-click to close"
      >
        <img src={msg} className="w-5 h-5" />
      </button>

      {/* Chat Box */}
      {isOpen && (
        <div className="fixed bottom-20 sora text-sm right-4 w-[429px] h-[477px] rounded-sm shadow-lg border border-gray-300 bg-white z-50 overflow-hidden">
          {/* Tabs Header */}
          <div className="flex border-b border-gray-300 justify-start gap-x-4 pl-4">
            <button
              onClick={() => setActiveTab("chat")}
              className={`relative px-4 py-2 font-semibold transition-all duration-200 ${
                activeTab === "chat"
                  ? "text-black border-b-2 border-[#8F64E1]"
                  : "text-gray-500 border-b-2 border-transparent"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab("participants")}
              className={`relative px-4 py-2 font-semibold transition-all duration-200 ${
                activeTab === "participants"
                  ? "text-black border-b-2 border-[#8F64E1]"
                  : "text-gray-500 border-b-2 border-transparent"
              }`}
            >
              Participants
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 space-y-4 bg-white h-80 overflow-y-auto">
            {activeTab === "chat" && (
              <>
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={message.senderRole === 'teacher' ? "text-right" : "text-left"}
                  >
                    <p className={`text-sm font-semibold ${
                      message.senderRole === 'teacher' ? 'text-black' : 'text-purple-800'
                    }`}>
                      {message.senderName}
                    </p>
                    <div className={`px-3 py-2 mt-1 rounded-lg w-fit max-w-[70%] ${
                      message.senderRole === 'teacher' 
                        ? 'bg-[#8F64E1] text-white ml-auto' 
                        : 'bg-black text-white mr-auto'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === "participants" && (
              <>
                <div className="flex justify-between text-[#726F6F] px-3">
                  <span>Name</span>
                  {isTeacher && <span>Action</span>}
                </div>
                <div className="text-gray-600">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex justify-between items-center py-1">
                      <span className="text-black">
                        {participant.name} 
                        <span className="text-xs text-gray-500 ml-1">
                          ({participant.role})
                        </span>
                      </span>
                      {isTeacher && participant.role === 'student' && (
                        <button
                          onClick={() => handleKickOut(participant.id)}
                          className="text-[#1D68BD] px-3 py-1 underline cursor-pointer rounded-lg text-xs hover:bg-gray-100"
                        >
                          kick out
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Chat Input */}
          {activeTab === "chat" && (
            <div className="border-t border-gray-300 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#8F64E1]"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !newMessage.trim()}
                  className="px-4 py-2 bg-[#8F64E1] text-white rounded-md text-sm hover:opacity-90 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBox;

                      </div>
                    ))}

                    {/* Teacher Messages */}
                    {teacherMessage.map((message) => (
                      <div key={message.id} className="text-right">
                        <p className="text-sm text-black font-semibold">
                          {message.sender}
                        </p>
                        <div className="bg-[#8F64E1] text-white px-3 py-2 mt-1 rounded-lg w-fit max-w-[70%] ml-auto">
                          {message.text}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}

            {activeTab === "participants" && (
              <>
                <div className="flex justify-between text-[#726F6F] px-3">
                  <span>Name</span>
                  <span>Action</span>
                </div>
                <div className="text-gray-600">
                  <ul className="list-disc pl-5">
                    {participants.map((p) => {
                      return (
                        <div key={p.id} className="flex justify-between">
                          <span className="text-black">{p.name}</span>
                          {role === "student" && (
                            <button
                              onClick={() => handleKickOut(p.id)}
                              className=" text-[#1D68BD] px-3 py-2 mt-1 underline cursor-pointer rounded-lg w-fit max-w-[70%]"
                            >
                              kick out
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBox;
