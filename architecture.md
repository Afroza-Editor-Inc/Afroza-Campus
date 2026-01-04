# Architecture technique — Afroza Campus

Résumé: architecture micro-services mono-repo, services découplés par API/queues.

Composants principaux:
- Mobile (React Native) — client principal mobile-first
- Web (Next.js) — extension web et dashboard
- Phoenix — canaux temps réel (WebSocket / Presence pour chat, collaboration)
- NestJS — API REST/GraphQL, règles métier, orchestration
- Go — workers / streaming / notifications haute performance
- Python (FastAPI) — endpoints IA, pipelines data

Communication:
- Services NestJS <-> Phoenix via pub/sub (Redis ou AMQP externe)
- Stockage d'objets compatible S3 pour médias
- PostgreSQL pour données relationnelles, Redis pour cache/session

Notes:
- Cette doc est un point de départ; détailler diagrammes & séquences dans `docs/`.
