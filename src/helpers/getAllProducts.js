const fetch = require('node-fetch');
const colors = require('ansi-colors');
const { graphql } = require('../config/config');

const BASE_URL = graphql.mainUrl;
const headersData = graphql.commonHeaders;

const getBody = (cursor = '') => ({
    "operationName": "ComingSoonPage",
    "query": "query ComingSoonPage($cursor:String){upcomingEvents(first:20 after:$cursor){edges{node{id ...UpcomingEventItemFragment __typename}__typename}pageInfo{endCursor hasNextPage __typename}__typename}}fragment UpcomingEventItemFragment on UpcomingEvent{id title truncatedDescription isSubscribed post{id createdAt __typename}product{id slug postsCount followersCount followers(first:3 order:popularity excludeViewer:true){edges{node{id ...UserCircleListFragment __typename}__typename}__typename}...ProductItemFragment __typename}...FacebookShareButtonV6Fragment __typename}fragment ProductItemFragment on Product{id slug name tagline followersCount reviewsCount topics(first:2){edges{node{id slug name __typename}__typename}__typename}...ProductFollowButtonFragment ...ProductThumbnailFragment ...ProductMuteButtonFragment ...FacebookShareButtonV6Fragment ...ReviewStarRatingCTAFragment __typename}fragment ProductThumbnailFragment on Product{id name logoUuid isNoLongerOnline __typename}fragment ProductFollowButtonFragment on Product{id followersCount isSubscribed __typename}fragment ProductMuteButtonFragment on Product{id isMuted __typename}fragment FacebookShareButtonV6Fragment on Shareable{id url __typename}fragment ReviewStarRatingCTAFragment on Product{id slug name isMaker reviewsRating __typename}fragment UserCircleListFragment on User{id ...UserImage __typename}fragment UserImage on User{id name username avatarUrl __typename}",
    "variables": {"cursor": cursor}
});

async function getAllProducts() {
  let cursor = '';
  let isNext = true;
  const res = [];

  console.log(colors.redBright('Start getting all products.'));

  try {
    while (isNext) {
      const rawData = await fetch(BASE_URL, {
        method: 'POST',
        headers: headersData,
        body: JSON.stringify(getBody(cursor))
      }); 
      const data = await rawData.json();
      const events = data.data.upcomingEvents.edges.map(e => e.node);

      console.log(colors.yellowBright(res.length + ' + ' + events.length + ' new products.'));

      res.push(...events);

      const nextInfo = data.data.upcomingEvents.pageInfo;
      if (nextInfo.hasNextPage) {
        cursor = nextInfo.endCursor;
      } else {
        isNext = false;
      }
    }

    console.log(colors.redBright('All products fetched. Total: ' + res.length));

    return res;
  } catch (err) {
    console.error(err);
  }
}

module.exports = { getAllProducts };


// ==============
// Product schema:
const schema = {
  "id": "11370",
  "title": "404 Error Hound",
  "truncatedDescription": "Boost your website’s user experience and SEO by eliminating 404 Errors. Have a…",
  "isSubscribed": false,
  "post": {
      "id": "402857",
      "createdAt": "2023-07-11T00:01:00-07:00",
      "__typename": "Post"
  },
  "product": {
      "id": "513575",
      "slug": "baresquare-for-google-analytics",
      "postsCount": 2,
      "followersCount": 370,
      "followers": {
          "edges": [
              {
                  "node": {
                      "id": "105600",
                      "name": "Farooq (SF Ali) Zafar",
                      "username": "sfali789",
                      "avatarUrl": "https://ph-avatars.imgix.net/105600/1b2f2e5c-2281-4acb-9777-3870f97e90e8",
                      "__typename": "User"
                  },
                  "__typename": "UserEdge"
              },
          ],
          "__typename": "UserConnection"
      },
      "name": "Baresquare",
      "tagline": "Best no-code action engine for your analytics data",
      "reviewsCount": 6,
      "topics": {
          "edges": [
              {
                  "node": {
                      "id": "108",
                      "slug": "analytics",
                      "name": "Analytics",
                      "__typename": "Topic"
                  },
                  "__typename": "TopicEdge"
              },
          ],
          "__typename": "TopicConnection"
      },
      "isSubscribed": false,
      "__typename": "Product",
      "logoUuid": "2247fdc3-214c-459b-9721-b58506994cf1.jpeg",
      "isNoLongerOnline": false,
      "isMuted": false,
      "url": "https://www.producthunt.com/products/baresquare-for-google-analytics",
      "isMaker": false,
      "reviewsRating": 5.0
  },
  "url": "https://www.producthunt.com/products/baresquare-for-google-analytics",
  "__typename": "UpcomingEvent"
};
