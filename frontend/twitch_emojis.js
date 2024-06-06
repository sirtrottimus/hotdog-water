export async function checkTwitchStatus({
  twitchClientID,
  twitchClientSecret,
  twitchbroadcasterUsername,
}) {
  // Set up Twitch API
  const twitchAuthUrl = 'https://id.twitch.tv/oauth2/token';
  const twitchStreamUrl = 'https://api.twitch.tv/helix/chat/emotes';

  const authResponse = await fetch(twitchAuthUrl, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: twitchClientID,
      client_secret: twitchClientSecret,
      grant_type: 'client_credentials',
    }),
  });


  const authData = (await authResponse.json())
  const twitchToken = authData.access_token;

  const streamResponse = await fetch(
    `${twitchStreamUrl}?broadcaster_id=${twitchbroadcasterUsername}`,
    {
      headers: {
        'Client-ID': twitchClientID,
        Authorization: `Bearer ${twitchToken}`,
      },
    }
  );

  const streamData = (await streamResponse.json())
  console.log(streamData);
}

const twitchClientID = 'rry34c74ncddj1uwtqn8u7rsdchas6';
const twitchClientSecret = 'dy0lqj4u2jtfhgvd80eszs06g2erco';
const twitchbroadcasterUsername = '21945983';

checkTwitchStatus({
  twitchClientID,
  twitchClientSecret,
  twitchbroadcasterUsername,
}).then((res) => {
  console.log(res);
});
