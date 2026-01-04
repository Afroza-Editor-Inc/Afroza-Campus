defmodule AfrozaWeb.Presence do
  use Phoenix.Presence,
    otp_app: :afroza,
    pubsub_server: Afroza.PubSub
end
