import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :example_web, ExampleWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "X5hU9k/xfWcskLDVT1AQJNr+PIqo6LD6IJqpqMExTR8zS1SK/88cDnmiDaDQMr03",
  server: false

# Print only warnings and errors during test
config :logger, level: :warn

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime
