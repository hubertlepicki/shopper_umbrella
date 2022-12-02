defmodule ShopperWeb.AppChannel do
  use StateChannel

  def join("app:state", _message, socket) do
    {:ok, socket}
  end

  def join(__otherwise, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end
end
