import React, { useState, type FormEvent, type ChangeEvent } from "react";
import styles from "./ZusChatbot.module.scss";
import BotChatAvatar from "../assets/ZUS_logo.svg";
import UserChatAvatar from "../assets/user_chat.svg";

type Message = {
  id: number;
  text: string;
  sender: "user" | "bot";
};

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Witaj! Jestem Asystentem Systemu Emerytalnego ZUS. Chętnie odpowiem na każde pytanie dotyczące Twojej przyszłej emerytury, kapitału początkowego, świadczeń, czy formalności związanych z systemem emerytalnym. Jak mogę Ci dzisiaj pomóc? ",
    sender: "bot",
  },
  // {
  //   id: 2,
  //   text: "Dzień dobry. Chciałbym zapytać o warunki otrzymania zasiłku chorobowego.",
  //   sender: "user",
  // },
  // {
  //   id: 3,
  //   text: "Rozumiem. Proszę, określ swój status: jesteś pracownikiem, zleceniobiorcą, czy prowadzisz działalność?",
  //   sender: "bot",
  // },
];

const ZusChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const newUserMessage: Message = {
      id: Date.now(),
      text: input.trim(),
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInput("");
  };

  return (
    <div className={styles.chatbotContainer}>
      <div className={styles.chatbotHeader}>
        <span className={styles.headerTitle}>Asystent ZUS</span>
      </div>

      <div className={styles.messagesWindow}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.message} ${
              msg.sender === "user" ? styles.userMessage : styles.botMessage
            }`}
          >
            <div className={styles.senderAvatar}>
              {msg.sender === "bot" ? (
                <img
                  src={BotChatAvatar}
                  alt="Bot chat avatar"
                  className={styles.botChatAvatar}
                />
              ) : (
                <img
                  src={UserChatAvatar}
                  alt="User chat avatar"
                  className={styles.userChatAvatar}
                />
              )}
            </div>

            <div className={styles.messageBubble}>{msg.text}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Wpisz wiadomość..."
          className={styles.messageInput}
        />
        <button type="submit" className={styles.sendButton}>
          Wyślij
        </button>
      </form>
    </div>
  );
};

export default ZusChatbot;
