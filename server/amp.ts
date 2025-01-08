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
        <script async src="https://cdn.ampproject.org/v0.js"></script>

        <!-- AMP Analytics -->
        <script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"></script>

        <!-- AMP Social Share -->
        <script async custom-element="amp-social-share" src="https://cdn.ampproject.org/v0/amp-social-share-0.1.js"></script>

        <!-- AMP Carousel -->
        <script async custom-element="amp-carousel" src="https://cdn.ampproject.org/v0/amp-carousel-0.1.js"></script>

        <!-- SEO Meta Tags -->
        <meta name="description" content="探索教育科技創新，體驗AI驅動的個人化學習體驗。提供跨平台相容性、即時數據分析和豐富的教學資源。">
        <meta name="keywords" content="教育科技,AI學習,個人化教育,教學資源">

        <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
        <noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>

        <style amp-custom>
          /* AMP-compliant styles */
          .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 0 1rem; 
          }
          .bg-background { background-color: #ffffff; }
          .space-y-6 > * + * { margin-top: 1.5rem; }
          .grid { display: grid; gap: 1rem; }
          .font-bold { font-weight: bold; }
          .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
          .card {
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            padding: 1rem;
            background: #fff;
          }
          .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }
          .card-content {
            color: #374151;
          }
          .feature-list {
            list-style-type: disc;
            padding-left: 1.5rem;
          }
        </style>
      </head>
      <body>
        <!-- AMP Analytics configuration -->
        <amp-analytics type="googleanalytics">
          <script type="application/json">
            {
              "vars": {
                "account": "UA-XXXXXXXX-X"
              },
              "triggers": {
                "trackPageview": {
                  "on": "visible",
                  "request": "pageview"
                }
              }
            }
          </script>
        </amp-analytics>

        ${content}

        <!-- Social Share Buttons -->
        <div class="container" style="margin-top: 2rem;">
          <amp-social-share type="twitter" width="45" height="33"></amp-social-share>
          <amp-social-share type="facebook" width="45" height="33"></amp-social-share>
          <amp-social-share type="linkedin" width="45" height="33"></amp-social-share>
          <amp-social-share type="email" width="45" height="33"></amp-social-share>
        </div>
      </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});