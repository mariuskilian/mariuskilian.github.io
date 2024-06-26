<br>

<div class="centered wide banner shadow">
  <img src="resources/writeups/poke-arena/banner.gif" alt="Banner">
</div>

This project, titled Poké-Arena, is the combination of my love for auto-battler games, such as [Auto Chess](https://ac.dragonest.com/en) or [Teamfight Tactics](https://teamfighttactics.leagueoflegends.com/en-gb/), and [Pokémon](https://www.pokemon.com/uk) games from my childhood. I realized that Pokémon and their natural traits and evolution mechanic would be very well suited for the genre, and started working on my own version of it. It is the biggest project I've attempted by myself, which is why this write-up is rather long, even though I still tried to only pick out the interesting bits.

<details>
  <summary>
    <h2>Background</h2>
  </summary><br>

This project started from a passion for the underlying games and genres, as well as for game development. Due to licensing issues this would create with the Pokémon trademark, I never intended to publish this game, and always saw it more as a hobby project and learning experience.

I knew from the start that this would be an ambitious project, but ambitious was just the start of it. After weeks of preparing the core mechanics, code and systems infrastructure, and the base visuals, which included a tedious process of importing 3D models from my own [Pokémon Sun](https://www.pokemon.com/us/pokemon-video-games/pokemon-sun-and-pokemon-moon/) game, I decided to add multiplayer functionality.

As this was something I had never tackled before, and I wanted to make as good of a multiplayer experience as possible, preventing common methods of cheating, this required a complete refactoring of most of the code. While I'm still happy to have done it in this order, the process of converting the existing codebase to include multiplayer took about as long as making the original code.

<hr></details>

<details>
  <summary>
    <h2>Netcode</h2>
  </summary><br>

To get started on the netcode, something I had never tackled before this project, I researched different multiplayer engines for Unity, and ended up settling on the [Photon Multiplayer Engine](https://www.photonengine.com), specifically [Photon Bolt](https://doc.photonengine.com/bolt/current/getting-started/overview#) (now [Photon Fusion](https://doc.photonengine.com/fusion/current/getting-started/fusion-intro)). As a native Unity Asset, this offered great functionality for creating true multiplayer games, such as matchmaking, server & client separation, an authoritative server with client-side prediction, and more.

I looked into what makes good netcode, and quickly decided on a fully separate server to host the game and handle all gameplay logic, while clients would only act as a window to the current state of the game and as a UI for the users. Other options included having one of the clients be a server, which allows a malevolent client to be able to modify the game and cheat to give themselves an advantage. A dedicated server could still be hosted by a player of the game as a separate application to the client application, but would also allow external hosting where modifications become impossible.

```cs
[BoltGlobalBehaviour]
[BoltGlobalBehaviour(BoltNetworkModes.Server)]
[BoltGlobalBehaviour(BoltNetworkModes.Client)]
```

Either of the above lines above can be added as an annotation just before a class declaration to allow Bolt to automatically create an instance of the class which lives together with Bolt. Adding `BoltNetworkModes.Server` or `BoltNetworkModes.Client` as a parameter makes such an instance only be created on the Server or Client, respectively. Omitting it instantiates it on both Server and Client.

<img src="resources/writeups/poke-arena/netcode-basic.gif" alt="Netcode Example" class="centered banner shadow">

This clip shows an example of two clients running through Bolt's built-in debug mode, allowing multiple windows to run as server or clients, as desired. In this example, the two visible clients are direct opponents, meaning they share a board. Purchasing a unit on one client can be seen on the opposite end of the other client's screen. All actions, including evolutions and their animations, trigger on all clients.

<details open>
  <summary>
    <h2>Client-Side Prediction</h2>
  </summary><br>

The netcode also features client-side prediction. While a game like this does not require highly complex client-side prediction, it can still provide a smoother user experience in some cases. For example, when a player picks up a unit to place it somewhere else on the board, that action should be instantly reflected, and shouldn't first have to be confirmed by the server, so that the action remains responsive for the user.

<img src="resources/writeups/poke-arena/netcode-client-side-prediction.gif" alt="Netcode Example" class="centered banner shadow">

This clip shows exactly that, where a unit that is picked up is handled immediately on the client. Only when the unit is placed on a slot on the board, does the server get involved, confirming whether the move is possible, before updating all clients. This also works for swapping two units' places, as also seen in the clip. All these positional updates are received and shown by the other client(s) as well.

</details>

<hr></details>

<details>
  <summary>
    <h2>Manager Classes</h2>
  </summary><br>

I decided to go with a number of manager classes to handle general gameplay logic, such as [`InputMan`], [`UIMan`] or more niche ones like [`PlayerEvolutionMan`]. These are mostly classes of which only one instance is necessary, which is why I opted to implement them using the [Singleton Design Pattern](https://en.wikipedia.org/wiki/Singleton_pattern), which limits the number of instances of the class to one, while allowing global access to the instance. This was particularly useful in combination with the heavy use of events in this project, as subscribing to events from these manager classes could now be performed seamlessly.

<details open>
  <summary>
    <h3>Naming and Hierarchy</h3>
  </summary><br>

The manager classes having the `Player` prefix are all scripts that are run server-side with one instance per player, and are components of Player game objects in Unity. For example, in an 8-player game, the server holds 8 instances of [`PlayerLevelMan`], 8 instances of [`PlayerFinanceMan`], 8 instances of [`PlayerBoardMan`], and so forth. All of these managers inherit from the [`PlayerManager`] class, which provides simple common functionality _(the inheritance from `GlobalEventListener` is due to the Photon Bolt Framework, explained in the [Global Events](#event-system/global-events) section)_.

<div class="code-snippet" csname="PlayerManager.cs"><a target="_blank" href="https://github.com/mariuskilian/Poke-Arena/blob/master/Assets/Scripts/Server/PerPlayer/PlayerManager.cs">⠀</a></div>

```cs
public class PlayerManager : GlobalEventListener {
  protected Player player;

  protected void Awake() { player = GetComponent<Player>(); }

  public bool IsThisPlayer(BoltConnection connection) {
    return player.Connection == connection;
  }
}
```

</details>

<hr></details>

<details>
  <summary>
    <h2>Event System</h2>
  </summary><br>

<details>
  <summary>
    <h3>Local Events</h3>
  </summary><br>

Within the project, many components respond reactively to something another component triggers. For this, I use C# [Actions](https://learn.microsoft.com/en-us/dotnet/api/system.action-1?view=net-7.0), a specific type of [Delegates](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/delegates/) with a `void` return type. This allows a _publisher_ to send out an event, and all _subscribers_ to respond, allowing the publisher to determine the time of the execution, and the subscribers to determine the specific behavior. With the way they are used in this project, nothing needs to be returned since this type of communication is one-way, which is why the `void` return type is enough.

Further, some components need to react to a high variety of different publishers, which is why, throughout the codebase, classes have the method `private void SubscribeLocalEventHandlers()`, which always handles all the subscriptions. This method is inside any component that subscribes to any delegate, in order to keep the code consistent and readable. Here is an example from the class [`UIMan`] (User Interface Manager). The Store UI reacts, for example, to the following:

- Shows at the start of the game
- Needs to update when a unit is caught from the store
- Needs to update on a store refresh (can be manually triggered or is triggered each round)
- Hides while a board unit is selected with the shop opened, and re-shows when that unit is dropped
- User manually showing/hiding the store UI

<div class="code-snippet" csname="UIMan.cs"><a target="_blank" href="https://github.com/mariuskilian/Poke-Arena/blob/f27d920b8b45b620df1d2a126aa1b886bdc6777d/Assets/Scripts/Client/UI/UIMan.cs#L49">⠀</a></div>

```cs
private void SubscribeLocalEventHandlers() {
  var global = ClientGlobalEventMan.Instance;
  global.GameStartEvent += HandleGameStartEvent;
  global.UnitCaughtEvent += HandleUnitCaughtEvent;
  global.NewStoreEvent += HandleNewStoreEvent;

  var selection = SelectionMan.Instance;
  selection.UnitSelectEvent += HandleUnitSelectEvent;
  selection.UnitDeselectOnBoardBenchEvent += HandleUnitDeselectEvent;

  var input = InputMan.Instance;
  input.ToggleStoreEvent += HandleToggleStoreEvent;

  var store = ClientStoreMan.Instance;
  store.UnitArrivedInStoreEvent += HandleUnitArrivedInStoreEvent;
}
```

Each of the `Handle`-methods then respond in the appropriate way. To continue the example of the [`UIMan`] class, these are its `Handle`-methods:

<div class="code-snippet" csname="UIMan.cs"><a target="_blank" href="https://github.com/mariuskilian/Poke-Arena/blob/f27d920b8b45b620df1d2a126aa1b886bdc6777d/Assets/Scripts/Client/UI/UIMan.cs#L66">⠀</a></div>

```cs
private void HandleToggleStoreEvent() { SetStoreActive(!store.activeSelf); }
private void HandleUnitSelectEvent(BoardUnit _) { if (store.activeSelf) SetStoreActive(!(forcedHidden = true)); }
private void HandleUnitDeselectEvent(BoardUnit _u, Vector3 _v, bool _b) { if (forcedHidden) SetStoreActive(!(forcedHidden = false)); }
private void HandleGameStartEvent() { SetStoreActive(true); }
private void HandleUnitArrivedInStoreEvent(StoreUnit _, int storeIdx) { ActivateCatchButton(storeIdx); }
private void HandleUnitCaughtEvent(int storeIdx) { DeactivateCatchButton(storeIdx); }
private void HandleNewStoreEvent(StoreUnit[] _) { for (int idx = 0; idx < PlayerStoreMan.StoreSize; idx++) DeactivateCatchButton(idx); }
```

This is just one of the ways the different components interact each other. The modular approach allows new components to easily come in and subscribe to existing events, for example when adding audio effects. Here, an audio manager could easily subscribe to relevant events to play audio queues at the right times.

<hr></details>

<details>
  <summary>
    <h3>Global Events</h3>
  </summary><br>

<div class="image-container inline-right">
  <img src="resources/writeups/poke-arena/bolt-events.png" alt="Bolt Events UI">
</div>

Some events required communication between two separate instances, generally server to one or more clients, or a client to the server. For these, I used Photon Bolt's event system. For this, I had to first create all necessary events using Bolt's UI within Unity, to then allow Bolt to compile these events into interfaces, which are inherited by the `GlobalEventListener` Bolt class, which is supplied with several methods of type `public virtual void OnEvent`, with a single parameter as the type of event. These `OnEvent` methods then have to be overridden by a class trying to react to the event. This code snippet shows these compiled methods being created:

<a class="clear"></a>

<div class="code-snippet no-link" csname="GlobalEventListener.cs"><a>⠀</a></div>

```cs
public class GlobalEventListener : GlobalEventListenerBase, IStoreNewStoreEventListener, IStoreUnitCaughtEventListener, IClientEventManInitializedEventListener,
  IClientTryCatchUnitEventListener, IClientTryRerollStoreEventListener, IClientUnitDeselectEventListener, IClientTryBuyExpEventListener, IGameStartEventListener
{
  public virtual void OnEvent(StoreNewStoreEvent evnt) { }
  public virtual void OnEvent(StoreUnitCaughtEvent evnt) { }
  public virtual void OnEvent(ClientEventManInitializedEvent evnt) { }
  public virtual void OnEvent(ClientTryCatchUnitEvent evnt) { }
  public virtual void OnEvent(ClientTryRerollStoreEvent evnt) { }
  public virtual void OnEvent(ClientUnitDeselectEvent evnt) { }
  public virtual void OnEvent(ClientTryBuyExpEvent evnt) { }
  public virtual void OnEvent(GameStartEvent evnt) { }
}
```

Classes that wish to send or react to these events need to inherit from `GlobalEventListener`, such as the following example of the [`PlayerLevelMan`], which handles the players experience level. This is a server-side component, with one instance for each player, and inherits from [`PlayerManager`], which, as described in the [Naming and Hierarchy](#manager-classes/naming-and-hierarchy) section, inherits from `GlobalEventListener`, and runs server-side with one instance per player. It receives the global event that a client triggers when attempting to purchase experience points from money, named `ClientTryBuyExpEvent`, and first checks that this instance of [`PlayerLevelMan`] is the one responsible for the player that triggered the event.

<div class="code-snippet" csname="PlayerLevelMan.cs"><a target="_blank" href="https://github.com/mariuskilian/Poke-Arena/blob/f27d920b8b45b620df1d2a126aa1b886bdc6777d/Assets/Scripts/Server/PerPlayer/PlayerManagers/ResourceManagers/PlayerLevelMan.cs#L18">⠀</a></div>

```cs
public override void OnEvent(ClientTryBuyExpEvent evnt) {
  if (!IsThisPlayer(evnt.RaisedBy)) return;
  if (Level == MaxLevel) return;
  if (!player.GetPlayerMan<PlayerFinanceMan>().TryBuyExp()) return;
  AddExp(ExpPerBuy);
}
```

The second guard clause checks whether the player already achieved the maximum level, in which case experience also could no longer be bought. If the guard clause gets passed, the player can attempt to buy experience. However, this is only possible if the player has enough money to buy the experience. Therefore, the method then gets the [`PlayerFinanceMan`], using a custom `GetPlayerMan` method that the player instance has. This allows quick access to any wanted [`PlayerManager`] class. 

The `TryBuyExp()` method of the player's [`PlayerFinanceMan`] class is then called, which attempts to spend the money necessary for buying experience, and returns whether it was successful. If it was successful, the money is already spent, and the experience is added to the player.

Server-side, handling global events is done on a class-by class basis, meaning that they are handled directly in the classes that need to react to the global events. This is, because most global events only trigger individual classes, and don't require a long list of classes to react to events. However, the clients do, which is why it was important to come up with a system to bridge local and global events while keeping the code readable and maintainable.

<hr></details>

<details>
  <summary>
    <h3>Bridging Local and Global Events</h3>
  </summary><br>

A lot of reactions to events happen client-side. For example, as the server updates the game state, it will send out this information as a global event to the clients, which then have to react accordingly, in order to display the correct game state. This includes the units that are in the store, unit repositions, evolutions, some animations and more. This can be for both: units that a given client owns (their own playable units); and other players' units, as all clients should update the positions and state of all players' units. For this, I created a client-side class called [`ClientGlobalEventMan`] to handle the communication between global and local events.

<details open>
  <summary>
    <h4>Global to Local</h4>
  </summary><br>

To handle incoming global Bolt events, each global event is handled, and a local event is invoked, which is then handled normally by the rest of the client codebase. In some cases, some extra steps are taken, like when the `StoreNewStoreEvent` is triggered, receiving the Bolt Entities (entities that exist in the network) with the network IDs passed by the global event (`evnt.UnitX`), to receive the actual units, which are then passed to the local event.

<div class="code-snippet" csname="ClientGlobalEventMan.cs"><a target="_blank" href="https://github.com/mariuskilian/Poke-Arena/blob/f27d920b8b45b620df1d2a126aa1b886bdc6777d/Assets/Scripts/Client/ClientGlobalEventMan.cs#L18">⠀</a></div>

```cs
public Action GameStartEvent;
public Action<StoreUnit[]> NewStoreEvent;
public Action<int> UnitCaughtEvent;

public override void OnEvent(GameStartEvent evnt) { GameStartEvent?.Invoke(); }

public override void OnEvent(StoreNewStoreEvent evnt) {
  StoreUnit[] Units = {
    BoltNetwork.FindEntity( evnt.Unit1 ).GetComponent< StoreUnit >(),
    BoltNetwork.FindEntity( evnt.Unit2 ).GetComponent< StoreUnit >(),
    BoltNetwork.FindEntity( evnt.Unit3 ).GetComponent< StoreUnit >(),
    BoltNetwork.FindEntity( evnt.Unit4 ).GetComponent< StoreUnit >(),
    BoltNetwork.FindEntity( evnt.Unit5 ).GetComponent< StoreUnit >()
  };
  NewStoreEvent?.Invoke(Units);
}

public override void OnEvent(StoreUnitCaughtEvent evnt) { UnitCaughtEvent?.Invoke(evnt.StoreIdx); }
```

</details>

<details open>
  <summary>
    <h4>Local to Global</h4>
  </summary><br>

Local events that need to be sent globally are handled similarly. They are subscribed to as described in the earlier [Local Events](#event-system/local-events) section. Here's the code snippet for this subscription, as a bit of a recap.

<div class="code-snippet" csname="ClientGlobalEventMan.cs"><a target="_blank" href="https://github.com/mariuskilian/Poke-Arena/blob/f27d920b8b45b620df1d2a126aa1b886bdc6777d/Assets/Scripts/Client/ClientGlobalEventMan.cs#L46">⠀</a></div>

```cs
private void SubscribeLocalEventHandlers() {
  var UI = UIMan.Instance;
  UI.TryCatchUnitEvent += HandleTryCatchUnitEvent;

  var input = InputMan.Instance;
  input.TryRerollStoreEvent += HandleTryRerollStoreEvent;
  input.TryBuyExpEvent += HandleTryBuyExpEvent;

  var select = SelectionMan.Instance;
  select.UnitDeselectOnBoardBenchEvent += HandleUnitDeselectEvent;
}
```

Then, each of the `Handle{...}Event` classes does its relevant setup for things the global event needs sent with it, and triggers the relevant global event. Passing the `GlobalTargets.OnlyServer` parameter to the `Create` function means the event is not sent to other clients.

<div class="code-snippet" csname="ClientGlobalEventMan.cs"><a target="_blank" href="https://github.com/mariuskilian/Poke-Arena/blob/f27d920b8b45b620df1d2a126aa1b886bdc6777d/Assets/Scripts/Client/ClientGlobalEventMan.cs#L58">⠀</a></div>

```cs
private void HandleTryCatchUnitEvent(int idx) {
  var evnt = ClientTryCatchUnitEvent.Create(GlobalTargets.OnlyServer);
  evnt.StoreIdx = idx;
  evnt.Send();
}
```

```cs
private void HandleTryRerollStoreEvent() {
  ClientTryRerollStoreEvent.Create(GlobalTargets.OnlyServer).Send();
}
```

```cs
private void HandleTryBuyExpEvent() {
  ClientTryBuyExpEvent.Create(GlobalTargets.OnlyServer).Send();
}
```

```cs
private void HandleUnitDeselectEvent(BoardUnit unit, Vector3 clickPos, bool clickedBoard) {
  var evnt = ClientUnitDeselectEvent.Create(GlobalTargets.OnlyServer);
  evnt.Unit = unit.entity.NetworkId;
  evnt.ClickPosition = clickPos;
  evnt.ClickedBoard = clickedBoard;
  evnt.Send();
}
```

</details>

</details>

<hr></details>

<details>
  <summary>
    <h2>Future Sections</h2>
  </summary><br>

These are some topics I didn't yet have the time to write about and want to add to this page in the future:

- Animations
- Shaders and VFX
- Systems
  - Board & Bench
  - Evolution
  - Unit Pools
- Settings
- Editor Scripts

<hr></details>

<!-- Classes -->

[`PlayerLevelMan`]: https://github.com/mariuskilian/Poke-Arena/blob/master/Assets/Scripts/Server/PerPlayer/PlayerManagers/ResourceManagers/PlayerLevelMan.cs
[`InputMan`]: https://github.com/mariuskilian/Poke-Arena/blob/master/Assets/Scripts/Client/InputMan.cs
[`UIMan`]: https://github.com/mariuskilian/Poke-Arena/blob/master/Assets/Scripts/Client/UI/UIMan.cs
[`PlayerEvolutionMan`]: https://github.com/mariuskilian/Poke-Arena/blob/master/Assets/Scripts/Server/PerPlayer/PlayerManagers/PlayerEvolutionMan.cs
[`PlayerFinanceMan`]: https://github.com/mariuskilian/Poke-Arena/blob/master/Assets/Scripts/Server/PerPlayer/PlayerManagers/ResourceManagers/PlayerFinanceMan.cs
[`PlayerBoardMan`]: https://github.com/mariuskilian/Poke-Arena/blob/master/Assets/Scripts/Server/PerPlayer/PlayerManagers/PlayerBoardMan.cs
[`PlayerManager`]: https://github.com/mariuskilian/Poke-Arena/blob/master/Assets/Scripts/Server/PerPlayer/PlayerManager.cs
[`ClientGlobalEventMan`]: https://github.com/mariuskilian/Poke-Arena/blob/master/Assets/Scripts/Client/ClientGlobalEventMan.cs
