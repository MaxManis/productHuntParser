const { stringify } = require('./csvStringify');

const jsonToCsv = (apps, nd = '<NO-DATA>') => {
  const res = [
    ['Name', 'PH URL', 'Title', 'Description', 'MainURL', 'Twitter', 'Instagram', 'Facebook', 'Linkedin', 'GitHub', 'Makers']
  ];

  for (const app of apps) {
    const { name, title, description, url, urls, makers } = app;
    let u = {};

    if (urls) {
      u = urls;
    }

    const row = [
      name || nd, url || nd, title || nd, description || nd,
      u.websiteUrl || nd, u.twitterUrl || nd, u.instagramUrl || nd, u.facebookUrl || nd, u.linkedinUrl || nd, u.githubUrl || nd,
      makers && makers.length ? makers.map(m => `${m.name} ===> https://www.producthunt.com/@${m.username}`).join('\n') : nd,
    ];
    res.push(row);
  }

  return stringify(res);
}

module.exports = { jsonToCsv };
