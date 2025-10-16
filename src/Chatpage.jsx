import React, { useState } from "react";
import "./Chatpage.css"; // Import the CSS file for styling
import { usePerplexity } from "./context/usePerplexity"; // Using Perplexity hook
import ProductCard from "./components/ProductCard";
import bgimg from "./assets/Chatbot-Flat-Vector.png";
import ChatBg from "./assets/chatbg.png";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function Chatpage() {
  const { messages, isLoading, messagesEndRef, sendMessage } = usePerplexity(); // Using Perplexity hook
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="chat-container">
      <img src={bgimg} className="bgimg" alt="" />
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-7 d-flex align-items-center justify-content-center">
            <div className="chat-header">
              <h4>E-Commerce Chatbot Shop Smarter</h4>
              <p>
                Our E-commerce Chatbot is a smart, interactive assistant
                designed to make online shopping easier, faster, and more
                enjoyable. Whether you’re browsing for the perfect product,
                checking shipping options, tracking your order, or learning
                about our return policies, the chatbot is available 24/7 to
                guide you every step of the way.
              </p>

              <p>
                Instead of waiting on customer support or searching through
                FAQs, you can simply type your question and get instant,
                accurate answers. The chatbot can help you:
              </p>

              <ul>
                <li>
                  <b>Explore products</b> – find details on sizes, colors,
                  features, and availability.
                </li>
                <li>
                  <b>Check shipping information</b> – get real-time updates on
                  delivery times, costs, and international shipping options.
                </li>
                <li>
                  <b>Track your order</b> – receive the latest status of your
                  package without needing order numbers or emails.
                </li>
                <li>
                  <b>Manage returns and exchanges</b> – understand the process,
                  initiate returns, and learn about refund timelines.
                </li>
                <li>
                  <b>Personalized shopping</b> – get product recommendations
                  tailored to your needs.
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-5 d-flex align-items-center justify-content-center">
            <div className="chat-wrapper">
              <div className="chat-window">
                <div className="chat-messages">
                  {messages.length === 0 && (
                    <div className="chatbg">
                      <img src={ChatBg} alt="chat background" />
                    </div>
                  )}
                  {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                      {msg.sender === "bot" ? (
                        (() => {
                          const text = msg.text || "";
                          let products = [];
                          let extraText = "";

                          if (text.startsWith("[PRODUCTS]")) {
                            try {
                              // Remove the [PRODUCTS] prefix and trim
                          const jsonPart = text.replace("[PRODUCTS]", "").trim();
                          const arrayMatches = [...jsonPart.matchAll(/\[.*?\]/gs),];
                              if (arrayMatches.length > 0) {
                            const lastArray = arrayMatches[arrayMatches.length - 1][0]; // pick the last array
                                products = JSON.parse(lastArray);
                            extraText = jsonPart.replace(lastArray, "").trim();
                              }
                            } catch (e) {
                              console.error(
                                "Failed to parse products JSON:",
                                e,
                                "\nOriginal text:",
                                text
                              );
                            }
                          }

                          return (
                            <div>
                              {/* Render any extra text after product array */}
                              {extraText && (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {extraText}
                                </ReactMarkdown>
                              )}

                              {/* Render product cards if products found */}
                              {products.length > 0 && (
                                <div className="product-cards-container">
                                  {products.map((product, i) => (
                                    <ProductCard key={i} product={product} />
                                  ))}
                                </div>
                              )}

                              {/* If no products, render text as normal */}
                              {products.length === 0 && !extraText && (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {text}
                                </ReactMarkdown>
                              )}
                            </div>
                          );
                        })()
                      ) : (
                        <p>{msg.text}</p>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="message loading">
                      <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="chat-input-container">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything about our products and services..."
                  className="chat-input"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="send-button"
                  disabled={isLoading || !inputValue.trim()}
                >
                  {isLoading ? (
                    <>
                      <span className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </span>
                      Sending...
                    </>
                  ) : (
                    <>Send Message</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatpage;
