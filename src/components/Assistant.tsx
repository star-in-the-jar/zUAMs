import React, { useState, useRef, useEffect } from "react";
import { Send } from "@mui/icons-material";
import { AIUtil } from "@/ai/ai";

import { useSnapshot } from "valtio";
import { appState, type AppState } from "@/store/appState";
import { GENDERS } from "@/const/genders";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface SuggestedPrompt {
  id: string;
  text: string;
}

const Assistant: React.FC<{ chatName: string }> = ({ chatName }) => {
  const snap: AppState = useSnapshot(appState);

  const userInfoPrompt = `Użytkownik ma ${snap.age} lat${
    snap.gender
      ? `, jest ${snap.gender === GENDERS.MALE ? "mężczyzną" : "kobietą"}`
      : ""
  } i planuje przejść na emeryturę w wieku ${snap.retirementAge} lat.${
    snap.monthlyGrossSalary > 0
      ? ` Jego miesięczne wynagrodzenie brutto wynosi ${snap.monthlyGrossSalary} zł.`
      : ""
  }${
    snap.currentMonthlySalary > 0
      ? ` Obecnie zarabia ${snap.currentMonthlySalary} zł brutto miesięcznie.`
      : ""
  } Jest zatrudniony na umowę ${
    snap.employmentType === "UoP" ? "o pracę" : "B2B (JDG)"
  }.${
    snap.maternityLeaves > 0
      ? ` Ma ${snap.maternityLeaves} miesięcy urlopu macierzyńskiego.`
      : ""
  }${
    !snap.averageSickDays
      ? ` Nie uwzględnia średniej liczby dni chorobowych.`
      : ""
  }${
    snap.additionalSavings > 0
      ? ` Odkłada dodatkowo ${snap.additionalSavings} zł w II i III filarze.`
      : ""
  }${
    snap.collectedZusBenefits > 0
      ? ` Suma już zebranych świadczeń w ZUS wynosi ${snap.collectedZusBenefits} zł.`
      : ""
  }${
    snap.jdgStartYear && snap.yearsOnJdg && snap.monthlyJdgZusContribution
      ? ` Prowadzi JDG od roku ${snap.jdgStartYear} przez ${snap.yearsOnJdg} lat, płacąc ${snap.monthlyJdgZusContribution} zł składki ZUS miesięcznie.`
      : ""
  }`
    .trim()
    .replace(/\s+/g, " ");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Cześć! Jak mogę Ci pomóc w przygotowaniu się do emerytury?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const aiUtilRef = useRef<AIUtil | null>(null);

  // Initialize AI utility
  useEffect(() => {
    const aiUtil = new AIUtil({
      model: "gpt-4.1",
      temperature: 0.3,
      maxTokens: 1000,
    });

    // Set system message for retirement advisor
    const basePrompt = `Jesteś Zeus - specjalista ds. emerytur i ubezpieczeń społecznych w Polsce.

AKTUALNY ROK: 2025

Twoim celem jest pomoaganie użytkownikowi w zakresie emerytury.

ZAWSZE odpowiadaj TYLKO w języku polskim i WYŁĄCZNIE na tematy związane z:
- systemem emerytalnym w Polsce (ZUS, składki, wiek emerytalny)
- planowaniem finansowym na emeryturę (PPK, IKE)
- obliczaniem wysokości przyszłych świadczeń emerytalnych
- prawem pracy w kontekście uprawnień emerytalnych

NIGDY nie odpowiadaj na pytania spoza tych tematów.

STYL KOMUNIKACJI:
Tłumacz wszystko prosto. Unikaj skomplikowanych terminów.
Używaj prostego, przyjaznego języka i konkretnych przykładów z polskim prawem. Zawsze bierz pod uwagę tylko najnowsze założenia dotyczące użytkownika.

Pamiętaj, że osoba może korzystać ze zwolnienia chorobowego, co może mieć wpływ na składkę. Domyślnie zakładaj brak zwolnień.

FORMAT ODPOWIEDZI:
NIE używaj formatowania Markdown. Pisz TYLKO zwykłym tekstem (plaintext).
Odpowiadaj króto i rzeczowo.

WYKONYWANIE OBLICZEŃ:
Gdy użytkownik pyta o emeryturę - dopytaj o:
1. To ile zarabia na UoP (brutto miesięcznie)
2. W jakim wieku chce przejść na emeryturę
3. Ile ma lat
4. Ile lat już pracuje
5. Jakiej jest płci
6. Czy prowadzi, prowadził lub będzie prowadził JDG. 

Weź pod uwage, że nie każdy prowadzi JDG. Najczęściej ludzie mają albo UoP albo JDG, a jedynie rzadko oba.

DODATKOWE INFORMACJE O JDG:
Jeśli użytkownik prowadzi lub planuje JDG (jednoosobową działalność gospodarczą), zapytaj o:
- Od którego roku prowadzi/będzie prowadzić JDG
- Ile lat będzie prowadzić JDG
- Ile składki ZUS płaci/będzie płacić miesięcznie (minimum 1646,47 zł)

UWAGA: JDG uwzględniasz w obliczeniach TYLKO gdy użytkownik poda WSZYSTKIE trzy informacje o JDG.

INFORMACJA O SKŁADKACH ZUS:
Składki ZUS od umowy o pracę są naliczane tylko do maksymalnego pułapu rocznego (260 190 zł rocznie, czyli około 21 682 zł miesięcznie brutto). Jeśli ktoś zarabia więcej, składka ZUS i tak jest liczona tylko od tej kwoty maksymalnej.

Nie licz emerytury samodzielnie, jest do tego specjalna akcja, która zrobi to za Ciebie.
`;

    aiUtil.setSystemMessage(basePrompt);
    aiUtilRef.current = aiUtil;
  }, [userInfoPrompt]);

  const suggestedPrompts: SuggestedPrompt[] = [
    {
      id: "2",
      text: "O ile zmniejszy mi się emerytura jeśli pójdę na macierzyński?",
    },
    { id: "3", text: "Kiedy przejść na emeryturę?" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !aiUtilRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      text: "",
      isUser: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      await aiUtilRef.current.streamMessage(
        userMessage.text,
        (chunk: string) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId ? { ...msg, text: msg.text + chunk } : msg
            )
          );
        }
      );
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                text: "Przepraszam, wystąpił błąd podczas generowania odpowiedzi. Spróbuj ponownie.",
              }
            : msg
        )
      );
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedPrompt = async (prompt: string) => {
    if (isLoading || !aiUtilRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: prompt,
      isUser: true,
      timestamp: new Date(),
    };

    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      text: "",
      isUser: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setIsLoading(true);

    try {
      await aiUtilRef.current.streamMessage(prompt, (chunk: string) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, text: msg.text + chunk } : msg
          )
        );
      });
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                text: "Przepraszam, wystąpił błąd podczas generowania odpowiedzi. Spróbuj ponownie.",
              }
            : msg
        )
      );
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col justify-between h-full">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <h3 className="font-semibold text-base-content text-lg">{chatName}</h3>
        <h4 className="font-semibold text-xs text-base-content/70">
          Twój boski doradca emerytalny
        </h4>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`chat ${message.isUser ? "chat-end" : "chat-start"}`}
          >
            <div
              className={`chat-bubble ${
                message.isUser ? "bg-primary text-primary-content" : ""
              }`}
            >
              {message.text.split("\n").map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < message.text.split("\n").length - 1 && <br />}
                </React.Fragment>
              ))}
              {/* Show typing indicator only for the last AI message when loading */}
              {!message.isUser &&
                isLoading &&
                index === messages.length - 1 && (
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="loading loading-dots loading-sm"></div>
                    <span className="opacity-70 text-sm">
                      {chatName} pisze...
                    </span>
                  </div>
                )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="p-4 border-t border-base-300">
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={async () => await handleSuggestedPrompt(prompt.text)}
                disabled={isLoading}
                className="btn-outline btn btn-xs btn-primary text-wrap"
              >
                {prompt.text}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Napisz swoją wiadomość..."
            className="flex-1 input-bordered input input-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="btn btn-primary btn-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
