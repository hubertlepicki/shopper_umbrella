defmodule ShopperWeb.AppStore do
  use Storex.Store

  @impl Storex.Store
  def init(_session_id, _params) do
    %{
      "list" => []
    }
  end

  @impl Storex.Store
  def mutation("seed", [value], _session_id, _initial_params, state) do
    IO.inspect(value)
    value = String.to_integer(value)

    items =
      Enum.map(1..value, fn i -> %{"id" => i, "title" => "Item #{i}", "purchased" => false} end)

    {:noreply, %{state | "list" => items}}
  end

  @impl Storex.Store
  def mutation("new_item:save", _, _, _, state) do
    if state["new_item"]["error"] == nil do
      {:noreply,
       %{state | "list" => state["list"] ++ [save_new_item(state)]} |> Map.delete("new_item")}
    else
      {:noreply, state}
    end
  end

  @impl Storex.Store
  def mutation("new_item_title:changed", [value], _, _, state) do
    {:noreply, Map.put(state, "new_item", %{"title" => value, "error" => maybe_error(value)})}
  end

  @impl Storex.Store
  def mutation("toggle_new_item", _, _, _, %{"new_item" => _} = state) do
    {:noreply, Map.delete(state, "new_item")}
  end

  @impl Storex.Store
  def mutation("toggle_new_item", _, _, _, state) do
    {:noreply, Map.put(state, "new_item", %{"title" => "", "error" => nil})}
  end

  @impl Storex.Store
  def mutation("toggle_purchased", [value], _, _, state) do
    items =
      state["list"]
      |> Enum.map(fn item ->
        if item["id"] == value do
          %{item | "purchased" => !item["purchased"]}
        else
          item
        end
      end)

    {:noreply, %{state | "list" => items}}
  end

  defp maybe_error(""), do: "can't be blank!"
  defp maybe_error(_), do: nil

  defp save_new_item(%{"new_item" => %{"title" => title}, "list" => list}) do
    max_id = (Enum.map(list, & &1["id"]) ++ [0]) |> Enum.max()

    %{"id" => max_id + 1, "title" => title, "purchased" => false}
  end
end
