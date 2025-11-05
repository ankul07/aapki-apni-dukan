import React, { useRef, useState, useEffect } from "react";
import api from "../../services/api";
const server = import.meta.env.VITE_SERVER;
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AiOutlineArrowRight, AiOutlineSend } from "react-icons/ai";
import styles from "../../styles/styles";
import { TfiGallery } from "react-icons/tfi";
import socketIO from "socket.io-client";

const socketId = socketIO(server, { transports: ["websocket"] });

const DashboardMessages = () => {
  const { seller } = useSelector((state) => state.seller);
  const [conversations, setConversations] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [currentChat, setCurrentChat] = useState();
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeStatus, setActiveStatus] = useState(false);
  const [images, setImages] = useState();
  const [open, setOpen] = useState(false);
  const scrollRef = useRef(null);

  // Socket: Receive messages
  useEffect(() => {
    socketId.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

  // Add arrival message to messages array
  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  // Get all conversations for seller
  useEffect(() => {
    const getConversation = async () => {
      try {
        const response = await api.get(
          `${server}/conversation/get-all-conversation-seller/${seller?._id}`,
          {
            withCredentials: true,
          }
        );
        console.log("this is response", response);
        setConversations(response.data.conversations);
      } catch (error) {
        console.log("Error fetching conversations:", error);
      }
    };
    getConversation();
  }, [seller, messages]);

  // Socket: Add seller to online list
  useEffect(() => {
    if (seller) {
      const sellerId = seller?._id;
      socketId.emit("addUser", sellerId);
      socketId.on("getUsers", (data) => {
        setOnlineUsers(data);
      });
    }
  }, [seller]);

  // Check if user is online
  const onlineCheck = (chat) => {
    const chatMembers = chat.members.find((member) => member !== seller?._id);
    const online = onlineUsers.find((user) => user.userId === chatMembers);
    return online ? true : false;
  };

  // Get messages for current chat
  useEffect(() => {
    const getMessage = async () => {
      try {
        const response = await api.get(
          `${server}/message/get-all-messages/${currentChat?._id}`
        );
        setMessages(response.data.messages);
      } catch (error) {
        console.log("Error fetching messages:", error);
      }
    };
    if (currentChat) {
      getMessage();
    }
  }, [currentChat]);

  // Send text message
  const sendMessageHandler = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    const message = {
      sender: seller._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    const receiverId = currentChat.members.find(
      (member) => member !== seller._id // ✅ Fixed: member.id se member
    );

    socketId.emit("sendMessage", {
      senderId: seller._id,
      receiverId,
      text: newMessage,
    });

    try {
      const res = await api.post(
        `${server}/message/create-new-message`,
        message
      );
      setMessages([...messages, res.data.message]);
      updateLastMessage();
    } catch (error) {
      console.log("Error sending message:", error);
    }
  };

  // Update last message
  const updateLastMessage = async () => {
    socketId.emit("updateLastMessage", {
      lastMessage: newMessage,
      lastMessageId: seller._id,
    });

    try {
      await api.put(
        `${server}/conversation/update-last-message/${currentChat._id}`,
        {
          lastMessage: newMessage,
          lastMessageId: seller._id,
        }
      );
      setNewMessage("");
    } catch (error) {
      console.log("Error updating last message:", error);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImages(file);
      imageSendingHandler(file);
    }
  };

  // Send image message
  const imageSendingHandler = async (file) => {
    const formData = new FormData();
    formData.append("images", file);
    formData.append("sender", seller._id);
    formData.append("text", newMessage);
    formData.append("conversationId", currentChat._id);

    const receiverId = currentChat.members.find(
      (member) => member !== seller._id
    );

    socketId.emit("sendMessage", {
      senderId: seller._id,
      receiverId,
      images: file,
    });

    try {
      const res = await api.post(
        `${server}/message/create-new-message`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setImages(null);
      setMessages([...messages, res.data.message]);
      updateLastMessageForImage();
    } catch (error) {
      console.log("Error sending image:", error);
    }
  };

  // Update last message for image
  const updateLastMessageForImage = async () => {
    try {
      await api.put(
        `${server}/conversation/update-last-message/${currentChat._id}`,
        {
          lastMessage: "Photo",
          lastMessageId: seller._id,
        }
      );
    } catch (error) {
      console.log("Error updating last message for image:", error);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-[90%] bg-white m-5 h-[85vh] overflow-y-scroll rounded">
      {!open && (
        <>
          <h1 className="text-center text-[30px] py-3 font-Poppins">
            All Messages
          </h1>
          {/* All messages list */}
          {conversations && conversations.length > 0 ? (
            conversations.map((item, index) => (
              <MessageList
                data={item}
                key={item._id}
                index={index}
                setOpen={setOpen}
                setCurrentChat={setCurrentChat}
                me={seller._id}
                setUserData={setUserData}
                userData={userData}
                online={onlineCheck(item)}
                setActiveStatus={setActiveStatus}
              />
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              No conversations yet
            </div>
          )}
        </>
      )}

      {open && (
        <SellerInbox
          setOpen={setOpen}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessageHandler={sendMessageHandler}
          messages={messages}
          sellerId={seller._id}
          userData={userData}
          activeStatus={activeStatus}
          scrollRef={scrollRef}
          handleImageUpload={handleImageUpload}
        />
      )}
    </div>
  );
};

const MessageList = ({
  data,
  index,
  setOpen,
  setCurrentChat,
  me,
  setUserData,
  online,
  setActiveStatus,
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(false);
  const navigate = useNavigate();

  // Fetch user data
  useEffect(() => {
    const userId = data.members.find((member) => member !== me);

    const getUser = async () => {
      setLoading(true);
      try {
        const res = await api.get(`${server}/user/user-info/${userId}`);
        setUser(res.data.user);
      } catch (error) {
        console.log("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      getUser();
    }
  }, [me, data]);

  // Handle conversation click
  const handleClick = () => {
    if (!user) return;

    navigate(`/dashboard-messages?${data._id}`);
    setOpen(true);
    setActive(true);
    setCurrentChat(data);
    setUserData(user);
    setActiveStatus(online);
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full flex p-3 px-3 animate-pulse">
        <div className="w-[50px] h-[50px] bg-gray-300 rounded-full"></div>
        <div className="pl-3 flex-1">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (!user) {
    return null;
  }

  return (
    <div
      className={`w-full flex p-3 px-3 ${
        active ? "bg-[#00000010]" : "bg-transparent"
      } cursor-pointer hover:bg-[#00000008] transition-all`}
      onClick={handleClick}
    >
      <div className="relative">
        <img
          src={user?.avatar || "/default-avatar.png"}
          alt={user?.name || "User"}
          className="w-[50px] h-[50px] rounded-full object-cover"
          onError={(e) => {
            e.target.src = "/default-avatar.png";
          }}
        />
        {online ? (
          <div className="w-[12px] h-[12px] bg-green-400 rounded-full absolute top-[2px] right-[2px] border-2 border-white" />
        ) : (
          <div className="w-[12px] h-[12px] bg-[#c7b9b9] rounded-full absolute top-[2px] right-[2px] border-2 border-white" />
        )}
      </div>
      <div className="pl-3 flex-1 min-w-0">
        <h1 className="text-[18px] font-medium truncate">{user?.name}</h1>
        <p className="text-[16px] text-[#000c] truncate">
          {data?.lastMessageId === me
            ? "You: "
            : user?.name?.split(" ")[0] + ": "}
          {data?.lastMessage || "No messages yet"}
        </p>
      </div>
    </div>
  );
};

const SellerInbox = ({
  scrollRef,
  setOpen,
  newMessage,
  setNewMessage,
  sendMessageHandler,
  messages,
  sellerId,
  userData,
  activeStatus,
  handleImageUpload,
}) => {
  return (
    <div className="w-full min-h-full flex flex-col justify-between">
      {/* Message header */}
      <div className="w-full flex p-3 items-center justify-between bg-slate-200 sticky top-0 z-10">
        <div className="flex items-center">
          <img
            src={userData?.avatar || "/default-avatar.png"}
            alt={userData?.name || "User"}
            className="w-[60px] h-[60px] rounded-full object-cover"
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
          <div className="pl-3">
            <h1 className="text-[18px] font-[600]">
              {userData?.name || "Unknown User"}
            </h1>
            <h1 className="text-sm text-gray-600">
              {activeStatus ? "Active Now" : "Offline"}
            </h1>
          </div>
        </div>
        <AiOutlineArrowRight
          size={20}
          className="cursor-pointer hover:scale-110 transition-transform"
          onClick={() => setOpen(false)}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 px-3 py-3 overflow-y-auto bg-gray-50">
        {messages && messages.length > 0 ? (
          messages.map((item, index) => (
            <div
              key={item._id || index}
              className={`flex w-full my-2 ${
                item.sender === sellerId ? "justify-end" : "justify-start"
              }`}
              ref={index === messages.length - 1 ? scrollRef : null}
            >
              {item.sender !== sellerId && (
                <img
                  src={userData?.avatar || "/default-avatar.png"}
                  className="w-[40px] h-[40px] rounded-full mr-3 object-cover"
                  alt={userData?.name || "User"}
                  onError={(e) => {
                    e.target.src = "/default-avatar.png";
                  }}
                />
              )}

              <div className="flex flex-col">
                {item.images && (
                  <img
                    src={item.images}
                    alt="Sent image"
                    className="max-w-[300px] max-h-[300px] object-cover rounded-[10px] mb-2"
                    onError={(e) => {
                      e.target.alt = "Image failed to load";
                      e.target.style.display = "none";
                    }}
                  />
                )}

                {item.text && item.text.trim() !== "" && (
                  <div>
                    <div
                      className={`w-max max-w-[300px] p-2 rounded-lg ${
                        item.sender === sellerId
                          ? "bg-[#000] text-white"
                          : "bg-[#38c776] text-white"
                      }`}
                    >
                      <p className="break-words">{item.text}</p>
                    </div>
                    <p className="text-[12px] text-[#000000d3] pt-1">
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        )}
      </div>

      {/* Send message input */}
      <form
        className="p-3 bg-white border-t border-gray-200 flex items-center gap-3"
        onSubmit={sendMessageHandler}
      >
        <div className="flex-shrink-0">
          <input
            type="file"
            id="image"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <label htmlFor="image" className="cursor-pointer">
            <TfiGallery
              className="hover:text-blue-500 transition-colors"
              size={24}
            />
          </label>
        </div>

        <div className="flex-1 relative">
          <input
            type="text"
            required
            placeholder="Enter your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className={`${styles.input} pr-10`}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <AiOutlineSend
              size={24}
              className="cursor-pointer hover:text-blue-500 transition-colors"
            />
          </button>
        </div>
      </form>
    </div>
  );
};

export default DashboardMessages;
