const express = require('express');
const path = require('path');
const https = require('https');

const app = express();

app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '../index.html');
  res.sendFile(indexPath);
});

app.get('/style', (req, res) => {
  const aboutPath = path.join(__dirname, '../styles.css');
  res.sendFile(aboutPath);
});

app.get('/script', (req, res) => {
  const scriptPath = path.join(__dirname, '../script.js');
  res.sendFile(scriptPath);
});

app.use('/images', express.static(path.join(__dirname, '../images')));

app.get('/followerCount', async (req, res) => {
  const clientID = 'h6r5jk1n6e4grllpgs77hj1ufs6sqp';
  const streamerUsername = 'filow';
  const oauthToken = '7liz67ney7j22n2f4b4lt7y37rslfh'; // Replace with your Twitch OAuth token

  const options = {
    hostname: 'api.twitch.tv',
    path: `/helix/users?login=${streamerUsername}`,
    headers: {
      'Client-ID': clientID,
      'Authorization': `Bearer ${oauthToken}` // Include the OAuth token in the Authorization header
    }
  };

  const request = https.get(options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      console.log('Received response:', data); // Debug: Log the received response data

      try {
        if (response.statusCode === 200) {
          const { data: userData } = JSON.parse(data);
          console.log('Parsed user data:', userData); // Debug: Log the parsed user data

          if (userData.length > 0) {
            const userId = userData[0].id;
            getFollowerCount(userId);
          } else {
            console.log('Streamer not found!');
            res.send({ error: 'Streamer not found!' });
          }
        } else {
          console.log('Error: Unexpected response status code', response.statusCode);
          res.send({ error: 'Unexpected response from Twitch API' });
        }
      } catch (error) {
        console.log('Error parsing response:', error);
        res.send({ error: 'Error occurred while retrieving the follower count' });
      }
    });
  });

  request.on('error', (error) => {
    console.log('Error occurred during the request:', error);
    res.send({ error: 'Error occurred while retrieving the follower count' });
  });

  function getFollowerCount(userId) {
    const followerOptions = {
      hostname: 'api.twitch.tv',
      path: `/helix/users/follows?to_id=${userId}`,
      headers: {
        'Client-ID': clientID,
        'Authorization': `Bearer ${oauthToken}` // Include the OAuth token in the Authorization header
      }
    };

    const followerRequest = https.get(followerOptions, (followerResponse) => {
      let followerData = '';

      followerResponse.on('data', (chunk) => {
        followerData += chunk;
      });

      followerResponse.on('end', () => {
        console.log('Received follower response:', followerData); // Debug: Log the received follower response data

        try {
          if (followerResponse.statusCode === 200) {
            const { total } = JSON.parse(followerData);
            console.log('Follower count:', total); // Debug: Log the follower count

            res.send({ followerCount: total });
          } else {
            console.log('Error: Unexpected follower response status code', followerResponse.statusCode);
            res.send({ error: 'Unexpected response from Twitch API' });
          }
        } catch (error) {
          console.log('Error parsing follower response:', error);
          res.send({ error: 'Error occurred while retrieving the follower count' });
        }
      });
    });

    followerRequest.on('error', (error) => {
      console.log('Error occurred during the follower request:', error);
      res.send({ error: 'Error occurred while retrieving the follower count' });
    });
  }
});

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});