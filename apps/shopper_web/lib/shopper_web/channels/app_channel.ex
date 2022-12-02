defmodule ShopperWeb.AppChannel do
  use StateChannel

  def join(topic, _message, socket) do
    {:ok, assign(socket, :state, %{text_input: ""})}
  end

  def join(__otherwise, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  @impl StateChannel
  def on_message("text_input:changed", new_text, socket) do
    socket
    |> assign(:state, %{socket.assigns.state | text_input: String.downcase(new_text || "")})
  end
end
