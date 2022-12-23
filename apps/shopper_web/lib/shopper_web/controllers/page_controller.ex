defmodule ShopperWeb.PageController do
  use ShopperWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end

  def storex(conn, _params) do
    render(conn, "storex.html")
  end
end
