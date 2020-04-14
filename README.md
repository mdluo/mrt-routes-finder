# mrt-routes-finder

Preview: https://mrt-routes-finder.now.sh

### Features

- Asynchronous route searching by Web Workers.
- Travel time calculation and sort routes based on it.
- Informative and good looking time line as route detail component.
- Saving start and end stations in the URL for easy sharing.
- GPS Coordinates for stations and collecting and displaying routes on the map.
- Unit test with Jest and end to end test with Cypress, and coverage merging.

### Setup

- `cp .env.example .env`
- Create a new Google Map API key
- Fill in `.env` with the API key
- `yarn start`

### Test and Coverage

- `yarn cover:jest`: Run Jest with coverage collection.
- `yarn start`: Start the web server for e2e test with Cypress.
- `yarn cover:cypress`: Run Cypress tests.
- `yarn cover`: Merge Jest and Cypress results, and generate coverage reports.
