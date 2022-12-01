defmodule Shopper.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the PubSub system
      {Phoenix.PubSub, name: Shopper.PubSub}
      # Start a worker by calling: Shopper.Worker.start_link(arg)
      # {Shopper.Worker, arg}
    ]

    Supervisor.start_link(children, strategy: :one_for_one, name: Shopper.Supervisor)
  end
end
