[Serializable]
public abstract class Entity : NetworkBehaviour {
    [SyncVar] public string Id;
    [SyncVar] public string Name;
    [SyncVar] public Vector3 Position;
    // ...
}

public class Player : Entity {
    [SyncVar] public string UserId;
    [SyncVar] public int Level;
    [SyncVar] public int Health;
    public CharacterController Controller;
    public Animator Animator;
    [Command] public void CmdMove(Vector3 direction) { /* ... */ }
    [Command] public void CmdUseSkill(string skillId, string targetId) { /* ... */ }
}

public class NPC : Entity {
    [SyncVar] public string NpcId;
    [SyncVar] public string Faction;
    public NavMeshAgent Agent;
    public NPCStateMachine StateMachine;
}
