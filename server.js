#!/usr/bin/env node

const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const { yDocToProsemirrorJSON } = require('y-prosemirror');

const wss = new WebSocket.Server({ noServer: true });
const { setupWSConnection, getYDoc } = require('./utils.js');
const app = express();

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 2048;

app.get('/ydoc/:name', (req, resp) => {
  const docName = req.params.name;
  const yDocByName = getYDoc(docName, false);
  const docJson = yDocToProsemirrorJSON(yDocByName, docName);

  resp.json({
    responseOk: true,
    message: '获取 Ydoc 成功',
    data: JSON.stringify(docJson)
  });
})

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
Running at '${host}', port ${port}...`
);
