const contentGenerator = require('./utils/contentGenerator.js');

const mainContent = contentGenerator('../content.html');
const pathRoot = process.env.NODE_ENV === 'production' ? 'https://freddycro.herokuapp.com/choropleth-generator' : './';

const author = '楊若榆';

module.exports = {
  publicPath: pathRoot,
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
      title: 'Choropleth Generator | FreddyCro',
      description: '',
      keywords: '',
      author: author,
      datePublished: '2020-06-08T07:00:00+08:00',
      dateModified: '2020-06-08T07:00:00+08:00',
      MONITOR: '',
      CONTENT: mainContent,
      pageUrl: pathRoot,
      mainPage: pathRoot,
      theme: '#ffffff'
    },
  }
}