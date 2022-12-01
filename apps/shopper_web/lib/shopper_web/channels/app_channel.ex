defmodule ShopperWeb.AppChannel do
  use StateChannel, channel: "app:state"

  @impl StateChannel
  def init_state(_socket) do
    %{
      text_input: ""
    }
  end

  @impl StateChannel
  def on_message("text_input:changed", new_text, socket) do
    socket 
    |> assign(:state, %{socket.assigns.state | text_input: String.downcase(new_text || "")})
  end
end
