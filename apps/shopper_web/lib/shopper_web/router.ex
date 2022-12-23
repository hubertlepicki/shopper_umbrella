defmodule ShopperWeb.Router do
  use ShopperWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, {ShopperWeb.LayoutView, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", ShopperWeb do
    pipe_through :browser

    get "/", PageController, :index
    get "/storex_test", PageController, :storex
  end

  # Other scopes may use custom stacks.
  # scope "/api", ShopperWeb do
  #   pipe_through :api
  # end
end
