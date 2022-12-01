defmodule ShopperWeb.PageController do
  use ShopperWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
