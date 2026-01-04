defmodule Afroza.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :email, :string
    field :display_name, :string
    field :avatar_url, :string

    timestamps()
  end

  def changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :display_name, :avatar_url])
    |> validate_required([:email])
    |> unique_constraint(:email)
  end
end
