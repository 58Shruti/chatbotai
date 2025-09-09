import React, { useState, useRef, useEffect } from "react";
import { product } from "../product";
import { shipping } from "../shipping";
import { faqs } from "../faq";
import { PerplexityContext } from "./PerplexityContext";
import {
  colorWords,
  designWords,
  faqKeywords,
  greetings,
  materialWords,
  orderKeywords,
  styleWords,
} from "../Common";

const PERPLEXITY_API_KEY =  import.meta.env.VITE_PERPLEXITY_API_KEY
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

//  Helpers
const extractMaxPrice = (input) => {
  const regex = /(under|below|less\s+than|products\s+under)\s+(\d+)/i;
  const match = input.match(regex);
  return match ? parseInt(match[2]) : null;
};

const mapInputToCategory = (input) => {
  const lower = input.toLowerCase();
  if (
    ["tees", "tee", "tshirt", "t-shirt", "t-shirts"].some((w) =>
      lower.includes(w)
    )
  )
    return "tees";
  if (["shirts", "shirt"].some((w) => lower.includes(w))) return "shirts";
  if (["pants", "pant"].some((w) => lower.includes(w))) return "pants";
  if (["jeans", "jean"].some((w) => lower.includes(w))) return "jeans";
  return null;
};

const checkVariantSize = (item, requestedSize) => {
  if (!requestedSize) return true;

  const labelSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  const reqSize = String(requestedSize).trim().toUpperCase();
  const isLabelSize = labelSizes.includes(reqSize);
  const isNumericSize = !isNaN(Number(reqSize));

  return item.variants.some((variant) => {
    const variantSize = String(variant.size).trim().toUpperCase();
    if (
      ["TEES", "SHIRTS"].includes(item.category.toUpperCase()) &&
      isLabelSize
    ) {
      return variantSize === reqSize;
    }
    if (
      ["JEANS", "PANTS"].includes(item.category.toUpperCase()) &&
      isNumericSize
    ) {
      return Number(variantSize) === Number(reqSize);
    }
    return variantSize === reqSize;
  });
};

