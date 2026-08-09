const fs = require('fs');

const API_KEY = process.env.LASTFM_API_KEY;
const USERNAME = process.env.LASTFM_USER;

function urlencode(obj) {
  var str = [];
  for (var p in obj) str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
  return str.join("&");
}

async function lastfmRequest(method, params) {
  params['api_key'] = API_KEY;
  params['format'] = "json";
  const url = "https://ws.audioscrobbler.com/2.0/?method=" + method + "&" + urlencode(params) + "&format=json";
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Network response was not ok. Status: ${response.status}`);
  return response.json();
}

// Safely loops through the image array to look for the medium/large image string
function extractImage(imageArray) {
  if (!imageArray || !Array.isArray(imageArray) || imageArray.length === 0) return "";
  
  // Prefer index 1 (medium) or 2 (large) if they exist
  const targetImage = imageArray[1] || imageArray[0];
  return targetImage ? targetImage["#text"] : "";
}

async function getImage(trackName, artistName) {
  try {
    const data = await lastfmRequest("track.getInfo", { autocorrect: 1, track: trackName, artist: artistName });
    if (data && data.track && data.track.album && data.track.album.image) {
      return extractImage(data.track.album.image);
    }
    return "";
  } catch(e) {
    return "";
  }
}

async function main() {
  if (!API_KEY || !USERNAME) {
    console.error("Missing environment variables!");
    process.exit(1);
  }

  try {
    let outputData = {
      topTracks: [],
      nowPlaying: null
    };

    // 1. Fetch Top Tracks
    const topData = await lastfmRequest("user.gettoptracks", { user: USERNAME, limit: "3", period: "7day" });
    if (topData && topData.toptracks && topData.toptracks.track) {
      const tracks = [].concat(topData.toptracks.track);
      for (let item of tracks) {
        let img = extractImage(item.image);
        if (!img) {
          img = await getImage(item.name, item.artist.name);
        }
        outputData.topTracks.push({
          id: item.mbid || encodeURIComponent(item.name),
          name: item.name,
          artist: item.artist.name,
          url: item.url,
          image: img
        });
      }
    }

    // 2. Fetch Recent/Now Playing Track
    const recentData = await lastfmRequest("user.getrecenttracks", { user: USERNAME, limit: 1 });
    if (recentData && recentData.recenttracks && recentData.recenttracks.track) {
      const tracks = [].concat(recentData.recenttracks.track);
      const item = tracks[0]; 
      
      if (item && item["@attr"] && item["@attr"].nowplaying === "true") {
        let img = extractImage(item.image);
        if (!img) {
          img = await getImage(item.name, item.artist["#text"]);
        }
        outputData.nowPlaying = {
          id: item.mbid || encodeURIComponent(item.name),
          name: item.name,
          artist: item.artist["#text"],
          url: item.url,
          image: img
        };
      }
    }

    // Write clean data directly into root directory
    fs.writeFileSync('music-data.json', JSON.stringify(outputData, null, 2));
    console.log("successfully made music-data.json");

  } catch (error) {
    console.error("error generating music assets:", error);
    // Writes safety layout framework file so browser code doesn't explode 404
    fs.writeFileSync('music-data.json', JSON.stringify({ topTracks: [], nowPlaying: null }, null, 2));
  }
}

main();
