#!/usr/bin/env node
//@ts-check

const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const cors = require('cors');

const wss = new WebSocket.Server({ noServer: true });
const {
  setupWSConnection,
  getPersistenceDocPmJsonString,
  logger
} = require('./utils.js');
const app = express();

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 2048;

app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://bib.techdict.pro'
        : ['http://localhost:3000']
  })
);

app.get('/ydoc/:name', (req, resp) => {
  const docName = req.params.name;
  getPersistenceDocPmJsonString(docName)
    .then((data) => {
      resp.json({
        responseOk: true,
        message: `获取文档 ${docName} 成功！`,
        data
      });
    })
    .catch((err) => {
      logger.error(`获取文档 ${docName} 失败... ${err}`);
    });
});

wss.on('connection', setupWSConnection);

const server = http.createServer(app);
server.on('upgrade', (request, socket, head) => {
  /** @param {WebSocket} ws */
  const before_connection = (ws) => {
    // may check auth of request here..
    wss.emit('connection', ws, request);
  };
  wss.handleUpgrade(request, socket, head, before_connection);
});

server.listen({ host, port });

console.log(`
╔╗ ┬┌┐   ╦ ╦┬┌─┐  ╔═╗┌─┐┬─┐┬  ┬┌─┐┬─┐
╠╩╗│├┴┐  ╚╦╝│└─┐  ╚═╗├┤ ├┬┘└┐┌┘├┤ ├┬┘
╚═╝┴└─┘   ╩└┘└─┘  ╚═╝└─┘┴└─ └┘ └─┘┴└─
服务运行端口： '${host}', port ${port}`);
