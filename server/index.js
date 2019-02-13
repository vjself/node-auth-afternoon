const express = require("express");
const app = express();
const session = require("express-session");

app.use(
  session({
    secret: "kookookachoo",
    resave: false,
    saveUninitialized: false
  })
);

app.get("/callback", (req, res) => {
  let payload = {
    client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    code: req.query.code,
    grant_type: "authorization_code",
    redirect_uri: `http://${req.headers.host}/callback`
  };

  tradeCodeForAccessToken = () => {
    return axios.post(
      `https://${process.env.REACT_APP_AUTH0_DOMAIN}/oauth/token`,
      payload
    );
  };

  tradeAccessTokenForUserInfo = accessTokenResponse => {
    const accessToken = accessTokenResponse.data.access_token;
    return axios.get(
      `https://${
        process.env.REACT_APP_AUTH0_DOMAIN
      }/userinfo/?access_token=${accessToken}`
    );
  };

  setUserToSessionGetAuthAccessToken = userInfoResponse => {
    req.session.user = userInfoResponse.data;

    body = {
      grant_type: "client_credentials",
      client_id: process.env.AUTH0_API_CLIENT_ID,
      client_secret: process.env.AUTH0_API_CLIENT_SECRET,
      audience: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/`
    };

    return axios.post(
      `https://${process.env.REACT_APP_AUTH0_DOMAIN}/oauth/token`,
      body
    );
  };

  getGitAccessToken = authAccessTokenResponse => {
    let options = {
      headers: {
        authorization: `Bearer ${authAccessTokenResponse.data.access_token}`
      }
    };
    return axios.get(
      `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users/${
        req.session.user.sub
      }`,
      options
    );
  };
});

app.get("/api/star", (req, res) => {
  const { gitUser, gitRepo } = req.query;
  axios
    .put(
      `https://api.github.com/user/starred/${gitUser}/${gitRepo}?access_token=${
        req.session.access_token
      }`
    )
    .then(res => {
      res.status(200).end();
    })
    .catch(err => console.log(err));
});

app.get("/api/unstar", (req, res) => {
  const { gitUser, gitRepo } = req.query;
  axios
    .delete(
      `https://api.github.com/user/starred/${gitUser}/${gitRepo}?access_token=${
        req.session.access_token
      }`
    )
    .then(res => {
      res.status(200).end();
    })
    .catch(err => console.log("error", err));
});

app.get("/api/user-data", (req, res) => {
  res.status(200).json(req.session.user);
});

app.get("/api/logout", (req, res) => {
  req.session.destroy();
  res.send("logged out");
});

const port = 4000;
app.listen(port, () => {
  console.log(`Server popped off on ${port}`);
});
