defmodule AfrozaWeb.ChatChannel do
  use Phoenix.Channel
  alias AfrozaWeb.Presence

  @moduledoc """
  Channel simple pour messagerie.

  Events:
  - "message:new" -> payload %{user_id, body, metadata}
  - "presence:join" / "presence:leave" -> managed via Presence
  """

  def join("chat:" <> _room_id, %{"user_id" => user_id}, socket) do
    send(self(), {:after_join, user_id})
    {:ok, socket}
  end

  def handle_info({:after_join, user_id}, socket) do
    Presence.track(socket, user_id, %{online_at: System.system_time(:second)})
    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  def handle_in("message:new", payload = %{"user_id" => user_id, "body" => body, "metadata" => _meta}, socket) do
    # Persist message
    %Afroza.Chat.Message{}
    |> Afroza.Chat.Message.changeset(%{room_id: socket.topic, user_id: user_id, body: body})
    |> Afroza.Repo.insert()

    broadcast!(socket, "message:new", payload)
    {:noreply, socket}
  end
end
