import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const HomepageBanner = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/banner/all`);
      setBanners(res.data.data);
    } catch (err) {
      console.error("Error fetching banners", err);
    }
  };

  const getColClass = () => {
    if (banners.length === 1) return "col-12";
    if (banners.length === 2) return "col-md-6";
    if (banners.length === 3) return "col-md-4";
    return "col-md-3";
  };

  return (
    <div className="container p-0">
      <div className="row g-2">
        {banners.map((banner, index) => (
          <div className={getColClass()} key={index}>
            <div
              className="position-relative overflow-hidden"
              style={{
                height: banners.length === 1 ? "100vh" : "300px",
                borderRadius: "10px"
              }}
            >
              {/* Clickable */}
              <Link to={banner.url || "#"}>
                <img
                  src={banner.profileImage}
                  alt={banner.title}
                  className="w-100 h-100"
                  style={{
                    objectFit: "cover",
                    transition: "0.4s"
                  }}
                />
              </Link>

              {/* Dark Overlay */}
              <div
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                 
                }}
              ></div>

              {/* Text Content */}
              <div
                className="position-absolute text-white"
                style={{
                  bottom: "20px",
                  left: "20px"
                }}
              >
                <h4 className="fw-bold">{banner.title}</h4>
                <p className="mb-2">{banner.subtitle}</p>

                {banner.button && (
                  <Link to={banner.url || "#"} className="btn btn-warning btn-sm">
                    {banner.button}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomepageBanner;