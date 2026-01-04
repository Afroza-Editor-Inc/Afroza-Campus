# API — Afroza Campus

Cette documentation contient une vue d'ensemble des APIs exposées par le monorepo.

GraphQL (NestJS)
- Endpoint principal: `POST /graphql`
- Queries: `health`, `user(id)`, `feed` (placeholder)
- Mutations: `register`, `login`, `createPost` (placeholder)

REST (admin / internal)
- `POST /auth/register` — créer un compte
- `POST /auth/login` — login (JWT)

Realtime (Phoenix Channels)
- Socket endpoint: `ws://<host>:4001/socket`
- Channels: `chat:<room_id>`
- Events: `message:new`, `presence:update` (payload contract documented in channel files)

IA (FastAPI)
- `POST /api/moderate` — modération automatique (mock)
- `GET /api/recommendations` — recommandations (mock)

Auth (REST)
- `POST /auth/register` -> {email, password, displayName?} -> {id, email}
- `POST /auth/login` -> {email, password} -> {token}

Posts (GraphQL)
- Query `feed(limit:Int)` -> [Post]
- Mutation `createPost(authorId, content, mediaUrl)` -> postId

Realtime (Phoenix Channels)
- Channel `chat:<room_id>`
  - join payload: `%{user_id: string}`
  - push `message:new` payload: `%{user_id, body, metadata}` -> broadcast `message:new`
  - presence: `presence_state` / `presence_diff`

Notes:
- Les contrats doivent être complétés durant l'implémentation.
