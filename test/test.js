process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
// const app = require('../app');
// const db = require('../app/db');

chai.use(chaiHttp);
// const { expect } = chai;

describe('Enterprise portal', () => {
  it.skip('Needs tests');
});
