defmodule Afroza.Chat.Message do
  use Ecto.Schema
  import Ecto.Changeset

  schema "messages" do
    field :room_id, :string
    field :user_id, :string
    field :body, :string

    timestamps()
  end

  def changeset(message, attrs) do
    message
    |> cast(attrs, [:room_id, :user_id, :body])
    |> validate_required([:room_id, :user_id, :body])
  end
end
