# tier3/ipfs_pubsub

IPFS PUBSUB — Sovereign Hive v11.0 Tier 3

## Classes

- `IPFSClient` — Wraps IPFS HTTP API.
- `HDMessageEncoder` — Encode/decode pubsub messages as HD vectors.
- `ChannelRegistry` — Manage pubsub channels for colonies and guilds.
- `PubSubBroker` — Publish/subscribe broker.
- `ColonyFederation` — Manages cross-colony communication.

## Functions

- `encode()` — Encode a message as HD vector + JSON metadata.
- `decode()`
- `similarity()`
- `create()` — Create or retrieve channel for a colony.
- `get()`
- `list_channels()`
- `subscribe()`
- `unsubscribe()`
- `subscribers()`
- `unsubscribe()`
- `get_messages()`
- `get_peer_colonies()` — List other colonies the given colony is aware of.

## Links

[[core.config]]
