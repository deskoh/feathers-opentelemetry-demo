import './tracing';
import app from './app';

// Start the server
app.listen(3030).then(() =>
  console.log('Feathers server listening on localhost:3030')
);

// For good measure let's create a message
// So our API doesn't look so empty
app.service('messages').create({
  text: 'Hello world from the server'
});
