import React from "react";
import { useParams } from "react-router-dom";
import { product } from "../product";
import "./CardPage.css"; //  CSS file
import { toast } from "react-toastify";
// import chatbotVector from '../assets/chatbotVector';

const CardPage = () => {
  const { id } = useParams();
  const pdSelectedItem = product?.find((item) => item?.id === id);

  if (!pdSelectedItem) {
    return <h2 className="pd-not-found">Product not found</h2>;
  }

  const showToast = () => {
    toast("Product added to cart!");
  };

  return (
    <div className="detail_content_box">
    <div className="detail_product_container">
        <div className="detail_img">
          <img
            src={pdSelectedItem.image}
            alt={pdSelectedItem.name}
            className="pd-img"
          />
        </div>
        <div className="detail_contain">
          <div className="pd-info">
            <h1 className="pd-title">{pdSelectedItem.name}</h1>
            <p className="pd-desc">{pdSelectedItem.description}</p>

            <div className="pd-meta">
              <p>
                <strong>Category:</strong> {pdSelectedItem.category}
              </p>
              <p>
                <strong>Material:</strong> {pdSelectedItem.material}
              </p>
              <p>
                <strong>Price:</strong> ₹{pdSelectedItem.price}
              </p>
              <p>
                <strong>Rating:</strong> ⭐ {pdSelectedItem.rating} (
                {pdSelectedItem.reviews} reviews)
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {pdSelectedItem.inStock ? (
                  <span className="pd-stock-yes">✅ In Stock</span>
                ) : (
                  <span className="pd-stock-no">❌ Out of Stock</span>
                )}
              </p>
            </div>

            <h3 className="pd-variant-heading">Available Sizes</h3>
            <ul className="pd-variant-list">
              {pdSelectedItem.variants.map((v) => (
                <li key={v.id} className="pd-variant-item">
                  <span>Size: {v.size}</span>
                  <span>₹{v.price}</span>
                  <span
                    className={`pd-variant-status ${
                      v.inStock ? "pd-available" : "pd-unavailable"
                    }`}
                  >
                    {v.inStock ? "Available" : "Out of Stock"}
                  </span>
                </li>
              ))}
            </ul>

            <button className="pd-cart-btn" type="button" onClick={showToast}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
      </div>
   
  );
};

export default CardPage;