// Context Provider Component
export const PerplexityProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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
            content: `You are an ecommerce chatbot. Answer this question: "${userInput}" using ONLY the provided data below. DO NOT search the web or use external information. DO NOT add any citations or references.

Available data:
- Products: ${JSON.stringify(allData.products)}
- FAQs: ${JSON.stringify(allData.faqs)}
- Shipping: ${JSON.stringify(allData.shipping)}

Instructions:
1. Answer naturally and helpfully using ONLY the provided data
2. If user asks about shipping/orders, format response nicely (bullet points, grouped by status)
3. Handle return/cancel/policies strictly from FAQ
4. If no relevant data, say you don’t have that information
5. Always be friendly and professional

Question: ${userInput}`,
          },
        ],
        max_tokens: 1000,
        temperature: 1,
      }),
    });

    if (!response.ok)
      throw new Error(
        `Perplexity API error: ${response.status} - ${response.statusText}`
      );

    const data = await response.json();
    return data.choices[0].message.content;
  };

  //  Main Message Handler
 const sendMessage = async (inputValue) => {
  if (inputValue.trim() === "") return;

  const userMessage = { text: inputValue, sender: "user" };
  setMessages((prev) => [...prev, userMessage]);
  setIsLoading(true);

  try {
    const lowerCaseInput = inputValue.toLowerCase();

    // Greetings
    const isGreeting = greetings.some((greet) => new RegExp(`\\b${greet}\\b`, "i").test(lowerCaseInput));
    if (isGreeting) {
      setMessages((prev) => [
        ...prev,
        {
          text: "Hello! 👋 How can I help you today? You can ask me about products, sizes, orders, or policies.",
          sender: "bot",
          products: [],
        },
      ]);
      return;
    }

    // Extract filters
    const requestedCategory = mapInputToCategory(lowerCaseInput);
    const requestedColor = colorWords.find((w) => lowerCaseInput.includes(w));
    const requestedDesign = designWords.find((w) => lowerCaseInput.includes(w));
    const requestedStyle = styleWords.find((w) => lowerCaseInput.includes(w));
    const requestedMaterial = materialWords.find((w) => lowerCaseInput.includes(w));
    const sizeMatch = lowerCaseInput.match(/\b(XS|S|M|L|XL|XXL|XXXL|\d{2,3})\b/i);
    const requestedSize = sizeMatch ? sizeMatch[1].toUpperCase() : null;
    const maxPrice = extractMaxPrice(lowerCaseInput);

    const filters = {
      category: requestedCategory,
      color: requestedColor,
      design: requestedDesign,
      style: requestedStyle,
      material: requestedMaterial,
      size: requestedSize,
      maxPrice,
    };

    // Order/FAQ queries
    const normalizedInput = lowerCaseInput.replace(/[^\w\s]/gi, "");
    const isOrderQuery = orderKeywords.some((kw) => lowerCaseInput.includes(kw));
    const isFaqQuery = faqKeywords.some((kw) => normalizedInput.includes(kw.toLowerCase()));

    if (isOrderQuery || isFaqQuery) {
      const botResponseText = await callPerplexityAPI(inputValue);
      setMessages((prev) => [
        ...prev,
        { text: botResponseText, sender: "bot", products: [] },
      ]);
      return;
    }

    // Check if any filter is actually applied
    const hasActiveFilters = Object.values(filters).some(
      (v) => v !== null && v !== undefined
    );

    let productMatches = [];
    if (hasActiveFilters) {
      productMatches = product.filter((item) =>
        Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          switch (key) {
            case "category":
              return item.category.toLowerCase() === value;
            case "color":
              return item.color.toLowerCase().includes(value);
            case "design":
              return item.design.toLowerCase().includes(value);
            case "style":
              return item.style.toLowerCase().includes(value);
            case "material":
              return item.material.toLowerCase().includes(value);
            case "size":
              return checkVariantSize(item, value);
            case "maxPrice":
              return item.price <= value;
            default:
              return true;
          }
        })
      );
    }

    if (productMatches.length > 0) {
      setMessages((prev) => [...prev, { text: "", sender: "bot", products: productMatches }]);
    } else if (requestedCategory) {
      const similar = product.filter((p) => p.category.toLowerCase() === requestedCategory);
      if (similar.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            text: `Required product is not available, but you can see similar ${requestedCategory}:`,
            sender: "bot",
            products: similar,
          },
        ]);
      } else {
        setMessages((prev) => [...prev, { text: `Sorry, no ${requestedCategory} found.`, sender: "bot", products: [] }]);
      }
    } 
    //  NEW fallback for gibberish / no matches
    else if (
      !requestedCategory &&
      !requestedColor &&
      !requestedDesign &&
      !requestedStyle &&
      !requestedMaterial &&
      !requestedSize &&
      !maxPrice &&
      !isOrderQuery &&
      !isFaqQuery
    ) {
      setMessages((prev) => [
        ...prev,
        {
          text: `I couldn’t understand your request. 🤔  
Here are some things I can help you with:  
\n• Explore products – find details on sizes, colors, features, and availability.  
• Check shipping information – get real-time updates on delivery times, costs, and international shipping options.  
• Track your order – receive the latest status of your package.  
• Manage returns and exchanges – understand the process, initiate returns, and learn about refund timelines.  
• Personalized shopping – get product recommendations based on your preferences.`,
          sender: "bot",
          products: [],
        },
      ]);
    } 
    else {
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, no products found matching your criteria.", sender: "bot", products: [] },
      ]);
    }
  } catch (error) {
    console.error("Error communicating with Perplexity API:", error);
    setMessages((prev) => [
      ...prev,
      { text: "Sorry, I'm having trouble understanding right now. Can you please rephrase?", sender: "bot" },
    ]);
  } finally {
    setIsLoading(false);
  }
};


  const clearChat = () => setMessages([]);
  const getChatStats = () => ({
    totalMessages: messages.length,
    userMessages: messages.filter((m) => m.sender === "user").length,
    botMessages: messages.filter((m) => m.sender === "bot").length,
  });

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
