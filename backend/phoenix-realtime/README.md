# Phoenix — Realtime

Rôle: service temps-réel — gestion des WebSockets, Channels, présence, messaging.

Technologies: Elixir, Phoenix

Démarrage (placeholder):
1. Installer Elixir & Erlang
2. `mix deps.get`
3. `mix phx.server`

Communication:
- Expose WebSocket endpoint (/socket) pour clients mobiles
- Publie/consomme events via Redis / PubSub

Exemples d'events & flux:
- Client join: `join("chat:123", %{user_id: "u1"})`
- Envoi message: `push("message:new", %{user_id:"u1", body: "Salut"})` -> broadcast `message:new` à tous
- Presence: tracked via `AfrozaWeb.Presence`
