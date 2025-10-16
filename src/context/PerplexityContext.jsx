import { useState, useRef, useEffect } from "react";
import { PerplexityContext } from "./PerplexityContext";
import { product } from "../product";
import { shipping } from "../shipping";
import { faqs } from "../faq";

const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

export const PerplexityProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Send message function
  const sendMessage = async (inputValue) => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = { text: inputValue, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const botResponse = await callPerplexityAPI(inputValue);

      // Add bot message
      let cleanText = botResponse;

      setMessages((prev) => [
        ...prev,
        {
          text: cleanText,
          sender: "bot",
        },
      ]);
    } catch (err) {
      console.error("Error calling API:", err);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, something went wrong. Please try again.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear chat
  const clearChat = () => setMessages([]);

  // Chat stats
  const getChatStats = () => ({
    totalMessages: messages.length,
    userMessages: messages.filter((m) => m.sender === "user").length,
    botMessages: messages.filter((m) => m.sender === "bot").length,
  });

  // Perplexity API call
  const callPerplexityAPI = async (userInput) => {
    const allData = { products: product, faqs: faqs, shipping: shipping };

    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "user",
            content: `
        You are an ecommerce chatbot. Answer this question: "${userInput}" using ONLY the provided data below. 
        If the user asks about products, include a marker "[PRODUCTS]" at the start of your response. 
        DO NOT search the web or use external information. 
        DO NOT add citations or references.
        You MUST follow these rules exactly:
      1. Answer naturally and helpfully using ONLY the provided data.
      2. Product queries:
          - ALWAYS return one [PRODUCTS] block if products are asked.
          - Inside it, return a JSON array of products in this schema:
          [
           {
            "id": "...",
            "name": "...",
            "description": "...",
            "price": "...",
            "image": "...",
            "category": "...",
            "color": "...",
            "design": "...",
            "material": "...",
            "style": "...",
            "rating": "...",
            "reviews": "...",
            "inStock": true,
            "sizes": "..."
            }
          ]
           - If the requested product does not exist:
              → Instead of an empty array, return RELATED products from the same category.
              → Example: If user asks for "red pants" but no red pants exist, return pants of other colors in the [PRODUCTS] block.
              → If multiple products match, return all of them in the same array.
           - After the JSON block, you may add a friendly message.

      3. FAQs or shipping queries:
           - Answer in plain text (no [PRODUCTS]).

        Important rules:
           - Never output multiple [PRODUCTS] blocks.
           - Never output plain text product lists.
           - Never return an empty [PRODUCTS] array.

      4. Always be friendly and professional.

        Available data:
        Products: ${JSON.stringify(allData.products)}
        FAQs: ${JSON.stringify(allData.faqs)}
        Shipping: ${JSON.stringify(allData.shipping)}

        Question: ${userInput}
     `,
          },
        ],
        max_tokens: 1500,
        temperature: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Perplexity returns choices[0].message.content
    return data.choices?.[0]?.message?.content || "No response from model.";
  };

  const value = {
    messages,
    isLoading,
    messagesEndRef,
    sendMessage,
    clearChat,
    getChatStats,
  };

  return (
    <PerplexityContext.Provider value={value}>
      {children}
    </PerplexityContext.Provider>
  );
};
