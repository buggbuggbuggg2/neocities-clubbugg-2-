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
  const url = "https://audioscrobbler.com" + method + "&" + urlencode(params) + "&format=json";
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Network response was not ok. Status: ${response.status}`);
  return response.json();
}

function extractImage(imageArray) {
  if (!imageArray || !Array.isArray(imageArray) || imageArray.length === 0) return "";
  // Pull the large size (index 2) if it exists, otherwise medium (index 1)
  const targetImage = imageArray[2] || imageArray[1] || imageArray[0];
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
    console.error("Missing environment variables parameters initialization logs!");
    process.exit(1);
  }

  try {
    let outputData = {
      topTracks: [],
      nowPlaying: null
    };

    // 1. Fetch Weekly Top Tracks
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

    // 2. Fetch Recent Tracks / Current Live Playback Stream Engine Target
    const recentData = await lastfmRequest("user.getrecenttracks", { user: USERNAME, limit: 1 });
    if (recentData && recentData.recenttracks && recentData.recenttracks.track) {
      const tracks = [].concat(recentData.recenttracks.track);
      
      // FIXED HERE: Explicitly grab index 0 out of the array wrapper safely
      const item = tracks[0]; 
      
      if (item && item["@attr"] && item["@attr"].nowplaying === "true") {
        let img = extractImage(item.image);
        if (!img) {
          const artistName = item.artist ? (item.artist["#text"] || item.artist.name) : "";
          img = await getImage(item.name, artistName);
        }
        
        outputData.nowPlaying = {
          id: item.mbid || encodeURIComponent(item.name),
          name: item.name,
          artist: item.artist ? (item.artist["#text"] || item.artist.name) : "Unknown Artist",
          url: item.url,
          image: img
        };
      }
    }

    // Write file directly into root directory execution target location path
    fs.writeFileSync('music-data.json', JSON.stringify(outputData, null, 2));
    console.log("SUCCESS: Created music-data.json asset output file!");

  } catch (error) {
    console.error("CRITICAL CONSOLE RUNTIME ERROR LOG:", error);
    // Write a dummy fallback profile structure schema so the layout displays empty slots safely
    fs.writeFileSync('music-data.json', JSON.stringify({ topTracks: [], nowPlaying: null }, null, 2));
  }
}

main();
