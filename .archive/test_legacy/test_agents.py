import pytest
import asyncio
from backend.database import Database, init_db_sync

@pytest.fixture
def db():
    return Database(":memory:")

@pytest.mark.asyncio
async def test_create_agent(db):
    await db._init_tables()
    await db.create_agent("TestAgent", "Test description")
    agents = await db.list_agents()
    assert len(agents) == 1
    assert agents[0]["name"] == "TestAgent"

@pytest.mark.asyncio
async def test_agent_status_update(db):
    await db._init_tables()
    await db.create_agent("TestAgent", "Test")
    await db.update_agent_status("TestAgent", "dormant")
    agents = await db.list_agents()
    assert agents[0]["status"] == "dormant"

@pytest.mark.asyncio
async def test_delete_forbidden(db):
    await db._init_tables()
    await db.create_agent("TestAgent", "Test")
    with pytest.raises(ValueError):
        await db.update_agent_status("TestAgent", "deleted")
