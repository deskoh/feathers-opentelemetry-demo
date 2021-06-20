import { feathers } from '@feathersjs/feathers';
import '@feathersjs/transport-commons';
import * as express from '@feathersjs/express';
import socketio from '@feathersjs/socketio';

import MessageService from './services/messages';
import UserService from './services/users';
import opentelemetry from './opentelemetry';

// Creates an ExpressJS compatible Feathers application
const app = express.default(feathers());

// Express middleware to parse HTTP JSON bodies
app.use(express.json());
// Express middleware to parse URL-encoded params
app.use(express.urlencoded({ extended: true }));
// Add REST API support
app.configure(express.rest());
// Configure Socket.io real-time APIs
app.configure(socketio());

// Configure opentelemetry
app.configure(opentelemetry());

// Register our services
app.configure(MessageService());
app.configure(UserService());

// Express middleware with a nicer error handler
app.use(express.errorHandler());

// Add any new real-time connection to the `everybody` channel
app.on('connection', connection =>
  app.channel('everybody').join(connection)
);
// Publish all events to the `everybody` channel
app.publish(data => app.channel('everybody'));

export default app;
