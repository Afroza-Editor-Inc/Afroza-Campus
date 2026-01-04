defmodule Afroza.Application do
  @moduledoc false

  use Application

  def start(_type, _args) do
    children = [
      # Start the PubSub system
      {Phoenix.PubSub, name: Afroza.PubSub},
      # Start Repo
      Afroza.Repo,
      # Start Presence
      AfrozaWeb.Presence,
      # Start the Endpoint (http/https)
      AfrozaWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: Afroza.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
