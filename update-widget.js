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
  if (!response.ok) throw new Error('Network response was not ok.');
  return response.json();
}

async function getImage(trackName, artistName) {
  try {
    const data = await lastfmRequest("track.getInfo", { autocorrect: 1, track: trackName, artist: artistName });
    if (data && data.track && data.track.album && data.track.album.image) {
      return data.track.album.image[1]["#text"] || "";
    }
    return "";
  } catch(e) {
    return ""; // Fallback if no album art found
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
      // Force data into a flat array structure safely
      const tracks = [].concat(topData.toptracks.track);
      for (let item of tracks) {
        let img = (item.image && item.image[1]) ? item.image[1]["#text"] : "";
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
      // Safely grab the first track even if Last.fm changes array structure
      const tracks = [].concat(recentData.recenttracks.track);
      const item = tracks[0];
      
      if (item && item["@attr"] && item["@attr"].nowplaying === "true") {
        let img = (item.image && item.image[1]) ? item.image[1]["#text"] : "";
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

    // Write everything to a file that Neocities will upload
    fs.writeFileSync('music-data.json', JSON.stringify(outputData, null, 2));
    console.log("successfully made music-data.json");

  } catch (error) {
    console.error("error generating music assets:", error);
    // Write an empty layout file fallback so your deployment step doesn't crash 404
    fs.writeFileSync('music-data.json', JSON.stringify({ topTracks: [], nowPlaying: null }, null, 2));
  }
}

main();
