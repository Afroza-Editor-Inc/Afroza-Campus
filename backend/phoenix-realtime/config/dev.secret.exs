import Config

config :afroza, Afroza.Repo,
  username: System.get_env("POSTGRES_USER") || "afroza",
  password: System.get_env("POSTGRES_PASSWORD") || "afroza",
  database: System.get_env("POSTGRES_DB") || "afroza_dev",
  hostname: System.get_env("POSTGRES_HOST") || "localhost",
  show_sensitive_data_on_connection_error: true,
  pool_size: 10
