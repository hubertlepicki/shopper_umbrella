defmodule ExampleWeb.AppChannel do
  use Phoenix.Channel

  def join("app:state", _message, socket) do
    IO.inspect("Client connected to app:shared AppChannel")
    send(self, :after_join)
    {:ok, socket
          |> assign(:state, init_state())
          |> assign(:version, 0)
    }
  end

  def handle_info(:after_join, socket) do
    push(socket, "set_state", %{state: socket.assigns.state, version: socket.assigns.version})

    {:noreply, socket}
  end

  def handle_in("text_input", %{"value" => new_text, "version" => client_version}, socket) do
    new_socket = socket
                 |> assign(:state, %{socket.assigns.state | text_input: String.downcase(new_text || "")})
                 |> assign(:version, next_version(socket.assigns.version, client_version))

    push(new_socket, "state_diff", %{version: new_socket.assigns.version, diff: JSONDiff.diff(socket.assigns.state, new_socket.assigns.state)})

    {:noreply, new_socket}
  end

  def join(__otherwise, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  defp init_state() do
    %{
      text_input: ""
    }
  end

  defp next_version(server_version, client_version) do
    if client_version > server_version do
      client_version + 1
    else
      server_version + 2
    end
  end
end
