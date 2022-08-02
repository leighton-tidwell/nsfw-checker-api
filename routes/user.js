const express = require("express");
const router = express.Router();
const snoowrap = require("snoowrap");

router.post("/", async (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  const { username } = req.body;
  if (!username) return res.send({ error: true });

  const r = new snoowrap({
    userAgent: "web:nsfwchecker.com:v1 (by /u/bloodoodoo)",
    clientId: "cDoiOkedsFQasc0IO5yRUA",
    clientSecret: "Eg7uGQgK0Iv4aFKBFk_aqV4aEV4Z7w",
    // refreshToken: "369167690416-CJ_AsQmXhKHgznKmhfYrsRxhhgcLuA",
    refreshToken: "369167690416-lO0A1j6W62ZrxtcvWn2J4CXlQ9rwIA",
    // accessToken: "369167690416-zw_m8k_pNI9gBTMoFF7kxwrjiZB0fw",
  });

  const userData = await r.getUser(username);
  const userPosts = await userData.getSubmissions({ limit: Infinity });

  const nsfwPosts = userPosts.filter((post) => post.over_18 === true);
  const sfwPosts = userPosts.filter((post) => post.over_18 !== true);
  const percentage = (100 * nsfwPosts.length) / userPosts.length;
  const subredditPostPercentage = [];

  for (const post of userPosts) {
    const findCurrentSubreddit = subredditPostPercentage.find(
      (sub) => sub.name === post.subreddit.display_name
    );

    if (!findCurrentSubreddit) {
      subredditPostPercentage.push({
        name: post.subreddit.display_name,
        totalPosts: 1,
        percentage: (100 * 1) / userPosts.length,
        nsfw: post.over_18,
      });
    } else {
      findCurrentSubreddit.totalPosts++;
      findCurrentSubreddit.percentage =
        (100 * findCurrentSubreddit.totalPosts) / userPosts.length;
    }
  }

  res.send({
    user: username,
    nsfwPosts,
    sfwPosts,
    totalPosts: userPosts.length,
    subredditBreakDown: subredditPostPercentage,
    percentage,
  });
});

module.exports = router;
