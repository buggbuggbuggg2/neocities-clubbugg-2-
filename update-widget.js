const fs = require('fs');

const API_KEY = process.env.LASTFM_API_KEY;
const USERNAME = process.env.LASTFM_USER;

async function lastfmRequest(method, params = {}) {
  const query = new URLSearchParams({
    method,
    api_key: API_KEY,
    format: 'json',
    ...params
  });

  const url = `https://ws.audioscrobbler.com/2.0/?${query.toString()}`;

  console.log(
    'Last.fm request:',
    url.replace(API_KEY, '[REDACTED]')
  );

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Last.fm HTTP error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(
      `Last.fm API error ${data.error}: ${data.message}`
    );
  }

  return data;
}

function extractImage(imageArray) {
  if (
    !imageArray ||
    !Array.isArray(imageArray) ||
    imageArray.length === 0
  ) {
    return '';
  }

  const targetImage =
    imageArray[2] ||
    imageArray[1] ||
    imageArray[0];

  return targetImage ? targetImage['#text'] : '';
}

async function getImage(trackName, artistName) {
  try {
    const data = await lastfmRequest('track.getInfo', {
      autocorrect: '1',
      track: trackName,
      artist: artistName
    });

    if (
      data &&
      data.track &&
      data.track.album &&
      data.track.album.image
    ) {
      return extractImage(data.track.album.image);
    }

    return '';
  } catch (error) {
    console.error(
      `Could not get album image for ${artistName} - ${trackName}:`,
      error.message
    );

    return '';
  }
}

async function main() {
  if (!API_KEY || !USERNAME) {
    console.error(
      'Missing LASTFM_API_KEY or LASTFM_USER environment variables!'
    );
    process.exit(1);
  }

  try {
    const outputData = {
      topTracks: [],
      nowPlaying: null
    };

    // ============================================================
    // 1. FETCH WEEKLY TOP TRACKS
    // ============================================================

    const topData = await lastfmRequest('user.gettoptracks', {
      user: USERNAME,
      limit: '3',
      period: '7day'
    });

    if (
      topData &&
      topData.toptracks &&
      topData.toptracks.track
    ) {
      const tracks = [].concat(topData.toptracks.track);

      for (const item of tracks) {
        let img = extractImage(item.image);

        if (!img) {
          img = await getImage(
            item.name,
            item.artist.name
          );
        }

        outputData.topTracks.push({
          id:
            item.mbid ||
            encodeURIComponent(item.name),

          name: item.name,

          artist: item.artist.name,

          url: item.url,

          image: img
        });
      }
    }

    // ============================================================
    // 2. FETCH RECENT TRACKS / NOW PLAYING
    // ============================================================

    const recentData = await lastfmRequest(
      'user.getrecenttracks',
      {
        user: USERNAME,
        limit: '1'
      }
    );

    if (
      recentData &&
      recentData.recenttracks &&
      recentData.recenttracks.track
    ) {
      const tracks = [].concat(
        recentData.recenttracks.track
      );

      const item = tracks[0];

      if (
        item &&
        item['@attr'] &&
        item['@attr'].nowplaying === 'true'
      ) {
        let img = extractImage(item.image);

        const artistName = item.artist
          ? (
              item.artist['#text'] ||
              item.artist.name ||
              ''
            )
          : '';

        if (!img) {
          img = await getImage(
            item.name,
            artistName
          );
        }

        outputData.nowPlaying = {
          id:
            item.mbid ||
            encodeURIComponent(item.name),

          name: item.name,

          artist:
            artistName || 'Unknown Artist',

          url:
            item.url || '#',

          image: img
        };

        console.log(
          `NOW PLAYING DETECTED: ${artistName} - ${item.name}`
        );
      } else {
        console.log(
          'Last.fm returned recent tracks, but nothing is currently playing.'
        );
      }
    }

    // ============================================================
    // 3. WRITE JSON FILE
    // ============================================================

    fs.writeFileSync(
      'music-data.json',
      JSON.stringify(outputData, null, 2)
    );

    console.log(
      'SUCCESS: Created music-data.json asset output file!'
    );

    console.log(
      'Now Playing:',
      outputData.nowPlaying
    );

    console.log(
      'Top Tracks:',
      outputData.topTracks.length
    );

  } catch (error) {
    console.error(
      'CRITICAL CONSOLE RUNTIME ERROR:',
      error
    );

    // Safe fallback so the website still gets valid JSON.
    fs.writeFileSync(
      'music-data.json',
      JSON.stringify(
        {
          topTracks: [],
          nowPlaying: null
        },
        null,
        2
      )
    );

    process.exit(1);
  }
}

main();