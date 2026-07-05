"""
Unit tests for IPFS PubSub module
"""

import pytest
import asyncio
from backend.tier3.ipfs_pubsub import (
    ChannelRegistry, PubSubBroker, HDMessageEncoder, ColonyFederation
)

class TestHDMessageEncoder:
    def test_encode_decode(self):
        encoder = HDMessageEncoder()
        payload = {"task": "colony_survey", "score": 0.87}
        data = encoder.encode("colony_event", "ORACLE", payload)
        decoded = encoder.decode(data)
        assert decoded["meta"]["topic"] == "colony_event"
        assert decoded["meta"]["sender"] == "ORACLE"
        assert decoded["payload"]["task"] == "colony_survey"
        assert "hd_vector" in decoded

class TestChannelRegistry:
    def test_create_channel(self):
        registry = ChannelRegistry()
        cid = registry.create("UNIT_TEST_COLONY", "Test description")
        # channel id format: hive-<slug>-<hex>
        assert cid.startswith("hive-")
        assert len(cid) > 10

    def test_get_channel(self):
        registry = ChannelRegistry()
        cid = registry.create("UNIT_TEST_COLONY_2")
        retrieved = registry.get("UNIT_TEST_COLONY_2")
        assert retrieved == cid

    def test_subscribe(self):
        registry = ChannelRegistry()
        cid = registry.create("UNIT_TEST_COLONY_3")
        # subscribe() stores to DB; should not raise
        registry.subscribe(cid, "ECHO")
        # get() confirms the channel exists
        retrieved = registry.get("UNIT_TEST_COLONY_3")
        assert retrieved == cid

class TestPubSubBroker:
    @pytest.mark.asyncio
    async def test_publish_subscribe(self):
        broker = PubSubBroker()
        await broker.init()
        cid = "test-channel-unit-001"

        received = []
        async def on_message(msg):
            received.append(msg)

        await broker.subscribe(cid, "TEST_AGENT", callback=on_message)
        result = await broker.publish(cid, "SENDER", "test_topic", {"key": "value"})

        assert result["published"] is True
        assert result["channel"] == cid
        await asyncio.sleep(0.1)
        assert len(received) > 0

    def test_get_messages(self):
        broker = PubSubBroker()
        messages = broker.get_messages("test-channel-unit-001", limit=5)
        assert isinstance(messages, list)

class TestColonyFederation:
    @pytest.mark.asyncio
    async def test_announce_colony(self):
        federation = ColonyFederation()
        result = await federation.announce_colony(
            "GAMMA_COLONY_UNIT", "http://gamma:8080", "ipfs://abc123"
        )
        assert result["published"] is True
        # actual key is "channel" not "channel_id"
        assert "channel" in result
