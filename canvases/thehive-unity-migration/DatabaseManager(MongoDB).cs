public class DatabaseManager : MonoBehaviour {
    public static DatabaseManager Instance { get; private set; }
    private IMongoDatabase _database;

    public void Initialize(string connectionString, string databaseName) {
        var client = new MongoClient(connectionString);
        _database = client.GetDatabase(databaseName);
    }

    public async Task<PlayerData> GetPlayerData(string playerId) {
        var collection = _database.GetCollection<PlayerData>("players");
        return await collection.Find(p => p.Id == playerId).FirstOrDefaultAsync();
    }

    public async Task UpdatePlayerData(PlayerData player) {
        var collection = _database.GetCollection<PlayerData>("players");
        await collection.ReplaceOneAsync(p => p.Id == player.Id, player);
    }
}
