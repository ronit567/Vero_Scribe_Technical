# Vero — Patient Booking + Physician Console

Two browser apps that talk to each other through the same `localStorage`. All physician & paitent information is just LLM mock data

## Run it

No build step — Open two tabs **on the same origin** so the localStorage bus works.

```bash
cd Vero_Scribe_Technical
python3 -m http.server 8000     # or: npx serve .
```


- Patient: <http://localhost:8000/Patient%20Booking.html>
- Physician: <http://localhost:8000/Physician%20Console.html>


> Bookings are wiped on every page reload (`localStorage.removeItem` at the top of [shared/store.js](shared/store.js)). Open the physician tab **first**, then submit from the patient tab — the queue updates live.


## What I built

**Patient side** — find a physician from the list, pick a time they are available, fill out an intake form, review, submit. In the "Visits" tab, you can check for upcoming/past appointments with Withdraw and Reschedule flows. The reschedule flow reuses the same date/time picker as the original booking and routes a rescheduled request back to `pending` for office re-confirmation.

**Physician console** — Admin UI with a sidebar (some status filters), stat cards (pending / today / this week / confirmed), quick filters, search, sort by submitted/appointment/severity, and a queue + detail pane. Confirm or decline writes a status update and appends an audit event to the booking.

Any/all appointments made on the patient side are directly sent to the admin panel for approval, and all status updates are visible in real time, whether they come from the patient side (such as cancellations) or the admin side (such as approvals).

Some elements that were added are UI buttons without functions, included purely for UI design purposes.

## Key decisions

A lot of key decisions were made when choosing infrastructure (production vs. just a take home)

- **Two `<script>` tags, no bundler.** Babel always compiles JSX in the browser, and files share code using global window variables. I did this so it avoids a whole build setup and keeps things simple as I want to give you guys an easy way to preview a pretty simple app setup. But this of course lacks type safety and adds a small load-time delay, so it wouldn’t be ideal for production.

- **localStorage used as a lightweight pub/sub system.** Since the browser’s built-in storage event only works across tabs, a custom window event is also fired on every write so updates work in the same tab too. Both the patient and physician views listen to these events by a `Store.subscribe(setBookings)` handler that is in [shared/store.js](shared/store.js), it keeps data synced across all views.

- **No strict data structure.** There’s no central definition of what a booking should look like — the shape is just whatever the form happens to save. Everywhere else in the app, when something reads a booking, it uses safe-access operators (`?.` and `??`) so that if a field is missing, the app shows a fallback value instead of crashing. The upside is that it’s quick to build and easy to change. The downside is that if the booking shape ever changes, you have to hunt down every place that touches it, because nothing will warn me in advance.

- **Append-only `adminEvents` log.** When a booking’s status changes (for example, from "pending" to "confirmed"), instead of overwriting the old status, we add a new entry to a list — each entry records *what* happened, *when*, and *who* did it (`{ at, action, by? }`). The physician’s timeline view just reads this list from top to bottom to show the booking’s history. This makes it easy to add new event types later and gives you a full audit trail for free, but the list only grows  (it never shrinks) so in a real production app you’d eventually need to archive or trim old entries to keep storage somewhat manageable.

- **Reschedule uses the same screen.** A `rescheduleMode` flag just switches the text and buttons so the same picker works for rescheduling without a separate page. The parent app controls the flow by swapping the `onBack` and `onContinue` handlers, so it’s one component handling both flows without duplication.

## What I'd improve with more time

- **For a real version of this app, I’d use Vite + React + TypeScript (`.tsx` files).** As mentioned earlier, JSX in this project was mainly used to avoid any `npm` installs. Each screen is a single `.jsx` file that you can read top to bottom without chasing imports. Nothing is hidden behind a build step or source map.

  There are obvious downsides like slow load times, no types, no tree-shaking, and no minification—but these only matter if real users are actually using the site.

- **A real backend.** Replace localStorage with AN ACTUAL database (probably Postgres or MongoDB for larger storage needs, because I have the most experience with them) and an API the two apps talk to over HTTP. Use WebSockets for the live updates instead of the localStorage event. That would actually make the app a little more feasible for production, so multiple patients & physicians can use the system at the same time without sharing a browser.

- **TypeScript end to end.** Right now the booking shape lives implicitly in the code that creates it ([patient-facing/app.jsx:101–122](patient-facing/app.jsx#L101-L122)) and every other file just trusts the fields are there. Defining it once as a shared TypeScript type would catch field renames at compile time instead of when something silently shows up empty in the UI.

- **Login/Auth.** Every patient is currently hardcoded as "Bill" ([shared/data.js](shared/data.js)). A real version needs signup, login, and per-user data so each patient only sees their own visits and the physician console knows who's confirming what.

- **Automated tests.** None right now. The most valuable test would be an end-to-end one (Playwright or similar) that submits a booking on the patient side and checks it shows up on the physician side — that round-trip is the whole point of the app, so it should never silently break in production. 

- **Wire up the placeholder buttons.** "More filters", the sort dropdown on browse, "Available this week", "Edit profile", and "Sign out" are visual only, actually add functions to them.

- **Real notifications.** Have the Bell icon have an actual function. Link the app to email or SMS when a booking's status changes.

- **Remove the page-reload reset.** [shared/store.js](shared/store.js) wipes all bookings on every page load so reviewers always start clean. That's just for anyone trying out the demo to be able to cleanly without any messy data they made, in production it would obviously have to go.

