/** Express router providing Demo related routes
 * @module Router
 * @type {import('express')}
 */
import Router from "express";

/**
 * @typedef {import('./bitly-demo.controller.js')}
 */
import demoController from "./twitter-demo.controller.js";

/**
 * Express router for demo related operations
 * @type {import('express').Router}
 * @const
 * @namespace router
 */
const router = Router();

router.get(
  "/demo/twitter/trends/available.json",
  demoController.getTrendsAvailable
);

router.get(
  "/demo/twitter/trends/place.json",
  demoController.getTrendsPlaces.bind(demoController)
);

router.get(
  "/demo/twitter/users/search.json",
  demoController.searchUsers.bind(demoController)
);

router.get(
  "/demo/twitter/friends/list.json",
  demoController.friendsList.bind(demoController)
);

router.get(
  "/demo/twitter/followers/list.json",
  demoController.followersList.bind(demoController)
);

router.get(
  "/demo/twitter/statuses/user_timeline.json",
  demoController.getUserTweets.bind(demoController)
);

router.post(
  "/demo/twitter/friendships/create.json",
  demoController.createFriendShips.bind(demoController)
);

router.post(
  "/demo/twitter/friendships/destroy.json",
  demoController.destroyFriendShips.bind(demoController)
);

export default router;
