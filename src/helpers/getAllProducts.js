const fetch = require('node-fetch');
const colors = require('ansi-colors');

const BASE_URL = 'https://www.producthunt.com/frontend/graphql';

const getBody = (cursor = '') => ({
    "operationName": "ComingSoonPage",
    "query": "query ComingSoonPage($cursor:String){upcomingEvents(first:20 after:$cursor){edges{node{id ...UpcomingEventItemFragment __typename}__typename}pageInfo{endCursor hasNextPage __typename}__typename}}fragment UpcomingEventItemFragment on UpcomingEvent{id title truncatedDescription isSubscribed post{id createdAt __typename}product{id slug postsCount followersCount followers(first:3 order:popularity excludeViewer:true){edges{node{id ...UserCircleListFragment __typename}__typename}__typename}...ProductItemFragment __typename}...FacebookShareButtonV6Fragment __typename}fragment ProductItemFragment on Product{id slug name tagline followersCount reviewsCount topics(first:2){edges{node{id slug name __typename}__typename}__typename}...ProductFollowButtonFragment ...ProductThumbnailFragment ...ProductMuteButtonFragment ...FacebookShareButtonV6Fragment ...ReviewStarRatingCTAFragment __typename}fragment ProductThumbnailFragment on Product{id name logoUuid isNoLongerOnline __typename}fragment ProductFollowButtonFragment on Product{id followersCount isSubscribed __typename}fragment ProductMuteButtonFragment on Product{id isMuted __typename}fragment FacebookShareButtonV6Fragment on Shareable{id url __typename}fragment ReviewStarRatingCTAFragment on Product{id slug name isMaker reviewsRating __typename}fragment UserCircleListFragment on User{id ...UserImage __typename}fragment UserImage on User{id name username avatarUrl __typename}",
    "variables": {"cursor": cursor}
});
const headersData = {
  'Cookie': 'first_visit=1688984423; first_referer=; _delighted_web={%2271AaKmxD4TpPsjYW%22:{%22_delighted_fst%22:{%22t%22:%221688984424133%22}}}; _ga=GA1.1.747579129.1688984424; ajs_anonymous_id=28cb0aad-71ea-4126-b3d9-b2c427233658; intercom-id-fe4ce68d4a8352909f553b276994db414d33a55c=0661fcb0-841c-4ed8-8a7e-7f22d67e22bc; intercom-session-fe4ce68d4a8352909f553b276994db414d33a55c=; intercom-device-id-fe4ce68d4a8352909f553b276994db414d33a55c=7c9f4411-2228-4707-b468-750e03398cfd; _hjSessionUser_3508551=eyJpZCI6ImY1OTJjYzZjLWEwMTItNWJmOC04NzRmLWVlOWRmYzU1ZjIyOCIsImNyZWF0ZWQiOjE2ODg5ODQ0MjQ3MjksImV4aXN0aW5nIjp0cnVlfQ==; visitor_id=7c39b1db-cf04-46d2-b216-134e9dcbddf9; track_code=53d4318eac; _ga_WZ46833KH9=GS1.1.1688988990.2.1.1688989056.60.0.0; csrf_token=is6Smnz8Vfq2J46KEqslrMnZgEzhQt4wkff3wYXoFkRwngZzTwpnVwwRlyqCuP8eVrkg2tMzrG_fEnGcIxBf3g; _producthunt_session_production=IJec7L9cva%2B5w%2FxLZPz9Azhw%2B1LVw%2BDHviJUM2Eo3OEYip8g5nZN0M95hskAPh6MMuvA2IKQWYMegcDHllQE0rfgHaWwjAGdQQhTzFk1QSufmlRbbhF%2B8L9%2FfgjVW2qr7KFNB3UR%2FNweaS688uHU63LcvoqBvnOvKVJkDiw8ggm92nMcqVDp5QcdBjaqzJ%2BbWE6HmaQdMGtsIXKw9nXLqVVR4OZFPotCd4ONfrDRFTQIbyW5RMu6VcduuNbQ2H076SFTJCYiKmAOcgnvg26fIzbw2M5Af5eaGnWUv3xMBnNGZj0M0D1qYHGNIUwc%2BMwiE5jg%2BOIAvrINFBCkwQ%3D%3D--7MqIgVDt%2FafIbk8I--juFzMEzHelIzFu0C8ZhgAw%3D%3D',
  'Content-Type': 'application/json'
};

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
