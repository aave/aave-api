import express from 'express';

export default interface ApiInterface {
  init: () => Promise<express.Application>;
}
