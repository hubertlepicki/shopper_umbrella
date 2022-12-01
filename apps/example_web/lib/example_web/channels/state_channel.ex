defmodule StateChannel do
  @callback init_state(socket :: term) :: term
  @callback on_message(key :: term, value :: term, socket :: term) :: term
  @optional_callbacks on_message: 3

  defmacro __using__([channel: channel_name]) do
    quote do
      use Phoenix.Channel
      @behaviour StateChannel

      def join(unquote(channel_name), _message, socket) do
        send(self(), :after_join)
        {:ok, socket
              |> assign(:state, init_state(socket))
              |> assign(:version, 0)
        }
      end

      def join(__otherwise, _params, _socket) do
        {:error, %{reason: "unauthorized"}}
      end

      def handle_info(:after_join, socket) do
        push(socket, "set_state", %{state: socket.assigns.state, version: socket.assigns.version})

        {:noreply, socket}
      end

      def handle_in(key, %{"value" => value, "version" => client_version}, socket) do
        new_socket = socket
                     |> assign(:version, next_version(socket.assigns.version, client_version))


        new_socket = if function_exported?(__MODULE__, :on_message, 3) do
          on_message(key, value, new_socket)
        else
          new_socket
        end

        push(new_socket, "state_diff", %{version: new_socket.assigns.version, diff: JSONDiff.diff(socket.assigns.state, new_socket.assigns.state)})

        {:noreply, new_socket}
      end

      defp next_version(server_version, client_version) do
        if client_version > server_version do
          client_version + 1
        else
          server_version + 2
        end
      end
    end
  end
end
