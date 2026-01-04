defmodule Afroza.Repo do
  use Ecto.Repo,
    otp_app: :afroza,
    adapter: Ecto.Adapters.Postgres
end
