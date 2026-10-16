# movemeFrontend

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## MoveMe frontend

Vue 3 + Pinia + Vue Router + Tailwind + PrimeVue (toasts). Talks to the Express backend.

Setup: `cp .env.example .env` (set `VITE_API_BASE_URL`), `npm install`, `npm run dev`.

### API contract the UI expects (Bearer token auth, JSON, errors as `{ message, errors? }`)

- `POST /api/auth/register|login` → `{ token, user:{id,name,email,role} }`; `POST /api/auth/logout`; `GET /api/auth/me`
- `GET /api/routes` → `[{id,pickup,dropoff,durationMinutes}]`
- `GET /api/departures?routeId&mode=solo|pooled&when=immediate|scheduled&date` → `[{id,route,departureTime,driver:{name},mode,fare,capacity,availableSeats}]`
- `POST /api/bookings {departureId}` (header `Idempotency-Key`) → booking; `GET /api/bookings` → `[{id,status,fare,expiresAt,refund,departure:{departureTime,status,mode,route,driver}}]`
- `POST /api/bookings/:id/pay {outcome:'success'|'failure'}` (Idempotency-Key); `POST /api/bookings/:id/cancel`
- Booking statuses: `pending_payment|confirmed|cancelled|expired|failed`; departure statuses: `scheduled|arrived|in_progress|completed|cancelled`
- `GET /api/notifications`, `POST /api/notifications/:id/read`
- Driver: `GET|PUT /api/driver/vehicle` (`{description,registration,capacity,driverEnabled}`), `GET|POST /api/driver/departures` (`{routeId,departureTime,mode}`), `POST /api/driver/departures/:id/(arrive|start|complete|cancel)`, `GET /api/driver/departures/:id/passengers` → `[{bookingId,name,status}]`
- Admin: `GET|POST /api/admin/routes`, `PATCH /api/admin/routes/:id` (`{pickup,dropoff,durationMinutes,soloFare,seatFare}`), `GET /api/admin/drivers`, `PATCH /api/admin/drivers/:id {enabled}`, `GET|POST /api/admin/issues`, `PATCH /api/admin/issues/:id {status}`
