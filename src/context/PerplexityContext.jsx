import { useState, useRef, useEffect } from "react";
import { PerplexityContext } from "./PerplexityContext";
import { product } from "../product";
import { shipping } from "../shipping";
import { faqs } from "../faq";

const PERPLEXITY_API_KEY =  import.meta.env.VITE_PERPLEXITY_API_KEY
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
   let cleanText = botResponse


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
      { text: "Sorry, something went wrong. Please try again.", sender: "bot" },
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
DO NOT search the web or use external information. DO NOT add citations or references.

Available data:
- Products: ${JSON.stringify(allData.products)}
- FAQs: ${JSON.stringify(allData.faqs)}
- Shipping: ${JSON.stringify(allData.shipping)}

Instructions:
1. Answer naturally and helpfully using ONLY the provided data.
2. If user asks about products, ALWAYS include a valid JSON block in the following exact format:

[PRODUCTS]
[
  {
    "name": "Pant Model 30",
    "description": "High-quality pants for everyday wear.",
    "price": "₹999",
    "image": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop",
    "category": "Pants",
    "color": "Beige",
    "design": "Solid",
    "material": "Cotton Blend",
    "style": "Chino",
    "rating": "4.0",
    "reviews": "50",
    "inStock": true,
    "sizes": "30, 32, 34, 36",
  }
]

3. Skip irrelevant fields (like IDs). Always use the exact JSON keys shown above.
4. If multiple products match, return all of them in the same array.
5. If no exact product matches the user's query:
   -first include **related products from the same category** in a JSON array called [PRODUCTS].
   -after [PRODUCTS] Include a friendly message, e.g.: "We don’t have red pants, but here are other pants you might like."
6. For FAQs, shipping, or policy answers, respond in plain text (no JSON).
7. Always be friendly and professional.

Question: ${userInput}`,
          },
        ],
        max_tokens: 2000,
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

