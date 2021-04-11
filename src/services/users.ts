import { Application } from "@feathersjs/express";

export interface User {
  id: number;
  name: string;
}

// A messages service that allows to create new
// and return all existing messages
class UserService {
  users: User[] = [
    { id: 0, name: 'John Doe' }
  ];

  async find () {
    // Just return all our messages
    return this.users;
  }

  async create (data: Pick<User, 'name'>) {
    const user: User = {
      id: this.users.length,
      name: data.name
    }

    // Add new message to the list
    this.users.push(user);

    return user;
  }
}

export default () => (app: Application) => {
  app.use('users', new UserService());
}
