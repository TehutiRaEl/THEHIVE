public class GuildManager : NetworkBehaviour {
    public Dictionary<string, Guild> Guilds = new Dictionary<string, Guild>();

    [ServerRpc]
    public void CreateGuildServerRpc(string name, string tag, string leaderId) {
        var guild = new Guild {
            Id = Guid.NewGuid().ToString(),
            Name = name,
            Tag = tag,
            LeaderId = leaderId
        };
        guild.Members.Add(leaderId);
        Guilds.Add(guild.Id, guild);
        SpawnGuildHall(guild);
    }

    [ServerRpc]
    public void ClaimTerritoryServerRpc(string guildId, string leaderId, string territoryId) {
        var guild = Guilds[guildId];
        if (guild.LeaderId != leaderId) return;
        if (!CanClaimTerritory(guild, territoryId)) return;
        guild.Claims.Add(territoryId);
        Clients.TerritoryClaimed(guildId, territoryId);
    }
}
