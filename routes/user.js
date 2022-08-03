const express = require("express");
const router = express.Router();
const snoowrap = require("snoowrap");
require("dotenv").config();

router.post("/", async (req, res, next) => {
  const { username } = req.body;
  if (!username)
    return res.status(400).send({ message: "A username is required!" });

  const r = new snoowrap({
    userAgent: process.env.USER_AGENT,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
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
