
# SimpAnime-API

Welcome to the Simpanime API! This RESTful API is the backend logic for the website SimpAnime.com


## Features

- User Authentication: Register and login users.
- Anime Details: Fetch detailed information about anime, search for anime, and sources for anime episodes.
- Watchlist Management: Add and remove anime from a user's watchlist.
- Reviews: Add, update, and delete user reviews for anime.
## Run Locally

Clone the project

```bash
  git clone https://github.com/AnkitKumarMitra/SimpAnime-API.git
```

Go to the project directory

```bash
  cd SimpAnime-API
```

Install dependencies

```bash
  npm install
```

Set up environment variables in a .env file(check out .env.example). You will need to define:

```bash
  MONGO_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret

```

Start the server in Dev Mode

```bash
  npm run dev
```

Start the server

```bash
  npm run start
```

## API Reference

### The base end point is

```http
  /simpanime
```

you need to append the below end points to it to use the API.


### Public Routes

#### Get Anime Details by ID

```http
GET /anime/:id
```

| Parameter | Type     | Description                      | Response | Error |
| :-------- | :------- | :------------------------------- | :--------| :-----|
| `id`      | `string` | **Required**. The ID of the anime | Detailed information about the anime | `500 Internal Server Error` if there's an error fetching data |

#### Search Anime by Name

```http
  GET /anime/search
```

| Parameter | Type     | Description                       | Response | Error |
| :-------- | :------- | :-------------------------------- | :--------| :-----
| `q`      | `string` | **Required**. name of anime to fetch | An array of anime objects with fields like id, title, image, type, episodes, status, score, season, and year | ```500 Internal Server``` Error if there's an error fetching data |

#### Get Anime Details by Name

```http
GET /anime/gogo/search
```

| Parameter | Type     | Description                      | Response | Error |
| :-------- | :------- | :------------------------------- | :--------| :-----|
| `q`       | `string` | **Required**. The name of the anime to search | Raw data from the external source | `500 Internal Server Error` if there's an error fetching data |

#### Get Anime by Current Season

```http
GET /anime/season
```

| Parameter | Type     | Description                      | Response | Error |
| :-------- | :------- | :------------------------------- | :--------| :-----|
| None      | None     | Fetches anime for the current season | An array of anime objects with fields like `id`, `title`, `image`, `type`, `episodes`, `status`, `score`, `season`, `year`, and `synopsis` | `500 Internal Server Error` if there's an error fetching data |

#### Get Top Anime for Current Season

```http
GET /anime/season/top
```

| Parameter | Type     | Description                      | Response | Error |
| :-------- | :------- | :------------------------------- | :--------| :-----|
| None      | None     | Fetches top anime for the current season | An array of top anime objects with fields like `id`, `title`, `image`, `type`, `episodes`, and `score`, sorted by score in descending order | `500 Internal Server Error` if there's an error fetching data |

#### Get Recent Anime Uploads

```http
GET /anime/recent-uploads
```

| Parameter | Type     | Description                      | Response | Error |
| :-------- | :------- | :------------------------------- | :--------| :-----|
| `page`    | `number` | **Optional**. Page number for paginated results (default is 1) | Recent uploads data | `500 Internal Server Error` if there's an error fetching data |

#### Get Anime Episode Details

```http
GET /anime/episodes/:id
```

| Parameter | Type     | Description                      | Response | Error |
| :-------- | :------- | :------------------------------- | :--------| :-----|
| `id`      | `string` | **Required**. The ID of the anime episode | Details of the episode | `500 Internal Server Error` if there's an error fetching data |

#### Get Episode Source

```http
GET /anime/get-episode-source/:id
```

| Parameter | Type     | Description                      | Response | Error |
| :-------- | :------- | :------------------------------- | :--------| :-----|
| `id`      | `string` | **Required**. The ID of the anime episode | Sources for the episode | `500 Internal Server Error` if there's an error fetching data |

### Authentication Routes

#### Register User

```http
POST /register
```

| Parameter | Type     | Description                      | Response | Error |
| :-------- | :------- | :------------------------------- | :--------| :-----|
| `fullName`| `string` | **Required**. User's full name   | Success message and JWT token on successful registration | `400 Bad Request` for missing fields or existing email/username, `500 Internal Server Error` for other issues |

#### Login User

```http
POST /login
```

| Parameter | Type     | Description                      | Response | Error |
| :-------- | :------- | :------------------------------- | :--------| :-----|
| `email`   | `string` | **Required**. User's email address | Success message and JWT token on successful login | `400 Bad Request` for missing fields or invalid credentials, `500 Internal Server Error` for other issues |

#### Add to Watchlist

```http
POST /watchlist/add
```

| Parameter | Type     | Description                      | Response | Error |
| :-------- | :------- | :------------------------------- | :--------| :-----|
| `userId`  | `string` | **Required**. The ID of the user  | Success message if anime is added to watchlist | `400 Bad Request` for missing fields, `404 Not Found` if user not found, `500 Internal Server Error` for other issues |

#### Remove from Watchlist

```http
POST /watchlist/remove
```

| Parameter | Type     | Description                      | Response | Error |
| :-------- | :------- | :------------------------------- | :--------| :-----|
| `userId`  | `string` | **Required**. The ID of the user  | Success message if anime is removed from watchlist | `400 Bad Request` for missing fields, `404 Not Found` if user not found, `500 Internal Server Error` for other issues |

#### Add Review

```http
POST /review/add
```

| Parameter | Type     | Description                      | Response | Error |
| :-------- | :------- | :------------------------------- | :--------| :-----|
| `userId`  | `string` | **Required**. The ID of the user  | Success message if review is added | `400 Bad Request` for missing fields or invalid rating, `500 Internal Server Error` for other issues |

#### Update Review

```http
PUT /review/update
```

| Parameter | Type     | Description                      | Response | Error |
| :-------- | :------- | :------------------------------- | :--------| :-----|
| `reviewId`| `string` | **Required**. The ID of the review | Success message if review is updated | `400 Bad Request` for missing fields, `404 Not Found` if review not found, `500 Internal Server Error` for other issues |

#### Delete Review

```http
DELETE /review/delete
```

| Parameter | Type     | Description                      | Response | Error |
| :-------- | :------- | :------------------------------- | :--------| :-----|
| `reviewId`| `string` | **Required**. The ID of the review | Success message if review is deleted | `400 Bad Request` for missing fields, `404 Not Found` if review not found, `500 Internal Server Error` for other issues |

## Middleware

The authMiddleware is used to protect routes that require authentication. It checks for a valid JWT token in the request cookies.