import express from 'express';
import * as ReactDOMServer from 'react-dom/server';
import * as React from 'react';
import { AmpHome } from '../client/src/pages/amp/Home';

export const ampRouter = express.Router();

ampRouter.get('/', (_req, res) => {
  const content = ReactDOMServer.renderToString(React.createElement(AmpHome));
  const html = `
    <!doctype html>
    <html ⚡>
      <head>
        <meta charset="utf-8">
        <title>教育科技創新專區 - AMP Version</title>
        <link rel="canonical" href="https://smes.tyc.edu.tw">
        <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
        <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
        <noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
        <script async src="https://cdn.ampproject.org/v0.js"></script>
        <style amp-custom>
          /* Add your AMP-compliant CSS here */
          .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
          .bg-background { background-color: #ffffff; }
          .space-y-6 > * + * { margin-top: 1.5rem; }
          .grid { display: grid; gap: 1rem; }
          .font-bold { font-weight: bold; }
          .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});