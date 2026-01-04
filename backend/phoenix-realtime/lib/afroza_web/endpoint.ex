defmodule AfrozaWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :afroza

  socket "/socket", Phoenix.Socket,
    websocket: true,
    longpoll: false

  plug Plug.Static,
    at: "/",
    from: :afroza,
    gzip: false

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Jason

  plug Plug.RequestId
  plug Plug.Logger

  plug :match
  plug :dispatch
end
