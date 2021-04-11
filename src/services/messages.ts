import { Application } from "@feathersjs/express";

import hooks from './messages.hook';

// This is the interface for the message data
export interface Message {
  id: number;
  text: string;
}

// A messages service that allows to create new
// and return all existing messages
class MessageService {
  messages: Message[] = [];

  constructor(private app: Application) {
  }

  async find () {
    // Trigger child trace
    this.app.service('users').find();
    // Just return all our messages
    return this.messages;
  }

  async create (data: Pick<Message, 'text'>) {
    // The new message is the data text with a unique identifier added
    // using the messages length since it changes whenever we add one
    const message: Message = {
      id: this.messages.length,
      text: data.text
    }

    // Add new message to the list
    this.messages.push(message);

    return message;
  }
}

export default () => (app: Application) => {
  app.use('messages', new MessageService(app));

  app.service('messages').hooks(hooks);
}
