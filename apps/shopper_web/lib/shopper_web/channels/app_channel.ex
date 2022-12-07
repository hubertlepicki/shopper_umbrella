defmodule ShopperWeb.AppChannel do
  use StateChannel

  @impl Phoenix.Channel
  def join("app:state", _message, socket) do
    {:ok, socket |> assign(:state, init_state())}
  end

  @impl Phoenix.Channel
  def join(__otherwise, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  @impl StateChannel
  defp init_state() do
    %{
      "list" => []
    }
  end

  @impl StateChannel
  def on_message("seed", value, socket) do
    items =
      Enum.map(1..value, fn i -> %{"id" => i, "title" => "Item #{i}", "purchased" => false} end)

    socket
    |> patch_state(:replace, "/list", items)
  end

  @impl StateChannel
  def on_message("new_item:save", value, socket) do
    if socket.assigns.state["new_item"]["error"] == nil do
      socket
      |> patch_state(:remove, "/new_item")
      |> patch_state(:add, "/list/-", save_new_item(socket.assigns.state))
    else
      socket
    end
  end

  @impl StateChannel
  def on_message("new_item_title:changed", value, socket) do
    socket
    |> patch_state(:replace, "/new_item", %{"title" => value, "error" => maybe_error(value)})
  end

  @impl StateChannel
  def on_message("toggle_new_item", _, %{assigns: %{state: %{"new_item" => _}}} = socket) do
    socket
    |> patch_state(:remove, "/new_item")
  end

  @impl StateChannel
  def on_message("toggle_new_item", _, socket) do
    socket
    |> patch_state(:add, "/new_item", %{"title" => "", "error" => nil})
  end

  @impl StateChannel
  def on_message("toggle_purchased", value, socket) do
    item_index = socket.assigns.state["list"] |> Enum.find_index(&(&1["id"] == value))
    current_item = socket.assigns.state["list"] |> Enum.at(item_index)
    new_item = %{current_item | "purchased" => !current_item["purchased"]}

    socket |> patch_state(:replace, "/list/#{item_index}", new_item)
  end

  defp maybe_error(""), do: "can't be blank!"
  defp maybe_error(_), do: nil

  defp save_new_item(%{"new_item" => %{"title" => title}, "list" => list}) do
    max_id = (Enum.map(list, & &1["id"]) ++ [0]) |> Enum.max()

    %{"id" => max_id + 1, "title" => title, "purchased" => false}
  end
end
