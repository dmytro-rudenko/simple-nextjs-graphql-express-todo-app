// app.js

const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const cors = require('cors');


// In-memory storage for todos
let todos = [];

// Define GraphQL schema
const schema = buildSchema(`
  type Todo {
    id: ID!
    title: String!
    completed: Boolean!
  }

  type Query {
    todos: [Todo]
    todo(id: ID!): Todo
  }

  type Mutation {
    addTodo(title: String!): Todo
    updateTodo(id: ID!, title: String, completed: Boolean): Todo
    deleteTodo(id: ID!): Boolean
  }
`);

// Define resolvers
const root = {
  todos: () => todos,
  todo: ({ id }) => todos.find(todo => todo.id === id),
  addTodo: ({ title }) => {
    const newTodo = { id: String(todos.length + 1), title, completed: false };
    todos.push(newTodo);
    return newTodo;
  },
  updateTodo: ({ id, title, completed }) => {
    const todo = todos.find(todo => todo.id === id);
    if (!todo) return null;
    if (title !== undefined) todo.title = title;
    if (completed !== undefined) todo.completed = completed;
    return todo;
  },
  deleteTodo: ({ id }) => {
    const index = todos.findIndex(todo => todo.id === id);
    if (index === -1) return false;
    todos.splice(index, 1);
    return true;
  },
};

const app = express();

app.use(cors());

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true, // Enable GraphiQL interface for testing
}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/graphql`);
});