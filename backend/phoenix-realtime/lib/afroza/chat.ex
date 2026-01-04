defmodule Afroza.Chat do
  @moduledoc "Chat context: persistence and queries for messages"
  import Ecto.Query, warn: false
  alias Afroza.Repo
  alias Afroza.Chat.Message

  def list_messages(room_id, limit \ 50) do
    Message
    |> where([m], m.room_id == ^room_id)
    |> order_by([desc: :inserted_at])
    |> limit(^limit)
    |> Repo.all()
  end
end
