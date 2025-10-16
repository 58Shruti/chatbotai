import React from "react";
import "./ProductCard.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const showToast = () => {
    toast("Product added to cart!");
  };

  if (!product) return null;

  // Safe image URL (fallback if undefined)
  const imageUrl = product.image || "";
  return (
    <div className="">
      <div
        className="product-card"
        onClick={() => navigate(`/product-detail/${product.id}`)}
      >
        <div className="product-image">
          {imageUrl && (
            <img
              className="product-image"
              src={imageUrl}
              alt={product.name || "product image"}
            />
          )}
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">{product.description}</p>
          <div className="price">Rs.{product.price}</div>
          <div className="rating">
            {product.rating}/5 ({product.reviews} reviews)
          </div>
          <div className="product-details">
            <div className="category">
              {" "}
              <span>Category:</span> <p>{product.category}</p>
            </div>
            {product.color && (
              <div className="category">
                {" "}
                <span>Color:</span> <p>{product.color}</p>
              </div>
            )}
            {product.design && (
              <div className="category">
                {" "}
                <span>Design:</span> <p>{product.design}</p>
              </div>
            )}
            {product.material && (
              <div className="category">
                {" "}
                <span>Material:</span> <p>{product.material}</p>
              </div>
            )}
            {product.style && (
              <div className="category">
                {" "}
                <span>Style:</span> <p>{product.style}</p>
              </div>
            )}
            <div className="category">
              {product.inStock ? (
                <span style={{ color: "green" }}>In Stock</span>
              ) : (
                <span style={{ color: "red" }}>❌ Out of Stock</span>
              )}
            </div>
            <div className="category">
              <span>Sizes:</span> <p>{product.sizes}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="add_cart_box">
        <button type="button" className="add-cart" onClick={showToast}>
          Add to cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
