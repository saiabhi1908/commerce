import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.get("/nearby", async (req, res) => {
  const { lat, lng, type } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Latitude and Longitude required" });
  }

  try {
    const baseParams = {
      location: `${lat},${lng}`,
      radius: req.query.radius || 10000, // 10 km default
      type: type || "hospital",
      key: process.env.GOOGLE_API_KEY,
    };

    const nearbyRes = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      { params: baseParams }
    );

    let places = nearbyRes.data.results;

    if (nearbyRes.data.next_page_token) {
      await new Promise((r) => setTimeout(r, 2000));
      const nextPageRes = await axios.get(
        "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
        {
          params: {
            pagetoken: nearbyRes.data.next_page_token,
            key: process.env.GOOGLE_API_KEY,
          },
        }
      );
      places = [...places, ...nextPageRes.data.results];
    }

    places = places.slice(0, 32);

    const detailedPlaces = await Promise.all(
      places.map(async (place) => {
        try {
          const detailsRes = await axios.get(
            "https://maps.googleapis.com/maps/api/place/details/json",
            {
              params: {
                place_id: place.place_id,
                fields: "website",
                key: process.env.GOOGLE_API_KEY,
              },
            }
          );

          const website = detailsRes.data.result.website;
          return { ...place, website: website || null };
        } catch (error) {
          console.error(`Error fetching details for ${place.place_id}`);
          return { ...place, website: null };
        }
      })
    );

    // ✅ Sort so Continental Hospitals come first
    const sortedPlaces = detailedPlaces.sort((a, b) => {
      const aIsContinental = a.name?.toLowerCase().includes("continental") ? -1 : 1;
      const bIsContinental = b.name?.toLowerCase().includes("continental") ? -1 : 1;
      return aIsContinental - bIsContinental;
    });

    res.json({ results: sortedPlaces });
  } catch (error) {
    console.error("Error fetching places:", error.message);
    res.status(500).json({ error: "Error fetching places data" });
  }
});

export default router;
