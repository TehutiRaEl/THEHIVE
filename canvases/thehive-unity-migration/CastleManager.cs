public class CastleManager : NetworkBehaviour {
    public Dictionary<string, Castle> Castles = new Dictionary<string, Castle>();

    [ServerRpc]
    public void BuildCastleServerRpc(string guildId, string leaderId, Vector3 position, CastleType type) {
        var guild = GuildManager.Instance.Guilds[guildId];
        if (guild.LeaderId != leaderId) return;
        if (!CanBuildCastle(guild, type)) return;

        var castle = new Castle {
            Id = Guid.NewGuid().ToString(),
            Name = \$"{guild.Name}'s {type}",
            GuildId = guildId,
            Position = position,
            Type = type,
            Level = 1,
            Health = 1000 * (int)type,
            MaxHealth = 1000 * (int)type
        };

        Castles.Add(castle.Id, castle);
        guild.CastleId = castle.Id;
        SpawnCastle(castle);
    }
}
