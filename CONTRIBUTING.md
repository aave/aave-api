# Contributing

## How to run

```bash
docker-compose up
```

## How to access the data

[http://localhost:3000/data/rates-history?reserveId=<reserveId>&resolutionInHours=<resolution>](http://localhost:3000/data/rates-history?reserveId=0x0d500b1d8e8ef31e21c99d1db9a6444d3adf12700xd05e3e715d945b59290df0ae8ef85c1bdb684744&resolutionInHours=6) - to access rates history

## Environment parameters

### General

    PORT - the port for the api, default 3000
    MONGO_URL - mongodb uri, default mongodb://mongodb:27017/aave
    THE_GRAPH_URI - aave v2 compatible thegraph uri
