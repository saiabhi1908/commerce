import React, { useEffect, useState } from "react";
import axios from "axios";

const NearbyHospitals = ({ lat, lng }) => {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    if (lat && lng) {
      axios
        .get(`https://commerce-v9e9.onrender.com/api/places/nearby?lat=${lat}&lng=${lng}`)
        .then((response) => setPlaces(response.data.results))
        .catch((error) => console.error("Error fetching places:", error));
    }
  }, [lat, lng]);

  return (
    <div style={styles.hospitalsContainer}>
      <h2 style={styles.title}>Nearby Hospitals</h2>
      <div style={styles.hospitalList}>
        {places.length > 0 ? (
          places.map((place) => {
            const isContinental =
              place.name?.toLowerCase().includes("continental");

            return (
              <a
                key={place.place_id}
                href={
                  place.website ||
                  `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
                }
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    ...styles.hospitalCard,
                    border: isContinental
                      ? "2px solid #007BFF"
                      : styles.hospitalCard.border,
                  }}
                >
                  <h3 style={styles.hospitalName}>
                    {place.name}
                    {isContinental && (
                      <span style={styles.continentalBadge}> ★</span>
                    )}
                  </h3>
                  <p style={styles.hospitalVicinity}>{place.vicinity}</p>
                  <p style={styles.hospitalRating}>
                    ⭐ {place.rating || "N/A"}
                  </p>
                </div>
              </a>
            );
          })
        ) : (
          <p>No hospitals found nearby.</p>
        )}
      </div>
    </div>
  );
};

// Styles
const styles = {
  hospitalsContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "'Times New Roman', serif",
    color: "#333",
  },
  title: {
    textAlign: "center",
    fontSize: "1.5rem",
    color: "#333",
    marginBottom: "20px",
    fontWeight: "500",
  },
  hospitalList: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginTop: "20px",
  },
  hospitalCard: {
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "8px",
    boxShadow: "0 3px 8px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    textAlign: "center",
  },
  hospitalName: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#007BFF",
    marginBottom: "6px",
    lineHeight: "1.3",
  },
  continentalBadge: {
    color: "#FF5722",
    marginLeft: "6px",
    fontSize: "1.1rem",
  },
  hospitalVicinity: {
    fontSize: "0.85rem",
    color: "#555",
    marginBottom: "6px",
  },
  hospitalRating: {
    fontSize: "0.9rem",
    color: "#FFB400",
    fontWeight: "500",
  },
};

export default NearbyHospitals;
